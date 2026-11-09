use crate::dispatch::OpError;
use niuma_core::requirements::RequirementSource;
use serde_json::{Value, json};
use sha2::{Digest, Sha256};
use std::fs::File;
use std::io::Read;
use std::path::{Component, Path};

const MAX_NOTE_BYTES: u64 = 1024 * 1024;
const MAX_SELECTION_BYTES: usize = 64 * 1024;

pub(super) struct Selection {
    pub title: String,
    pub text: String,
    pub source: RequirementSource,
}

pub(super) fn preview(note_path: &str, heading: Option<&str>) -> Result<Selection, OpError> {
    let path = Path::new(note_path);
    if !path.is_absolute() || path.components().any(|part| part == Component::ParentDir) {
        return Err(OpError::invalid("请输入 Obsidian 笔记的绝对路径"));
    }
    let vault = path
        .parent()
        .and_then(|parent| {
            parent
                .ancestors()
                .find(|dir| dir.join(".obsidian").is_dir())
        })
        .ok_or_else(|| OpError::invalid("找不到笔记所在的 Obsidian 库"))?;
    let relative = path.strip_prefix(vault).map_err(OpError::invalid)?;
    read(vault, relative, heading, false)
}

pub(super) fn reread(source: &RequirementSource) -> Result<Selection, OpError> {
    match source {
        RequirementSource::Obsidian {
            vault,
            path,
            heading,
            ..
        } => read(Path::new(vault), Path::new(path), heading.as_deref(), true),
        _ => Err(OpError::invalid("此需求来自群聊")),
    }
}

fn read(
    vault_path: &Path,
    note: &Path,
    heading: Option<&str>,
    registered: bool,
) -> Result<Selection, OpError> {
    let vault = vault_path
        .canonicalize()
        .map_err(|_| OpError::invalid("无法读取 Obsidian 库"))?;
    if !vault.join(".obsidian").is_dir()
        || note
            .components()
            .any(|part| !matches!(part, Component::Normal(_)))
    {
        return Err(OpError::invalid("请选择库内的 Markdown 笔记"));
    }
    let path = vault
        .join(note)
        .canonicalize()
        .map_err(|_| OpError::invalid("找不到指定的 Obsidian 笔记"))?;
    let relative = path
        .strip_prefix(&vault)
        .map_err(|_| OpError::invalid("笔记必须位于原 Obsidian 库内"))?;
    if registered && (vault != vault_path || relative != note) {
        return Err(OpError::invalid("原笔记路径已变化，请由用户重新指定"));
    }
    if relative
        .components()
        .any(|part| part.as_os_str() == ".obsidian")
        || !path
            .extension()
            .and_then(|ext| ext.to_str())
            .is_some_and(|ext| ext.eq_ignore_ascii_case("md"))
        || !path.is_file()
    {
        return Err(OpError::invalid("请选择库内的 Markdown 笔记"));
    }
    let mut note_text = String::new();
    File::open(&path)
        .map_err(|_| OpError::invalid("无法打开指定笔记"))?
        .take(MAX_NOTE_BYTES + 1)
        .read_to_string(&mut note_text)
        .map_err(|_| OpError::invalid("无法读取 UTF-8 笔记"))?;
    if note_text.len() as u64 > MAX_NOTE_BYTES {
        return Err(OpError::invalid("笔记超过 1 MiB，请使用较小的需求笔记"));
    }
    let heading = heading.map(str::trim).filter(|heading| !heading.is_empty());
    let note_text = note_text.trim_start_matches('\u{feff}');
    let text = match heading {
        Some(heading) => select_section(note_text, heading)?,
        None => note_text.trim().to_owned(),
    };
    if text.is_empty() || text.len() > MAX_SELECTION_BYTES {
        return Err(OpError::invalid(
            "导入内容为空或超过 64 KiB，请选择较短的标题小节",
        ));
    }
    let mut digest = Sha256::new();
    digest.update(path.to_string_lossy().as_bytes());
    digest.update([0]);
    digest.update(heading.unwrap_or_default().as_bytes());
    digest.update([0]);
    digest.update(text.as_bytes());
    let source = RequirementSource::Obsidian {
        vault: vault.to_string_lossy().into_owned(),
        path: relative.to_string_lossy().into_owned(),
        heading: heading.map(str::to_owned),
        version: format!("{:x}", digest.finalize()),
    };
    let title = heading
        .or_else(|| path.file_stem().and_then(|stem| stem.to_str()))
        .unwrap_or("Obsidian 需求");
    Ok(Selection {
        title: title.chars().take(160).collect(),
        text,
        source,
    })
}

