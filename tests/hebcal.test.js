// Tests for hebcal.js. Run them with: npm test
// They use Node's built-in test tools, so there is nothing to install.
// The getHebrewDate tests use a fake fetch, so they do not need the internet.
const test = require('node:test');
const assert = require('node:assert');
const { buildConverterUrl, getHebrewDate } = require('../hebcal.js');

// A correct Hebcal answer for 2011-06-02 after sunset (copied from the real API).
const GOOD_ANSWER = {
  gy: 2011, gm: 6, gd: 2, afterSunset: true,
  hy: 5771, hm: 'Sivan', hd: 1, hebrew: 'א׳ בְּסִיוָן תשע״א',
};

// Replaces the real fetch with a fake one that always returns this answer.
// t.mock puts the real fetch back when the test ends.
function fakeFetch(t, body, status = 200) {
  return t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(body), { status }));
}

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

test('getHebrewDate returns only the fields the page needs', async (t) => {
  const fetchMock = fakeFetch(t, GOOD_ANSWER);

  const result = await getHebrewDate('2011-06-02', true);

  assert.deepStrictEqual(result, {
    hebrew: 'א׳ בְּסִיוָן תשע״א', gy: 2011, gm: 6, gd: 2, afterSunset: true,
  });
  const calledUrl = new URL(fetchMock.mock.calls[0].arguments[0]);
  assert.strictEqual(calledUrl.searchParams.get('gs'), 'on');
});

test('getHebrewDate keeps the HTTP status code when Hebcal answers with an error', async (t) => {
  fakeFetch(t, { error: 'Date does not match format YYYY-MM-DD: abc' }, 400);
  t.mock.method(console, 'error', () => {}); // keep the test output clean

  await assert.rejects(getHebrewDate('abc', false), (error) => error.status === 400);
});

test('getHebrewDate rejects an answer with missing fields', async (t) => {
  fakeFetch(t, { hebrew: 'א׳ בְּסִיוָן תשע״א' }); // gy, gm, gd and afterSunset are missing

  await assert.rejects(getHebrewDate('2011-06-02', true), /missing fields/);
});
