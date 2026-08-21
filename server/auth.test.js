const test = require('node:test');
const assert = require('node:assert');
const { isValidToken } = require('./auth');

test('isValidToken accepts matching tokens', () => {
  assert.strictEqual(isValidToken('abc123', 'abc123'), true);
});

test('isValidToken rejects mismatched tokens', () => {
  assert.strictEqual(isValidToken('abc123', 'xyz789'), false);
});

test('isValidToken rejects different-length tokens', () => {
  assert.strictEqual(isValidToken('abc', 'abcdef'), false);
});