fn select_section(markdown: &str, title: &str) -> Result<String, OpError> {
    let lines = markdown.lines().collect::<Vec<_>>();
    let mut headings = Vec::new();
    let mut fence = None;
    let mut frontmatter = lines.first() == Some(&"---");
    for (index, line) in lines.iter().enumerate() {
        let text = line.trim_start();
        if frontmatter {
            if index > 0 && matches!(text.trim(), "---" | "...") {
                frontmatter = false;
            }
            continue;
        }
        let marker = text.as_bytes().first().copied().unwrap_or_default();
        let repeated = text.bytes().take_while(|byte| *byte == marker).count();
        if let Some((open, length)) = fence {
            if marker == open && repeated >= length && text[repeated..].trim().is_empty() {
                fence = None;
            }
            continue;
        }
        if line.len() - text.len() > 3 {
            continue;
        }
        if matches!(marker, b'`' | b'~') && repeated >= 3 {
            fence = Some((marker, repeated));
            continue;
        }
        // 下划线式标题也是小节边界，避免将下一个小节一并收录。
        if matches!(marker, b'=' | b'-')
            && repeated == text.trim_end().len()
            && let Some(previous) = index.checked_sub(1).and_then(|line| lines.get(line))
        {
            let name = previous.trim();
            if !name.is_empty() && !name.starts_with(['#', '>', '`', '~', '-', '*', '+']) {
                headings.push((index - 1, if marker == b'=' { 1 } else { 2 }, name));
                continue;
            }
        }
        if marker == b'#'
            && (1..=6).contains(&repeated)
            && text[repeated..].starts_with(char::is_whitespace)
        {
            let mut name = text[repeated..].trim();
            if let Some((prefix, suffix)) = name.rsplit_once(char::is_whitespace)
                && !suffix.is_empty()
                && suffix.bytes().all(|byte| byte == b'#')
            {
                name = prefix.trim_end();
            }
            headings.push((index, repeated, name));
        }
    }
    let matches = headings
        .iter()
        .enumerate()
        .filter(|(_, (_, _, name))| *name == title)
        .collect::<Vec<_>>();
    let [(position, (start, level, _))] = matches.as_slice() else {
        return Err(OpError::invalid(if matches.is_empty() {
            "找不到指定的标题小节"
        } else {
            "笔记有多个同名标题，请指定唯一标题"
        }));
    };
    let end = headings
        .iter()
        .skip(position + 1)
        .find(|(_, next_level, _)| next_level <= level)
        .map(|(line, _, _)| *line)
        .unwrap_or(lines.len());
    Ok(lines[*start..end].join("\n").trim().to_owned())
}

pub(super) fn version(source: &RequirementSource) -> &str {
    match source {
        RequirementSource::Obsidian { version, .. } => version,
        _ => "",
    }
}

pub(super) fn public_source(source: &RequirementSource) -> Value {
    match source {
        RequirementSource::Chat { event_id } => json!({"kind":"chat","event_id":event_id}),
        RequirementSource::Obsidian {
            vault,
            path,
            heading,
            ..
        } => {
            let mut link = url::Url::parse("obsidian://open").expect("固定 Obsidian 链接");
            let name = Path::new(vault)
                .file_name()
                .and_then(|name| name.to_str())
                .unwrap_or_default();
            link.query_pairs_mut()
                .append_pair("vault", name)
                .append_pair("file", path);
            json!({"kind":"obsidian","note":path,"heading":heading,"url":link.as_str()})
        }
    }
}

pub(super) fn same_note(left: &RequirementSource, right: &RequirementSource) -> bool {
    matches!((left, right), (
        RequirementSource::Obsidian { vault: a, path: b, heading: c, .. },
        RequirementSource::Obsidian { vault: x, path: y, heading: z, .. }
    ) if a == x && b == y && c == z)
}
