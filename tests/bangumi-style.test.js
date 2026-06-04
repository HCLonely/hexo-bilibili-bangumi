const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '../src/lib/templates/index.css'), 'utf8');
const fluidCss = fs.readFileSync(path.join(__dirname, '../src/lib/templates/theme/fluid.css'), 'utf8');

const blockFor = (selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `Missing CSS block for ${selector}`);
  return match[1];
};

const containerBlockFor = (width) => {
  const match = css.match(new RegExp(`@container \\(max-width: ${width}px\\) \\{([\\s\\S]*?)\\n\\}`));
  assert.ok(match, `Missing max-width:${width}px container block`);
  return match[1];
};

const fluidBlockFor = (selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = fluidCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `Missing Fluid CSS block for ${selector}`);
  return match[1];
};

test('hides metadata based on bangumi item width', () => {
  assert.match(blockFor('.bangumi-item'), /container-type: inline-size;/);
  assert.match(containerBlockFor(650), /\.bangumi-coin,\s*\n\s*\.bangumi-type,\s*\n\s*\.bangumi-follow,\s*\n\s*\.bangumi-info-item-follow\s*\{[\s\S]*?display: none;/);
  assert.match(containerBlockFor(590), /\.bangumi-danmaku,\s*\n\s*\.bangumi-wish\s*\{[\s\S]*?display: none;/);
  assert.match(containerBlockFor(520), /\.bangumi-play,\s*\n\s*\.bangumi-doing\s*\{[\s\S]*?display: none;/);
  assert.match(containerBlockFor(480), /\.bangumi-collect\s*\{[\s\S]*?display: none;/);
  assert.match(containerBlockFor(400), /\.bangumi-area,\s*\n\s*\.bangumi-tag\s*\{[\s\S]*?display: none;/);
  assert.match(containerBlockFor(270), /\.bangumi-info-item-score\s*\{[\s\S]*?display: none;/);
});

test('lays out cover and info as aligned columns with left breathing room', () => {
  assert.match(blockFor('.bangumi-item'), /display: flex;/);
  assert.match(blockFor('.bangumi-item'), /align-items: flex-start;/);
  assert.match(blockFor('.bangumi-item'), /gap: 20px;/);
  assert.match(blockFor('.bangumi-picture'), /position: static;/);
  assert.match(blockFor('.bangumi-picture'), /margin-left: 4px;/);
  assert.match(blockFor('.bangumi-info'), /padding-left: 0;/);
});

test('keeps progress visually separated from metadata', () => {
  assert.match(blockFor('.bangumi-info .bangumi-progress'), /margin-top: 16px !important;/);
});

test('fluid compatibility styles preserve the non-overlapping cover layout', () => {
  assert.match(fluidBlockFor('.bangumi-item'), /padding:25px 20px;/);
  assert.match(fluidBlockFor('.bangumi-picture'), /position:static;/);
  assert.match(fluidBlockFor('.bangumi-picture'), /flex:0 0 110px;/);
  assert.match(fluidBlockFor('.bangumi-picture'), /margin-left:4px;/);
  assert.doesNotMatch(fluidBlockFor('.bangumi-picture'), /position:absolute;/);
});
