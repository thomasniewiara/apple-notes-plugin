# Privacy information

Apple Notes for Codex is a local plugin maintained by Thomas Niewiara.

## Notes access

The plugin runs on the user's Mac. It reads note titles, account/folder metadata, and requested note content using native macOS Notes automation. It creates or edits notes when its tools are invoked. macOS controls the host app's permission to automate Notes.

The plugin has no hosted backend, telemetry, analytics, network requests, or publisher-operated note storage. Its source does not transmit notes to the publisher. Tool results, including requested note content, go to the chat host. The host's own privacy settings and policies govern processing of that content; installing this plugin does not make the host's processing local.

Requests are written to a private temporary directory with restricted permissions, read by the local automation bridge, and removed by the server after the call finishes. An abrupt termination or operating-system failure may interrupt cleanup. Existing notes stay in Apple Notes and follow the user's Apple account and sync settings. The plugin does not change those settings.

## Support

GitHub handles repository visits, issues, and other GitHub activity under GitHub's policies. Public issues and comments can be seen by others. Do not post private note content, credentials, or personal account information when asking for support.

To stop Notes access, disable or uninstall the plugin and revoke the host app's Notes Automation permission in macOS settings. Removing the plugin does not delete notes that it previously created.

Questions about the plugin can be raised using the support method described in [SUPPORT.md](SUPPORT.md).
