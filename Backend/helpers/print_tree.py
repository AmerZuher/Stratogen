import os

EXCLUDE_FOLDERS = {'__pycache__','.local','node_modules','objects','Old Resouces','.gitignore', 'dockerfile','Dockerfile'}
EXCLUDE_CONTENTS_FOLDERS = {'reports','warehouse','.venv', '__pycache__','.local','node_modules','objects', 'ui', '.git','generated','api','data', 'app', 'src', 'Secret','helpers','logs','prompt','.dockerignore','public','config','.env.local','.env.production',''}  # folders to show but don't recurse into

def print_tree(start_path, prefix=""):
    entries = [e for e in os.listdir(start_path) if e not in EXCLUDE_FOLDERS]
    entries.sort()
    for index, entry in enumerate(entries):
        path = os.path.join(start_path, entry)
        connector = "└── " if index == len(entries) - 1 else "├── "
        print(prefix + connector + entry)
        
        # If it's a folder and not in the exclude-contents list, recurse into it
        if os.path.isdir(path) and entry not in EXCLUDE_CONTENTS_FOLDERS:
            extension = "    " if index == len(entries) - 1 else "│   "
            print_tree(path, prefix + extension)

if __name__ == "__main__":
    #root = "."
    root = "Frontend"
    root = "Backend"
    
    root = "."

    print(root)
    print_tree(root)
