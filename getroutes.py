# save as find_routes.py
import ast
import sys
from pathlib import Path

def extract_rule(arg):
    # arg may be ast.Constant (py3.8+) or ast.Str
    if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
        return arg.value
    if isinstance(arg, ast.Str):
        return arg.s
    return "<dynamic>"

def process_file(path):
    try:
        tree = ast.parse(path.read_text(), filename=str(path))
    except Exception as e:
        return
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            for dec in node.decorator_list:
                # match something.route(...) where something can be app or blueprint etc.
                if isinstance(dec, ast.Call) and isinstance(dec.func, ast.Attribute) and dec.func.attr == "route":
                    rule = None
                    # positional first arg
                    if dec.args:
                        rule = extract_rule(dec.args[0])
                    # or keyword 'rule' (rare)
                    if rule is None:
                        for kw in dec.keywords:
                            if kw.arg == "rule":
                                rule = extract_rule(kw.value)
                                break
                    if rule is None:
                        rule = "<dynamic>"
                    print(f"{rule}\t{node.name}")

def gather_paths(paths):
    for p in paths:
        p = Path(p)
        if p.is_file() and p.suffix == ".py":
            process_file(p)
        elif p.is_dir():
            for f in p.rglob("*.py"):
                process_file(f)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 find_routes.py <file_or_dir> [...]")
        sys.exit(1)
    gather_paths(sys.argv[1:])
