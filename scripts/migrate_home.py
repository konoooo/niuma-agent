#!/usr/bin/env python3
"""将已停止的旧 CCCC 数据复制到牛马Agent 的新目录。"""

import argparse
import contextlib
import json
import os
import re
import shutil
import tempfile
from pathlib import Path

import yaml


PATH_FIELDS = {'path', 'home', 'home_path', 'workspace_path', 'scope_path', 'root', 'cwd', 'executable', 'cli_path'}
COMMAND_FIELDS = {'command', 'executable', 'cli_path', 'NIUMA_CLI', 'NIUMA_LAUNCHER_PATH'}


@contextlib.contextmanager
def stopped_source(source):
    lock = source / 'daemon' / 'ccccd.lock'
    if not lock.is_file():
        yield
        return
    with lock.open('r+b') as handle:
        try:
            if os.name == 'nt':
                import msvcrt
                msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError as error:
            raise RuntimeError('请先停止正在运行的旧服务，再迁移数据。') from error
        yield


def update_metadata(value, source_paths, destination, old_cli, new_cli, field=''):
    if isinstance(value, dict):
        result = {}
        for key, item in value.items():
            renamed = key
            if isinstance(key, str) and re.fullmatch(r'CCCC_[A-Z0-9_]+', key):
                renamed = 'NIUMA_' + key[5:]
            elif field in {'mcpServers', 'mcp_servers'} and key == 'cccc':
                renamed = 'niuma-agent'
            if renamed in result:
                raise ValueError('旧配置中存在重复的新名称，请先核对配置。')
            result[renamed] = update_metadata(item, source_paths, destination, old_cli, new_cli, renamed)
        return result
    if isinstance(value, list):
        if field == 'command' and value:
            return [update_metadata(value[0], source_paths, destination, old_cli, new_cli, field), *value[1:]]
        return [update_metadata(item, source_paths, destination, old_cli, new_cli) for item in value]
    if not isinstance(value, str) or not isinstance(field, str):
        return value
    if field in COMMAND_FIELDS:
        if old_cli and new_cli and value == str(old_cli):
            return str(new_cli)
        if value == 'cccc' or value == 'cccc.exe':
            return str(new_cli) if new_cli else value.replace('cccc', 'niuma-agent')
    if field in PATH_FIELDS | COMMAND_FIELDS or field.startswith('NIUMA_'):
        for source in source_paths:
            if value == str(source) or value.startswith(str(source) + os.sep):
                return str(destination) + value[len(str(source)):]
    return value


def migrate_home(source, destination, old_cli=None, new_cli=None):
    source_path = Path(os.path.abspath(Path(source).expanduser()))
    source = source_path.resolve(strict=True)
    destination = Path(os.path.abspath(Path(destination).expanduser()))
    if os.path.lexists(destination):
        raise FileExistsError(f'目标数据目录已存在：{destination}')
    if source in destination.resolve().parents:
        raise ValueError('新数据目录须位于旧目录之外。')
    if not (source / '.cccc-rust-v1').is_file() or not (source / 'groups').is_dir():
        raise ValueError('所选路径不是受支持的旧数据目录。')
    with stopped_source(source), tempfile.TemporaryDirectory(prefix='.niuma-migrate-', dir=destination.parent) as work:
        staged = Path(work).resolve() / 'data'

        def exclude_runtime(directory, names):
            # 旧进程的监听地址和锁会随新服务重新生成。
            return {'daemon'} if Path(directory) == source and 'daemon' in names else set()

        shutil.copytree(source, staged, symlinks=True, ignore=exclude_runtime)
        staged.chmod(0o700)
        (staged / 'daemon').mkdir()
        (staged / '.cccc-rust-v1').unlink()
        (staged / '.niuma-agent-rust-v1').write_text('NIUMA Rust home v1\n', encoding='utf-8')

        # 语音分析会话在 daemon 目录下也有需要持久化的记录。
        analyst = Path('daemon/codex_voice_analyst.json')
        if (source / analyst).is_file() and not (source / analyst).is_symlink():
            shutil.copy2(source / analyst, staged / analyst)
        pi_sessions = Path('daemon/pi-analyst/sessions')
        if (source / pi_sessions).is_dir() and not (source / pi_sessions).is_symlink():
            shutil.copytree(source / pi_sessions, staged / pi_sessions, symlinks=True)

        metadata = [staged / name for name in (
            'registry.json', 'settings.yaml', 'settings.json', 'profiles.json',
            'profile-secrets.json', 'state/actor_profiles/profiles.json',
            'state/secrets/codex_voice_analyst.json', 'state/secrets/voice-secretary.json', analyst,
        )]
        metadata.extend(staged.glob('state/secrets/actor_profiles/*.json'))
        metadata.extend(staged.glob('groups/*/state/codex_voice_analyst.json'))
        metadata.extend(staged.glob('groups/*/group.yaml'))
        metadata.extend(staged.glob('groups/*/state/runtime_sessions/*.json'))
        metadata.extend(staged.glob('profiles/*.yaml'))
        for path in metadata:
            if not path.is_file() or path.is_symlink() or staged not in path.resolve().parents:
                continue
            raw = path.read_text(encoding='utf-8')
            original = json.loads(raw) if path.suffix == '.json' else yaml.safe_load(raw)
            updated = update_metadata(original, (source_path, source), destination, old_cli, new_cli)
            if original == updated:
                continue
            if path.suffix == '.json':
                content = json.dumps(updated, ensure_ascii=False, indent=2) + '\n'
            else:
                content = yaml.safe_dump(updated, allow_unicode=True, sort_keys=False)
            path.write_text(content, encoding='utf-8')

        for path in staged.glob('groups/*/prompts/CCCC_*.md'):
            if path.is_symlink() or not path.is_file() or staged not in path.resolve().parents:
                continue
            renamed = path.with_name('NIUMA_' + path.name[5:])
            if os.path.lexists(renamed):
                raise FileExistsError(f'提示词目标文件已存在：{renamed.name}')
            content = path.read_text(encoding='utf-8').replace('mcp__cccc__', 'mcp__niuma_agent__')
            content = content.replace('cccc_', 'niuma_').replace('CCCC_', 'NIUMA_')
            content = re.sub(r'\bCCCC\b', '牛马Agent', content).replace('`cccc`', '`niuma-agent`')
            path.rename(renamed)
            renamed.write_text(content, encoding='utf-8')

        if os.path.lexists(destination):
            raise FileExistsError(f'目标数据目录已存在：{destination}')
        staged.rename(destination)
    return destination


def main():
    parser = argparse.ArgumentParser(description='迁移旧 CCCC 的数据到牛马Agent。')
    parser.add_argument('--from', dest='source', type=Path, default=Path.home() / '.cccc')
    parser.add_argument('--to', dest='destination', type=Path, default=Path.home() / '.niuma-agent')
    parser.add_argument('--old-cli', type=Path)
    parser.add_argument('--new-cli', type=Path)
    args = parser.parse_args()
    result = migrate_home(args.source, args.destination, args.old_cli, args.new_cli)
    print(f'数据已迁移至 {result}')


if __name__ == '__main__':
    main()
