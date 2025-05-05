# Inter-Server Discord Bot: File Directory Structure

This document describes the organization of the project's files and directories. This helps understand key functionality with structure.

my-interserver-bot/
├── .env                        # (NOT COMMITTED) Stores sensitive data: Bot token, Database URIs, etc. USE ENVIRONMENT VARIABLES!
├── .gitignore                  # Specifies intentionally untracked files that Git should ignore. Add sensitive files.
├── config.json                 # (Optional, NOT COMMITTED if used for secrets) Configuration settings, such as channel IDs. Can be moved to .env
├── index.js                    # Main bot logic. Handles events, commands, and inter-server communication.
├── package.json                # Lists project dependencies and scripts.
├── package-lock.json           # Records the exact versions of dependencies for consistent installs.
|--- README.md                   # Describes the project, its purpose, file organization, etc.
└── modules/                    # (Optional) Can make files cleaner
    └─── interserver.js           # (Optional) Interserver functions in another file
