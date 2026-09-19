"""Centralized Language Registry for CodeGuard.

Defines all supported programming languages, their file extensions,
configured static analyzers, and deterministic language detection heuristics.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class LanguageDefinition(BaseModel):
    """Metadata and capabilities for a supported programming language."""

    id: str = Field(..., description="Unique language identifier, e.g. 'python'")
    display_name: str = Field(..., description="Human-readable name, e.g. 'Python'")
    extensions: List[str] = Field(..., description="List of recognized file extensions")
    default_extension: str = Field(..., description="Primary extension for temp files")
    supported_analyzers: List[str] = Field(..., description="Tools supporting this language")
    syntax_keywords: List[str] = Field(
        default_factory=list,
        description="Deterministic keywords used for syntax-based detection"
    )


# Authoritative central registry of supported languages
LANGUAGE_REGISTRY: Dict[str, LanguageDefinition] = {
    "python": LanguageDefinition(
        id="python",
        display_name="Python",
        extensions=[".py", ".pyw"],
        default_extension=".py",
        supported_analyzers=["semgrep", "bandit"],
        syntax_keywords=["def ", "import ", "from ", "elif ", "class ", "print(", "__name__"],
    ),
    "javascript": LanguageDefinition(
        id="javascript",
        display_name="JavaScript",
        extensions=[".js", ".jsx", ".mjs", ".cjs"],
        default_extension=".js",
        supported_analyzers=["semgrep", "eslint"],
        syntax_keywords=["const ", "let ", "var ", "function ", "console.log", "module.exports", "require("],
    ),
    "typescript": LanguageDefinition(
        id="typescript",
        display_name="TypeScript",
        extensions=[".ts", ".tsx", ".mts", ".cts"],
        default_extension=".ts",
        supported_analyzers=["semgrep", "eslint"],
        syntax_keywords=["interface ", "type ", ": string", ": number", ": boolean", "export type", "as const"],
    ),
    "java": LanguageDefinition(
        id="java",
        display_name="Java",
        extensions=[".java"],
        default_extension=".java",
        supported_analyzers=["semgrep", "spotbugs", "pmd"],
        syntax_keywords=["public class ", "public static void main", "System.out.", "package ", "private ", "protected "],
    ),
    "c": LanguageDefinition(
        id="c",
        display_name="C",
        extensions=[".c", ".h"],
        default_extension=".c",
        supported_analyzers=["semgrep", "clang-tidy"],
        syntax_keywords=["#include <stdio.h>", "#include <stdlib.h>", "int main(", "printf(", "malloc(", "free("],
    ),
    "cpp": LanguageDefinition(
        id="cpp",
        display_name="C++",
        extensions=[".cpp", ".cc", ".cxx", ".hpp", ".hh", ".hxx"],
        default_extension=".cpp",
        supported_analyzers=["semgrep", "clang-tidy"],
        syntax_keywords=["#include <iostream>", "#include <vector>", "std::", "cout <<", "cin >>", "template<", "nullptr"],
    ),
    "go": LanguageDefinition(
        id="go",
        display_name="Go",
        extensions=[".go"],
        default_extension=".go",
        supported_analyzers=["semgrep", "go-vet", "staticcheck"],
        syntax_keywords=["package main", "func main()", "import (", "fmt.Println", "fmt.Printf", "func ", "type struct"],
    ),
}


def get_language(lang_id: str) -> Optional[LanguageDefinition]:
    """Retrieve language definition by its identifier."""
    return LANGUAGE_REGISTRY.get(lang_id.lower())


def get_all_languages() -> List[LanguageDefinition]:
    """Retrieve all configured language definitions in standard display order."""
    return list(LANGUAGE_REGISTRY.values())


def is_supported_language(lang_id: str) -> bool:
    """Check whether a language identifier or 'auto' is supported."""
    if not lang_id:
        return False
    lower = lang_id.lower()
    return lower == "auto" or lower in LANGUAGE_REGISTRY


def is_supported_extension(filename_or_ext: str) -> bool:
    """Check whether a given filename or file extension belongs to any supported language."""
    if not filename_or_ext:
        return False
    lower = filename_or_ext.lower()
    for lang in LANGUAGE_REGISTRY.values():
        for ext in lang.extensions:
            if lower.endswith(ext):
                return True
    return False


def get_language_by_filename(filename: str) -> Optional[str]:
    """Match a filename to its corresponding language id."""
    if not filename:
        return None
    lower = filename.lower()
    # Check C++ extensions first (e.g. .cpp, .hpp) before C (.h, .c)
    cpp_lang = LANGUAGE_REGISTRY["cpp"]
    for ext in cpp_lang.extensions:
        if lower.endswith(ext):
            return cpp_lang.id

    for lang in LANGUAGE_REGISTRY.values():
        for ext in lang.extensions:
            if lower.endswith(ext):
                return lang.id
    return None


def detect_language(
    code: str,
    filename: Optional[str] = None,
    requested_lang: Optional[str] = None,
) -> str:
    """Deterministically determine source language.

    Priority:
    1. Explicit requested_lang (if recognized and != 'auto')
    2. Filename extension
    3. Syntax heuristic keyword inspection
    4. Safe fallback to 'python'
    """
    if requested_lang and requested_lang.lower() != "auto":
        clean_req = requested_lang.lower()
        if clean_req in LANGUAGE_REGISTRY:
            return clean_req

    if filename:
        matched = get_language_by_filename(filename)
        if matched:
            return matched

    if not code:
        return "python"

    # Syntax keyword score matching
    best_lang = "python"
    highest_matches = 0

    # Specific checks for strong indicators
    if "package main" in code or "func " in code and "fmt." in code:
        return "go"
    if "public class " in code or "System.out." in code:
        return "java"
    if "#include <iostream>" in code or "std::" in code or "cout <<" in code:
        return "cpp"
    if "#include <stdio.h>" in code or "int main(int argc" in code:
        return "c"
    if any(sig in code for sig in [": string", ": number", ": boolean", "export interface", "interface "]) and any(kw in code for kw in ["const ", "let ", "function "]):
        return "typescript"
    if "def " in code or "elif " in code or ("import " in code and "{" not in code and ("from " in code or "\n" in code)):
        return "python"
    if "const " in code or "let " in code or "function " in code or "console.log" in code or "=>" in code:
        return "javascript"

    # Keyword count heuristic
    for lang_id, lang_def in LANGUAGE_REGISTRY.items():
        matches = sum(1 for kw in lang_def.syntax_keywords if kw in code)
        if matches > highest_matches:
            highest_matches = matches
            best_lang = lang_id

    return best_lang
