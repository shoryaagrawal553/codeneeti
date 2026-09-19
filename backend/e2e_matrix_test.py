import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api"

def send_analyze(code, language="auto", filename=None):
    payload = {"code": code, "language": language, "filename": filename}
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/analyze",
        data=data,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))
    except Exception as e:
        return 500, {"error": str(e)}

def run_tests():
    matrix = {}
    
    # 1. Edge cases
    print("--- Testing Edge Cases ---")
    status, res = send_analyze("", "python")
    print(f"Empty code: status={status}, error={res.get('error')}")
    assert status == 400 and res.get('error') == "MISSING_CODE"

    status, res = send_analyze("print(1)", "ruby")
    print(f"Unsupported language: status={status}, error={res.get('error')}")
    assert status == 400 and res.get('error') == "UNSUPPORTED_LANGUAGE"

    status, res = send_analyze("print(1)", "python", "test.rb")
    print(f"Unsupported file: status={status}, error={res.get('error')}")
    assert status == 400 and res.get('error') == "UNSUPPORTED_FILE_TYPE"

    status, res = send_analyze("x = 1\n" * 25000, "python")
    print(f"Oversized code: status={status}, error={res.get('error')}")
    assert status == 400 and res.get('error') == "CODE_TOO_LARGE"

    # 2. Languages
    languages_tests = {
        "python": {
            "safe": "def add(a, b):\n    return a + b\n",
            "vulnerable": "import sqlite3\ndef query(uid):\n    conn = sqlite3.connect(':memory:')\n    return conn.execute(f'SELECT * FROM users WHERE id = {uid}').fetchall()\n",
            "file": "db.py"
        },
        "javascript": {
            "safe": "function add(a, b) {\n  return a + b;\n}\n",
            "vulnerable": "function run(input) {\n  eval(input);\n}\n",
            "file": "app.js"
        },
        "typescript": {
            "safe": "function greet(name: string): string {\n  return 'Hello ' + name;\n}\n",
            "vulnerable": "function execute(code: string): any {\n  return eval(code);\n}\n",
            "file": "server.ts"
        },
        "java": {
            "safe": "public class Safe {\n  public static int add(int a, int b) { return a + b; }\n}\n",
            "vulnerable": "import java.sql.*;\npublic class Vuln {\n  public void find(Connection c, String u) throws Exception {\n    Statement s = c.createStatement();\n    s.executeQuery(\"SELECT * FROM users WHERE name = '\" + u + \"'\");\n  }\n}\n",
            "file": "Main.java"
        },
        "c": {
            "safe": "#include <stdio.h>\nint main() { printf(\"hello\"); return 0; }\n",
            "vulnerable": "#include <stdio.h>\n#include <string.h>\nvoid copy(char *s) {\n  char buf[10];\n  strcpy(buf, s);\n  gets(buf);\n}\n",
            "file": "util.c"
        },
        "cpp": {
            "safe": "#include <iostream>\nint main() { std::cout << 42 << std::endl; return 0; }\n",
            "vulnerable": "#include <iostream>\n#include <cstring>\nvoid copy(char *s) {\n  char buf[10];\n  strcpy(buf, s);\n  gets(buf);\n}\n",
            "file": "main.cpp"
        },
        "go": {
            "safe": "package main\nimport \"fmt\"\nfunc main() { fmt.Println(\"Safe\") }\n",
            "vulnerable": "package main\nimport \"database/sql\"\nfunc runQuery(db *sql.DB, uid string) {\n  db.Query(\"SELECT * FROM accounts WHERE id = '\" + uid + \"'\")\n}\n",
            "file": "main.go"
        }
    }

    print("\n--- Testing All 7 Languages ---")
    for lang, test_data in languages_tests.items():
        print(f"\n[Language: {lang.upper()}]")
        # Safe
        status_s, res_s = send_analyze(test_data["safe"], lang, test_data["file"])
        safe_findings = len(res_s.get("findings", []))
        print(f"  Safe code: HTTP {status_s}, findings={safe_findings}, fix_available={res_s.get('fix_available')}")

        # Vulnerable
        status_v, res_v = send_analyze(test_data["vulnerable"], lang, test_data["file"])
        vuln_findings = res_v.get("findings", [])
        num_f = len(vuln_findings)
        fix_avail = res_v.get("fix_available")
        has_fixed = bool(res_v.get("fixed_code"))
        resolved = res_v.get("summary", {}).get("resolved", 0)
        unresolved = res_v.get("summary", {}).get("unresolved", 0)
        print(f"  Vulnerable: HTTP {status_v}, findings={num_f}, fix_available={fix_avail}, fixed_code={has_fixed}, resolved={resolved}, unresolved={unresolved}")
        if vuln_findings:
            f0 = vuln_findings[0]
            print(f"    Sample Finding: [{f0.get('severity')}] {f0.get('rule_id')} (lines {f0.get('line_start')}-{f0.get('line_end')})")
            print(f"    Title: {f0.get('title')}")
            print(f"    Verification: {f0.get('verification_status')}")
            print(f"    Explanation preview: {f0.get('explanation')[:100]}...")

        matrix[lang] = {
            "analyze": status_v == 200,
            "findings": num_f > 0,
            "solution": bool(vuln_findings and vuln_findings[0].get("explanation")),
            "auto_fix": fix_avail or (has_fixed),
            "verification": res_v.get("verification_available", False),
        }

    print("\n================ FINAL LANGUAGE MATRIX ================")
    print(f"{'Language':<12} | {'Analyze':<8} | {'Findings':<10} | {'Solution':<10} | {'Auto-Fix':<10} | {'Verification':<12}")
    print("-" * 75)
    for lang, m in matrix.items():
        print(f"{lang:<12} | {'PASS' if m['analyze'] else 'FAIL':<8} | {'PASS' if m['findings'] else 'FAIL':<10} | {'PASS' if m['solution'] else 'FAIL':<10} | {'PASS' if m['auto_fix'] else 'FAIL':<10} | {'PASS' if m['verification'] else 'FAIL':<12}")

if __name__ == "__main__":
    run_tests()
