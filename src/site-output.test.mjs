import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

// Checks the exported static output. Skipped entirely before the first build.
const built = existsSync('out/index.html');
const read = (file) => readFileSync(`out/${file}`, 'utf8');
const firstExisting = (...candidates) => candidates.find((file) => existsSync(`out/${file}`));

test('home page has exactly one h1', { skip: !built }, () => {
  assert.equal((read('index.html').match(/<h1/g) ?? []).length, 1);
});

test('developer portal pages exist with their titles', { skip: !built }, () => {
  const developers = firstExisting('developers.html', 'developers/index.html');
  const mcp = firstExisting('developers/mcp.html', 'developers/mcp/index.html');
  assert.ok(developers, 'developers page missing from out/');
  assert.ok(mcp, 'developers/mcp page missing from out/');
  assert.match(read(developers), /<title>Screen API &amp; developer portal<\/title>|<title>Screen API & developer portal<\/title>/);
  assert.match(read(mcp), /<title>Screen MCP server/);
});

test('sitemap lists the developer pages', { skip: !built }, () => {
  const sitemap = read('sitemap.xml');
  assert.match(sitemap, /screeen\.us\.ci\/developers<\/loc>/);
  assert.match(sitemap, /screeen\.us\.ci\/developers\/mcp<\/loc>/);
});

test('llms.txt links to the developer portal', { skip: !built }, () => {
  assert.match(read('llms.txt'), /\/developers/);
});
