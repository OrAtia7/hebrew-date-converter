// Run with: npm test   (uses Node's built-in test runner, no dependencies)
const test = require('node:test');
const assert = require('node:assert');
const { buildConverterUrl } = require('../hebcal.js');

test('builds a Gregorian-to-Hebrew URL without gs by default', () => {
  const url = new URL(buildConverterUrl('2011-06-02', false));

  assert.strictEqual(url.origin + url.pathname, 'https://www.hebcal.com/converter');
  assert.strictEqual(url.searchParams.get('date'), '2011-06-02');
  assert.strictEqual(url.searchParams.get('cfg'), 'json');
  assert.strictEqual(url.searchParams.get('g2h'), '1');
  assert.strictEqual(url.searchParams.get('strict'), '1');
  assert.strictEqual(url.searchParams.has('gs'), false);
});

test('adds gs=on when the date is after sunset', () => {
  const url = new URL(buildConverterUrl('2011-06-02', true));

  assert.strictEqual(url.searchParams.get('gs'), 'on');
});
