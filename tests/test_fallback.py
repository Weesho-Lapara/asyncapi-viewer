"""The build-time search fallback (ROADMAP chunk 2.3): a hidden index list for local documents."""

from __future__ import annotations

import json
import re
import textwrap
from pathlib import Path

import markdown
import pytest

from asyncapi_viewer import fallback
from asyncapi_viewer.extension import AsyncAPIViewerExtension
from tests.conftest import MINIMAL_SCHEMA

ROOT = Path(__file__).resolve().parent.parent
EXAMPLES = ROOT / "docs" / "examples"


def render(text: str, warnings_list=None, **config) -> str:
    if warnings_list is not None:
        config["warn"] = warnings_list.append
    return markdown.markdown(text, extensions=[AsyncAPIViewerExtension(**config)])


def inner(out: str) -> str:
    return re.search(r"<asyncapi-viewer [^>]*>(.*?)</asyncapi-viewer>", out, re.S).group(1)


def test_v3_entries_follow_the_viewer_naming_rules():
    items = fallback.entries(fallback.parse_document((EXAMPLES / "orders-v3.yaml").read_text(), "orders-v3.yaml"))
    assert items == [
        {"heading": "emitOrderPlaced", "address": "orders.placed", "messages": ["OrderPlaced"]},
        {"heading": "onOrderShipped", "address": "orders.shipped", "messages": ["OrderShipped"]},
    ]
    # useChannelAddressAsIdentifier makes the address the heading, as in the viewer
    by_address = fallback.entries(fallback.parse_document((EXAMPLES / "orders-v3.yaml").read_text(), "x.yaml"), use_channel_address=True)
    assert [i["heading"] for i in by_address] == ["orders.placed", "orders.shipped"]


def test_v3_title_and_operation_message_subset_and_parameterised_address():
    doc = {
        "asyncapi": "3.0.0",
        "info": {"title": "T", "version": "1"},
        "channels": {
            "quotes": {
                "address": "quotes/{customerId}/request",
                "messages": {"req": {"$ref": "#/components/messages/QuoteRequest"}, "other": {"name": "Inline"}},
            }
        },
        "operations": {
            "requestQuote": {"action": "send", "title": "Request a quote", "channel": {"$ref": "#/channels/quotes"}, "messages": [{"$ref": "#/channels/quotes/messages/req"}]},
            "all": {"action": "receive", "channel": {"$ref": "#/channels/quotes"}},
            "broken": {"action": "send", "channel": {"$ref": "#/channels/nope"}},
        },
        "components": {"messages": {"QuoteRequest": {"name": "QuoteRequest"}}},
    }
    assert fallback.entries(doc) == [
        {"heading": "Request a quote", "address": "quotes/{customerId}/request", "messages": ["QuoteRequest"]},
        {"heading": "all", "address": "quotes/{customerId}/request", "messages": ["QuoteRequest", "Inline"]},
    ]


def test_v2_entries_use_operation_id_channel_key_and_one_of_messages():
    items = fallback.entries(json.loads((EXAMPLES / "accounts-v2.json").read_text()))
    assert items == [
        {"heading": "onUserSignedUp", "address": "user/signedup", "messages": ["UserSignedUp"]},
        {"heading": "reportLoginFailure", "address": "user/login-failed", "messages": ["LoginFailed"]},
    ]
    doc = {
        "asyncapi": "2.6.0",
        "channels": {
            "a": {"publish": {"message": {"oneOf": [{"$ref": "#/components/messages/M1"}, {"name": "Second"}]}}, "subscribe": {"operationId": "sendA", "message": {}}},
            "b": {"description": "no operations"},
        },
        "components": {"messages": {"M1": {"title": "First"}}},
    }
    assert fallback.entries(doc) == [
        {"heading": "publish a", "address": "a", "messages": ["M1", "Second"]},
        {"heading": "sendA", "address": "a", "messages": ["a-subscribe"]},
    ]


def test_non_documents_and_empty_lists_render_nothing():
    assert fallback.entries("not a document") == []
    assert fallback.entries({"asyncapi": "3.0.0"}) == []
    assert fallback.render([]) == ""


def test_render_escapes_and_hides():
    out = fallback.render([{"heading": "<b>", "address": "a&b", "messages": ['"q"']}])
    assert out == '<ul data-asyncapi-fallback hidden><li>&lt;b&gt; <span>a&amp;b</span> <span>&quot;q&quot;</span></li></ul>'


