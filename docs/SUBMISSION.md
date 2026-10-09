# Public directory preparation

Publisher: Thomas Niewiara. Free, no purchases. Intended availability: all supported countries. License: MIT.

This repository can be installed as a GitHub-hosted Codex plugin marketplace. It has not been submitted to, approved by, or published in OpenAI's universal Plugins Directory.

## Current integration constraint

The implementation runs as a local stdio MCP process on each user's Mac and talks to that user's Notes app. There is no hosted MCP server URL. OpenAI's documented public submission workflow connects and verifies a remote MCP server URL and scans its tools. Uploading this local code does not provide such an endpoint.

Do not substitute an endpoint connected to the publisher's own Notes, expose a local Notes service publicly, or remove the MCP configuration to make the package appear to be skills-only. The current functionality depends on the local bridge.

Reference: https://developers.openai.com/plugins/deploy/submission

Before a public-directory submission, establish a supported local-plugin distribution path, or design and review a per-user authenticated bridge supported by the host. This repository's GitHub marketplace remains usable without a remote bridge.

## Prepared materials

- Portable and Codex manifests with matching identity and version.
- Five tools with read/write/destructive annotations.
- Source, installation instructions, MIT license, privacy information, terms, and public support instructions.
- Five positive and three negative review cases in the portable manifest.
- Release notes, no-commerce declaration, and unrestricted country targeting.
- Reproducible protocol and opt-in live tests.

## Not completed

- Verified eligibility of local stdio tools for the public-directory submission route.
- Verified developer identity and required publisher/domain checks in the portal.
- A real, reviewer-accessible video walkthrough; no recording URL is claimed.
- All review prompts run through the intended host against the exact public package. Direct integration tests alone are not the review prompt suite.
- Portal upload, connected-server scan, review submission, approval, and publication.

## Demo to record after eligibility is resolved

Use sample notes only. Show the installed package version, Notes Automation permission, and these real interactions:

1. List folders; show the returned account/folder IDs without private names.
2. Create a note called Plugin demo with “Coffee, train, raincoat.”
3. Find the note by title and show its content.
4. Append “Charge the phone,” then read it again.
5. Replace the body while preserving the title; show the result.
6. Ask to delete the note; show the explanation that deletion is unsupported.

Record actual prompts and results, play the video back, confirm no private content appears, host it at a publicly accessible or reviewer-accessible URL, and then populate `review.demo_recording_url`. A script or screenshots do not substitute for the recording.
