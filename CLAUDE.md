# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm start` — run the server (serves the PWA + WebSocket endpoint) at `http://localhost:4000`
- `npm run dev` — run the server with `node --watch` for auto-restart on change
- `npm test` — run all tests (Node's built-in test runner, `node --test`)
- Run a single test file: `node --test server/auth.test.js`

No build step, bundler, TypeScript, or linter is configured — plain CommonJS Node.js and vanilla JS/HTML/CSS.

## Architecture

Connector is a PWA that lets a phone browser run shell commands on a PC remotely. Two halves in one process:

1. **Server** (`server/`) — a Node HTTP server that both serves static files from `public/` and upgrades to a WebSocket at `/ws` (via the `ws` package). Entry point: `server/index.js`.
2. **Client** (`public/`) — a static PWA (`index.html`, `app.js`, `style.css`, `manifest.webmanifest`, `sw.js`) with no framework or build tooling; served directly from disk.

Key server modules:
- `server/auth.js` — generates/persists a pairing token to `.connector-token` (gitignored, mode 0600) on first run, and does timing-safe token comparison. The token is required as a `?token=` query param on the WebSocket upgrade.
- `server/session.js` — wraps a spawned shell process (`cmd.exe` on Windows, `$SHELL` elsewhere) per WebSocket connection. `Session.run(command)` writes to the child's stdin; stdout/stderr are streamed back via callback.
- `server/static.js` — minimal static file server for `public/`, with path-traversal protection (resolved path must stay under `PUBLIC_DIR`).

Connection flow: client connects to `wss://host/ws?token=...` → server validates token → a new `Session` (shell child process) is created for that socket → client sends `{type: 'command', data: '...'}` messages → server streams `{type: 'output', data: '...'}` / `{type: 'exit', code}` messages back. One shell process lives per WebSocket connection and is killed when the socket closes.

The client (`public/app.js`) stores the pairing token in `localStorage` (or reads it from a `?token=` URL param on first load), auto-reconnects on disconnect, and renders raw output to a `<pre>` terminal-style panel. `sw.js` caches the static app shell for offline load of the UI (live command execution still requires a live connection to the server).

## Security model

This app grants remote code execution on the host PC — the pairing token is the only access control. The server binds to `HOST` (env var, default `0.0.0.0`) and `PORT` (default `4000`); intended deployment binds `HOST` to the machine's Tailscale IP so the server is reachable only over the private tailnet, never the public internet. See README.md's Security section before changing auth, session spawning, or network binding.
