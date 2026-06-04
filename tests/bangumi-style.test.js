const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '../src/lib/templates/index.css'), 'utf8');

const blockFor = (selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `Missing CSS block for ${selector}`);
  return match[1];
};

const mediaBlockFor = (width) => {
  const match = css.match(new RegExp(`@media \\(max-width: ${width}px\\) \\{([\\s\\S]*?)\\n\\}`));
  assert.ok(match, `Missing max-width:${width}px media block`);
  return match[1];
};

test('keeps legacy responsive metadata hiding rules', () => {
  assert.match(mediaBlockFor(650), /\.bangumi-coin,\s*\n\s*\.bangumi-type\s*\{[\s\S]*?display: none;/);
  assert.match(mediaBlockFor(590), /\.bangumi-danmaku,\s*\n\s*\.bangumi-wish\s*\{[\s\S]*?display: none;/);
  assert.match(mediaBlockFor(520), /\.bangumi-play,\s*\n\s*\.bangumi-doing\s*\{[\s\S]*?display: none;/);
  assert.match(mediaBlockFor(480), /\.bangumi-follow,\s*\n\s*\.bangumi-info-item-follow,\s*\n\s*\.bangumi-collect\s*\{[\s\S]*?display: none;/);
  assert.match(mediaBlockFor(400), /\.bangumi-area,\s*\n\s*\.bangumi-tag\s*\{[\s\S]*?display: none;/);
  assert.match(mediaBlockFor(270), /\.bangumi-info-item-score\s*\{[\s\S]*?display: none;/);
});

test('lays out cover and info as aligned columns with left breathing room', () => {
  assert.match(blockFor('.bangumi-item'), /display: flex;/);
  assert.match(blockFor('.bangumi-item'), /align-items: flex-start;/);
  assert.match(blockFor('.bangumi-item'), /gap: 20px;/);
  assert.match(blockFor('.bangumi-picture'), /position: static;/);
  assert.match(blockFor('.bangumi-picture'), /margin-left: 4px;/);
  assert.match(blockFor('.bangumi-info'), /padding-left: 0;/);
});
