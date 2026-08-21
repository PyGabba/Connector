const { spawn } = require('node:child_process');

const SHELL = process.platform === 'win32' ? 'cmd.exe' : (process.env.SHELL || '/bin/bash');

class Session {
  constructor(onOutput, onExit) {
    this.proc = spawn(SHELL, [], { windowsHide: true });
    this.proc.stdout.on('data', (chunk) => onOutput(chunk.toString('utf8')));
    this.proc.stderr.on('data', (chunk) => onOutput(chunk.toString('utf8')));
    this.proc.on('exit', (code) => onExit(code));
  }

  run(command) {
    if (!this.proc || this.proc.killed) return;
    this.proc.stdin.write(command + '\n');
  }

  kill() {
    if (this.proc && !this.proc.killed) this.proc.kill();
  }
}

module.exports = { Session };
