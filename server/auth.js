const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const TOKEN_FILE = path.join(__dirname, '..', '.connector-token');

function loadOrCreateToken() {
  if (fs.existsSync(TOKEN_FILE)) {
    return fs.readFileSync(TOKEN_FILE, 'utf8').trim();
  }
  const token = crypto.randomBytes(24).toString('hex');
  fs.writeFileSync(TOKEN_FILE, token, { mode: 0o600 });
  return token;
}

function isValidToken(candidate, expected) {
  const a = Buffer.from(candidate || '');
  const b = Buffer.from(expected || '');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { loadOrCreateToken, isValidToken };
