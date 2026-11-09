import json
import tempfile
import unittest
from pathlib import Path

from scripts.migrate_home import migrate_home


class MigrateHomeTest(unittest.TestCase):
    def test_moves_runtime_names_without_rewriting_history(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            old, new = root / '.cccc', root / '.niuma-agent'
            group = old / 'groups' / 'g_test'
            (group / 'prompts').mkdir(parents=True)
            (group / 'state' / 'runtime_sessions').mkdir(parents=True)
            (old / 'daemon').mkdir()
            (old / '.cccc-rust-v1').write_text('CCCC Rust home v1\n')
            (old / 'daemon' / 'ccccd.pid').write_text('1234\n')
            (old / 'daemon' / 'codex_voice_analyst.json').write_text(json.dumps({
                'root': str(old / 'state/codex_voice/analyst-workdir'), 'thread_id': 'voice-thread',
            }))
            sessions = old / 'daemon/pi-analyst/sessions'
            sessions.mkdir(parents=True)
            (sessions / 'conversation.jsonl').write_bytes(b'{}\n')
            profiles = old / 'state/actor_profiles'
            profiles.mkdir(parents=True)
            (profiles / 'profiles.json').write_text(json.dumps({'env': {'CCCC_HOME': str(old)}}))
            (old / 'registry.json').write_text(json.dumps({'groups': {'g_test': {'path': str(group)}}}))
            (group / 'group.yaml').write_text('title: 原有 CCCC 项目\nactors:\n  - id: lead\n    env:\n      CCCC_HOME: ' + str(old) + '\n')
            (group / 'prompts' / 'CCCC_PREAMBLE.md').write_text('请调用 cccc_task，数据在 CCCC_HOME。')
            history = b'{"text":"Keep CCCC in this history", "id":"one"}\n'
            (group / 'ledger.jsonl').write_bytes(history)
            receipt = {'provider_session_id': 'original-session', 'workspace_path': '/projects/cccc'}
            (group / 'state' / 'runtime_sessions' / 'lead.json').write_text(json.dumps(receipt))

            migrate_home(old, new)

            migrated = new / 'groups' / 'g_test'
            self.assertTrue((new / '.niuma-agent-rust-v1').is_file())
            self.assertFalse((new / 'daemon' / 'ccccd.pid').exists())
            analyst = json.loads((new / 'daemon/codex_voice_analyst.json').read_text())
            self.assertEqual(analyst['thread_id'], 'voice-thread')
            self.assertEqual(analyst['root'], str(new / 'state/codex_voice/analyst-workdir'))
            self.assertEqual((new / 'daemon/pi-analyst/sessions/conversation.jsonl').read_bytes(), b'{}\n')
            profile = json.loads((new / 'state/actor_profiles/profiles.json').read_text())
            self.assertEqual(profile['env'], {'NIUMA_HOME': str(new)})
            self.assertEqual(json.loads((new / 'registry.json').read_text())['groups']['g_test']['path'], str(migrated))
            self.assertIn('NIUMA_HOME: ' + str(new), (migrated / 'group.yaml').read_text())
            self.assertIn('原有 CCCC 项目', (migrated / 'group.yaml').read_text())
            self.assertIn('niuma_task', (migrated / 'prompts' / 'NIUMA_PREAMBLE.md').read_text())
            self.assertEqual((migrated / 'ledger.jsonl').read_bytes(), history)
            self.assertEqual(json.loads((migrated / 'state' / 'runtime_sessions' / 'lead.json').read_text()), receipt)
            self.assertTrue((old / '.cccc-rust-v1').is_file())
            with self.assertRaises(FileExistsError):
                migrate_home(old, new)


if __name__ == '__main__':
    unittest.main()
