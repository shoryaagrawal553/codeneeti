"""Tests for multi-language support and deterministic language detection."""

from fastapi.testclient import TestClient
from app.main import app
from app.languages import (
    LANGUAGE_REGISTRY,
    detect_language,
    get_all_languages,
    get_language,
    is_supported_extension,
    is_supported_language,
)

client = TestClient(app)


def test_central_language_registry_covers_all_required_languages():
    """Verify registry contains Python, JavaScript, TypeScript, Java, C, C++, and Go."""
    required = ["python", "javascript", "typescript", "java", "c", "cpp", "go"]
    all_langs = get_all_languages()
    lang_ids = [l.id for l in all_langs]

    for req in required:
        assert req in lang_ids
        defn = get_language(req)
        assert defn is not None
        assert len(defn.extensions) > 0
        assert len(defn.supported_analyzers) > 0
        assert defn.default_extension.startswith(".")


def test_is_supported_language():
    """Verify language validation for valid IDs, 'auto', and invalid values."""
    assert is_supported_language("python") is True
    assert is_supported_language("JAVASCRIPT") is True
    assert is_supported_language("typescript") is True
    assert is_supported_language("java") is True
    assert is_supported_language("c") is True
    assert is_supported_language("cpp") is True
    assert is_supported_language("go") is True
    assert is_supported_language("auto") is True
    assert is_supported_language("ruby") is False
    assert is_supported_language("rust") is False
    assert is_supported_language("") is False


def test_is_supported_extension():
    """Verify supported extensions for all 7 languages."""
    valid_files = [
        "main.py",
        "app.js",
        "component.tsx",
        "service.ts",
        "Server.java",
        "buffer.c",
        "header.h",
        "vector.cpp",
        "main.go",
    ]
    for f in valid_files:
        assert is_supported_extension(f) is True, f"Failed for {f}"

    invalid_files = ["main.rb", "app.php", "script.sh", "notes.txt", "binary.exe"]
    for f in invalid_files:
        assert is_supported_extension(f) is False, f"Failed for {f}"


def test_detect_language_priority():
    """Verify detection priorities: explicit > filename > syntax heuristics."""
    # Explicit requested language overrides filename
    detected = detect_language("x = 1", filename="script.js", requested_lang="python")
    assert detected == "python"

    # Filename extension detection
    assert detect_language("", filename="service.ts") == "typescript"
    assert detect_language("", filename="App.java") == "java"
    assert detect_language("", filename="main.go") == "go"
    assert detect_language("", filename="memory.c") == "c"
    assert detect_language("", filename="math.cpp") == "cpp"

    # Syntax heuristics when no filename
    go_code = "package main\nimport \"fmt\"\nfunc main() {\n    fmt.Println(\"Hello\")\n}"
    assert detect_language(go_code) == "go"

    java_code = "public class SecurityDemo {\n    public static void main(String[] args) {\n        System.out.println(1);\n    }\n}"
    assert detect_language(java_code) == "java"

    cpp_code = "#include <iostream>\nint main() {\n    std::cout << \"Hello\" << std::endl;\n    return 0;\n}"
    assert detect_language(cpp_code) == "cpp"

    c_code = "#include <stdio.h>\nint main(int argc, char **argv) {\n    printf(\"test\\n\");\n    return 0;\n}"
    assert detect_language(c_code) == "c"

    ts_code = "interface UserConfig {\n    id: string;\n    active: boolean;\n}\nconst c: UserConfig = { id: '1', active: true };"
    assert detect_language(ts_code) == "typescript"


def test_get_languages_endpoint_returns_expanded_metadata():
    """Verify GET /api/languages exposes all 7 languages with extensions and analyzer support."""
    response = client.get("/api/languages")
    assert response.status_code == 200
    data = response.json()
    assert "languages" in data
    languages = data["languages"]
    assert len(languages) >= 7

    ids = [l["id"] for l in languages]
    for expected in ["python", "javascript", "typescript", "java", "c", "cpp", "go"]:
        assert expected in ids

    # Check that each item has extensions and supported_analyzers
    for item in languages:
        assert len(item["extensions"]) > 0
        assert "supported_analyzers" in item
        assert "available" in item
