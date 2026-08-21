# Connector

A Progressive Web App (PWA) that lets you run Windows CMD commands on your PC remotely from your phone's browser.

## Overview

Connector consists of two parts:

- **Server** — a lightweight agent running on the PC, listening for authenticated connections and executing commands in a `cmd.exe` session.
- **Client (PWA)** — a mobile-friendly web app, installable to your phone's home screen, that sends commands to the server and streams back the output in real time.

## Features

- Installable PWA (works offline for the UI shell, add-to-home-screen, app-like experience)
- Real-time terminal output via WebSocket
- Command history and quick-repeat of previous commands
- Session persistence across reconnects (e.g. switching from Wi-Fi to mobile data)
- Optional multi-device pairing (control the same PC from multiple phones)

## Security

This app grants remote command execution on your PC — treat it like SSH access:

- All connections require authentication (pairing code / token) before any command can run.
- The server should never be exposed to the public internet directly. Run it over **Tailscale** (see below) so only devices on your private tailnet can reach it.
- Rotate/revoke pairing tokens if a device is lost.
- Consider restricting the command set or running the server under a limited user account rather than Administrator, unless full access is explicitly required.

### Overlay network: Tailscale

Tailscale creates a private, encrypted mesh network (WireGuard-based) between your PC and phone, so the Connector server never needs to be exposed on the public internet or even on your local Wi-Fi.

1. Install Tailscale on the PC and sign in: https://tailscale.com/download
2. Install the Tailscale app on your phone and sign in with the same account.
3. On the PC, find its tailnet IP (Tailscale tray icon, or `tailscale ip -4`) — looks like `100.x.y.z`.
4. Start the server bound to that address so it's reachable only over the tailnet, not the local LAN or internet:
   ```
   HOST=100.x.y.z npm start
   ```
   (Omit `HOST` to bind all interfaces — fine for local testing, but not recommended once Tailscale is set up.)
5. On the phone, open `http://100.x.y.z:4000` (use the PC's tailnet IP/MagicDNS name, e.g. `http://my-pc.tailnet-name.ts.net:4000`) and enter the pairing token shown in the server's console output.
6. Install the app to your home screen for the full PWA experience.

For extra hardening, enable Tailscale ACLs to restrict which devices on your tailnet can reach the PC's port, and consider Tailscale Serve/Funnel only if you specifically need access outside the tailnet (not recommended for this app).

## Architecture

```
[Phone Browser / PWA]  <--WebSocket (WSS)-->  [Server Agent on PC]  <-->  [cmd.exe]
```

- The PWA is a static front end (HTML/CSS/JS) served by the same agent or a separate static host.
- The server agent maintains one `cmd.exe` child process per session, piping stdin/stdout/stderr over the WebSocket connection.
- A service worker caches the app shell for offline load; live command execution still requires an active connection to the PC.

## Getting Started

### Prerequisites

- Windows PC with the server agent installed
- A phone (or any device) with a modern browser supporting PWA install (Chrome, Edge, Safari)
- Both devices on the same network, or a configured remote-access tunnel

### Installation

1. Install and start the server agent on your PC.
2. Note the pairing code/URL shown by the server on first run.
3. Open the client URL on your phone's browser.
4. Enter the pairing code to link the phone to the PC.
5. (Optional) Use "Add to Home Screen" to install the PWA.

### Usage

1. Open the installed app on your phone.
2. Select (or connect to) your paired PC.
3. Type a command and send — output streams back live, just like a local CMD window.

## Roadmap

- PowerShell support alongside CMD
- File transfer between phone and PC
- Multi-PC management from a single app
- Push notifications for long-running command completion

## License

TBD
