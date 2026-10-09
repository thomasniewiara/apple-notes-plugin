# Apple Notes for Codex

<img src="apple-notes/assets/icon.svg" alt="Apple Notes plugin icon" width="96" height="96">

Read, find, create, and update Apple Notes from Codex on your Mac. A free, MIT-licensed plugin by **Thomas Niewiara**.

The server runs on your own Mac and uses native Notes automation. It needs no API key, hosted service, or Python packages. It is not affiliated with or endorsed by Apple Inc.

## Requirements

- macOS with Apple Notes configured.
- Python 3 available as `python3`.
- A local Codex client that supports plugin marketplaces and stdio MCP servers.
- Permission for the host app to control Notes through macOS Automation.

Apple Notes remains on your Mac. Note content returned to Codex is processed by your chat host under its normal settings. This plugin is not a web or mobile connector.

## Install

Add this repository as a plugin marketplace, then install Apple Notes:

```sh
codex plugin marketplace add thomasniewiara/apple-notes-plugin
codex plugin add apple-notes@thomasniewiara-plugins
```

Reopen the desktop app. In **Plugins**, select **Thomas Niewiara**, then **Apple Notes**. Start a new local chat and allow Notes access if macOS prompts you.

If access is denied, open **System Settings → Privacy & Security → Automation** and allow the app running the plugin to control **Notes**. No Messages, Contacts, Full Disk Access, or iCloud credentials are required by this plugin.

If your desktop client does not load the configured marketplace, clone this repository and add the local folder instead:

```sh
git clone https://github.com/thomasniewiara/apple-notes-plugin.git
codex plugin marketplace add ./apple-notes-plugin
codex plugin add apple-notes@thomasniewiara-plugins
```

## Try it

- “Find my Apple Notes with travel in the title.”
- “Create a note called Weekend plans with: buy coffee, book the train.”
- “Add ‘Pack a raincoat’ to my Weekend plans note.”
- “Show me the folders in Apple Notes.”

## Tools

| Tool | Behavior |
| --- | --- |
| `list_folders` | List account and folder IDs, including nested folders. |
| `list_notes` | List note titles and metadata, filter by title/folder, paginate. |
| `get_note_content` | Read one unlocked note as plain text and HTML. |
| `add_note` | Create a titled plain-text note in the default or chosen folder. |
| `update_note_content` | Append text or replace the body below the existing title. |

Title search is case-insensitive and does not search note bodies. Folder filtering includes only the selected folder's own notes. Listing order comes from Notes.

## Editing limits

Read the note before editing and pass its `modified_at` value as `expected_modified_at`. Append is the default and retains the existing HTML. Replacement preserves the title, rewrites the rest as plain text, removes rich formatting, and requires the modification token. Conflict checks are best effort rather than an atomic transaction.

Locked notes cannot be read or updated. Notes containing attachments can be read, but editing them is refused to avoid losing attachments. Attachment downloads, deletion, moving notes, and folder creation are unsupported.

After a write times out, list/read the note before retrying. The write may already have completed.

## Test and develop

The plugin source is in `apple-notes/`. No dependency installation is required.

```sh
python3 tests/test_notes.py
```

For a live test on a Mac with Notes access:

```sh
python3 tests/test_notes.py --live
```

The live test creates one temporary note, verifies reading/editing/conflict handling, and moves that note to Recently Deleted. It does not purge it. The basic test does not access Notes.

After editing, increase the version in both plugin manifests and `server/server.py`, then reinstall the plugin. Protocol messages use standard input/output; note content reaches the fixed automation script as JSON in a private temporary file, never as executable code or process arguments.

## Distribution status

This repository is a GitHub-hosted plugin marketplace for local installation. It is separate from approval in OpenAI's public Plugins Directory. The public submission process documents remote MCP server connections; this implementation uses a local stdio process and has no hosted MCP endpoint. See [submission preparation](docs/SUBMISSION.md) for the remaining work.

[Support](SUPPORT.md) · [Privacy](PRIVACY.md) · [Terms](TERMS.md) · [MIT license](LICENSE)