def test_default_file_resolver_never_returns_urls(tmp_path, monkeypatch):
    (tmp_path / "doc.yaml").write_text("asyncapi: 3.0.0\n")
    monkeypatch.chdir(tmp_path)
    assert fallback.default_file_resolver("doc.yaml") == "doc.yaml"
    assert fallback.default_file_resolver("doc.yaml?x=1#frag") == "doc.yaml"
    for remote in ("https://example.com/doc.yaml", "//cdn/doc.yaml", "file:///etc/passwd", "", "missing.yaml"):
        assert fallback.default_file_resolver(remote) is None


def test_extension_emits_the_list_for_local_files_only(tmp_path, monkeypatch, warnings_list):
    monkeypatch.chdir(tmp_path)
    (tmp_path / "doc.json").write_text(MINIMAL_SCHEMA)
    out = render('<asyncapi-viewer src="doc.json"/>\n\n<asyncapi-viewer src="https://example.com/doc.json"/>\n\n<asyncapi-viewer src="nope.json"/>', warnings_list, viewer_js="v.js", viewer_theme="t.css")
    tags = re.findall(r"<asyncapi-viewer [^>]*>(.*?)</asyncapi-viewer>", out, re.S)
    assert tags[0] == '<ul data-asyncapi-fallback hidden><li>subscribe user/signedup <span>user/signedup</span> <span>user/signedup-subscribe</span></li></ul>'
    assert tags[1] == "" and tags[2] == ""
    assert warnings_list == []


def test_search_fallback_off_and_legacy_renderer_emit_nothing(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    (tmp_path / "doc.json").write_text(MINIMAL_SCHEMA)
    assert inner(render('<asyncapi-viewer src="doc.json"/>', search_fallback=False, viewer_js="v.js", viewer_theme="t.css")) == ""
    legacy = render('<asyncapi-viewer src="doc.json"/>', renderer="legacy")
    assert "data-asyncapi-fallback" not in legacy


def test_custom_file_resolver_and_yaml_documents(tmp_path, warnings_list):
    (tmp_path / "orders.yaml").write_text((EXAMPLES / "orders-v3.yaml").read_text())
    out = render(
        '<asyncapi-viewer src="/api/orders.yaml" useChannelAddressAsIdentifier/>',
        warnings_list,
        file_resolver=lambda src: str(tmp_path / src.lstrip("/api/")) if src.startswith("/api/") else None,
        viewer_js="v.js",
        viewer_theme="t.css",
    )
    assert inner(out) == (
        "<ul data-asyncapi-fallback hidden>"
        "<li>orders.placed <span>orders.placed</span> <span>OrderPlaced</span></li>"
        "<li>orders.shipped <span>orders.shipped</span> <span>OrderShipped</span></li></ul>"
    )
    assert warnings_list == []


def test_unreadable_document_warns_and_still_emits_the_element(tmp_path, monkeypatch, warnings_list):
    monkeypatch.chdir(tmp_path)
    (tmp_path / "bad.json").write_text("{not json")
    (tmp_path / "bad.yaml").write_text("a: [unclosed")
    out = render('<asyncapi-viewer src="bad.json"/>\n\n<asyncapi-viewer src="bad.yaml"/>', warnings_list, viewer_js="v.js", viewer_theme="t.css")
    assert out.count("<asyncapi-viewer ") == 2 and "data-asyncapi-fallback" not in out
    assert len(warnings_list) == 2 and all("could not read" in w and "search fallback" in w for w in warnings_list)


def test_without_pyyaml_yaml_documents_are_skipped_silently(tmp_path, monkeypatch, warnings_list):
    monkeypatch.chdir(tmp_path)
    (tmp_path / "doc.yaml").write_text("asyncapi: 3.0.0\n")
    (tmp_path / "doc.json").write_text(MINIMAL_SCHEMA)
    monkeypatch.setattr(fallback, "yaml", None)
    out = render('<asyncapi-viewer src="doc.yaml"/>\n\n<asyncapi-viewer src="doc.json"/>', warnings_list, viewer_js="v.js", viewer_theme="t.css")
    tags = re.findall(r"<asyncapi-viewer [^>]*>(.*?)</asyncapi-viewer>", out, re.S)
    assert tags[0] == "" and tags[1].startswith("<ul data-asyncapi-fallback")
    assert warnings_list == []


def test_fenced_block_gets_the_list_too(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    (tmp_path / "doc.json").write_text(MINIMAL_SCHEMA)
    out = render("```asyncapi\nsrc: doc.json\n```", viewer_js="v.js", viewer_theme="t.css")
    assert "<li>subscribe user/signedup" in inner(out)
