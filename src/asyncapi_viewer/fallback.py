"""Build-time search fallback: a hidden list of what a document contains.

The viewer renders into a shadow root, so a site search indexer that reads the
built HTML (MkDocs' search plugin, a crawler) never sees operation names. When
``src`` is a local file the build can read, the extension emits a hidden list
of operation headings, channel addresses and message names as light-DOM
children of the ``<asyncapi-viewer>`` element; the viewer removes the list when
it renders. Remote documents are never fetched at build time.

The list reproduces the viewer's own naming rules (``heading`` in the
normalisers) for the common cases; it is an index hint, not a rendering, so
it resolves internal ``$ref`` pointers only and ignores traits and external
files.
"""

from __future__ import annotations

import html
import json
import os
import re
from typing import Any, Dict, List, Optional
from urllib.parse import urlsplit

try:  # PyYAML is optional: MkDocs brings it, plain Python-Markdown users may not have it
    import yaml
except ImportError:  # pragma: no cover - exercised through the tests' monkeypatch
    yaml = None  # type: ignore[assignment]

FALLBACK_ATTR = "data-asyncapi-fallback"
_JSON_START = re.compile(r"^\s*[\[{]")


class FallbackEntry(Dict[str, Any]):
    """``{"heading": str, "address": str | None, "messages": [str, ...]}``."""


def default_file_resolver(src: str) -> Optional[str]:
    """Map ``src`` to a readable local path, relative to the working directory.

    Returns ``None`` for URLs (a scheme or a host) and for files that do not
    exist, so the caller never tries to fetch anything.
    """
    parts = urlsplit(src)
    if not src or parts.scheme or parts.netloc or src.startswith("//"):
        return None
    path = parts.path
    return path if os.path.isfile(path) else None


def parse_document(text: str, path: str) -> Optional[Any]:
    """Parse JSON or, when PyYAML is installed, YAML. ``None`` when YAML cannot be read."""
    if path.lower().endswith(".json") or _JSON_START.match(text):
        return json.loads(text)
    if yaml is None:
        return None
    try:
        return yaml.safe_load(text)
    except yaml.YAMLError as exc:  # not a ValueError; normalise for callers
        raise ValueError(str(exc).replace("\n", " ")) from exc


def _deref(doc: Dict[str, Any], node: Any, depth: int = 0) -> Any:
    """Follow internal ``$ref`` pointers (``#/a/b``).

    External and dangling references resolve to ``None``: the build never reads
    other files, and the viewer skips such items with a problem anyway.
    """
    while isinstance(node, dict) and isinstance(node.get("$ref"), str) and depth < 32:
        ref = node["$ref"]
        if not ref.startswith("#/"):
            return None
        target: Any = doc
        for part in ref[2:].split("/"):
            part = part.replace("~1", "/").replace("~0", "~")
            if not isinstance(target, dict) or part not in target:
                return None
            target = target[part]
        node = target
        depth += 1
    return node


def _str(value: Any) -> Optional[str]:
    return value if isinstance(value, str) and value.strip() else None


def _message_name(doc: Dict[str, Any], key: str, raw: Any) -> str:
    """The viewer shows a message by its component key, else ``name``, else the entry key."""
    ref = raw.get("$ref") if isinstance(raw, dict) else None
    if isinstance(ref, str) and ref.startswith("#/"):
        key = ref.rsplit("/", 1)[-1].replace("~1", "/").replace("~0", "~")
    message = _deref(doc, raw)
    if isinstance(message, dict):
        return _str(message.get("name")) or key
    return key


def _v3_entries(doc: Dict[str, Any], use_address: bool) -> List[FallbackEntry]:
    operations = doc.get("operations") if isinstance(doc.get("operations"), dict) else {}
    entries: List[FallbackEntry] = []
    for key, raw in operations.items():
        op = _deref(doc, raw)
        if not isinstance(op, dict):
            continue
        channel_ref = op.get("channel")
        channel_key = None
        if isinstance(channel_ref, dict) and isinstance(channel_ref.get("$ref"), str):
            channel_key = channel_ref["$ref"].rsplit("/", 1)[-1].replace("~1", "/").replace("~0", "~")
        channel = _deref(doc, channel_ref)
        if not isinstance(channel, dict):
            continue
        address = _str(channel.get("address"))
        heading = (address or channel_key or key) if use_address else (_str(op.get("title")) or key)
        channel_messages = channel.get("messages") if isinstance(channel.get("messages"), dict) else {}
        selected = op.get("messages")
        names: List[str] = []
        if isinstance(selected, list) and selected:
            for item in selected:
                ref = item.get("$ref") if isinstance(item, dict) else None
                msg_key = ref.rsplit("/", 1)[-1] if isinstance(ref, str) else ""
                # An operation message points at a channel message entry; name it through that entry.
                names.append(_message_name(doc, msg_key, channel_messages.get(msg_key, item)))
        else:
            for msg_key, msg in channel_messages.items():
                names.append(_message_name(doc, msg_key, msg))
        entries.append(FallbackEntry(heading=heading, address=address, messages=names))
    return entries


def _v2_entries(doc: Dict[str, Any]) -> List[FallbackEntry]:
    channels = doc.get("channels") if isinstance(doc.get("channels"), dict) else {}
    entries: List[FallbackEntry] = []
    for channel_key, raw in channels.items():
        channel = _deref(doc, raw)
        if not isinstance(channel, dict):
            continue
        for keyword in ("publish", "subscribe"):
            op = channel.get(keyword)
            if not isinstance(op, dict):
                continue
            heading = _str(op.get("operationId")) or f"{keyword} {channel_key}"
            message = _deref(doc, op.get("message"))
            names: List[str] = []
            if isinstance(message, dict) and isinstance(message.get("oneOf"), list):
                for i, item in enumerate(message["oneOf"]):
                    names.append(_message_name(doc, f"{channel_key}-{keyword}-{i}", item))
            elif message is not None:
                names.append(_message_name(doc, f"{channel_key}-{keyword}", op.get("message")))
            entries.append(FallbackEntry(heading=heading, address=channel_key, messages=names))
    return entries


def entries(doc: Any, use_channel_address: bool = False) -> List[FallbackEntry]:
    """Operation headings, channel addresses and message names of a parsed document."""
    if not isinstance(doc, dict):
        return []
    version = str(doc.get("asyncapi", ""))
    if version.startswith("3"):
        return _v3_entries(doc, use_channel_address)
    return _v2_entries(doc)


def render(items: List[FallbackEntry]) -> str:
    """The hidden list as HTML. Empty string when there is nothing to list."""
    if not items:
        return ""
    lines = []
    for item in items:
        parts = [html.escape(item["heading"])]
        if item.get("address"):
            parts.append(f'<span>{html.escape(item["address"])}</span>')
        for name in item.get("messages", []):
            parts.append(f"<span>{html.escape(name)}</span>")
        lines.append(f"<li>{' '.join(parts)}</li>")
    return f'<ul {FALLBACK_ATTR} hidden>{"".join(lines)}</ul>'


def build(path: str, use_channel_address: bool = False) -> str:
    """Read a local document and return the hidden list, or ``""``.

    Raises ``OSError`` or ``ValueError`` (JSON and YAML parse errors are both
    subclasses of it) so the caller can decide how to report them.
    """
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    doc = parse_document(text, path)
    if doc is None:
        return ""
    return render(entries(doc, use_channel_address))
