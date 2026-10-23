---
name: jmr-file-share
description: Copy files from the machine the agent runs on into shared storage (a NAS, ZFS pool or file-server mount such as /mnt/tank) so the user can open them on their other devices (laptop, phone, TV). Use when the user asks to share, send, copy, export, put or drop something "on tank", "on the NAS", "on the file server", "on the share", "to my Mac/phone", or says they want to view, open, download or play a file from another device. On demand only; never copy without being asked.
version: 1.0.0
---

# jmr-file-share

Use this when the agent runs on a server whose shared storage is mounted locally and the user wants something from that server visible on their other devices. Other devices reach the same storage through the user's file server, so a copy here is all it takes.

## Before the first copy in a session

1. Read the machine's local notes if the file exists: `${JMR_SHARE_NOTES:-~/.config/jmr-file-share/notes.md}`. It holds what only this machine knows: which hosts never to touch, whose folders are off limits and how other devices reach the share. Its rules override the defaults below.
2. The destination is `$JMR_SHARE_ROOT`, default `/mnt/tank/media/herdr`. If it is not mounted or not writable, the script says so. Tell the user and stop. Never pick another folder yourself.

## Share

```bash
<this skill's directory>/scripts/share.sh <path>... [--as <folder>] [--dry-run] [--force]
```

- It copies and never moves, so the original stays where it is.
- A file inside a git repo lands at the same place in a folder named after the repo: `~/CODE/app/docs/report.pdf` goes to `<root>/app/docs/report.pdf`. Sharing it again replaces that copy.
- Anything outside a repo goes to `<root>/misc/`. Use `--as <folder>` to choose the top folder yourself.
- It skips `.git`, `node_modules`, build output, `.env` files, keys and anything named like a secret or credential. Shared storage reaches every device on the network, so never work around this. If the user wants one of those shared, ask them to confirm first.
- A copy over 5 GB (`JMR_SHARE_MAX_GB`) stops with an error, because shared pools also hold media and backups. Tell the user the size and pass `--force` only if they agree.
- `--dry-run` shows what would copy. `--list` shows what is already shared, newest first.

## Before you copy

- Share exactly what the user asked for. When the request is vague ("share the results"), name the files you plan to copy, then copy once they are clear.
- Copy what the user will open: the PDF instead of its source, the exported video instead of the project, a zip of a built site.
- Write only under the share root. Never copy into other people's folders or anywhere else on the pool unless the user names that place.
- Never delete or overwrite anything outside the share root. Inside it, remove things only when the user asks.

## After you copy

Reply with the paths you wrote (one per line) and the total size. Keep it short.

If a media server (Jellyfin, Plex) indexes the same pool, a video under the share root may appear in its library. That is harmless, but mention it the first time you share a video.
