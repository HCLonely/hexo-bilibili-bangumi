const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');

const generator = require('../lib/bangumi-generator');

const renderBangumi = async (typeConfig) => generator.call({
  source_dir: path.join(__dirname, 'fixtures'),
  config: {
    root: '/',
    language: 'zh-CN',
    theme: 'site-theme',
    bangumi: {
      enable: true,
      source: 'bili',
      title: '追番列表',
      quote: '生命不息，追番不止！',
      show: 1,
      ...typeConfig
    }
  },
  extend: {
    helper: {
      get: () => (customPath) => `https://example.com/${customPath}`
    }
  }
}, {}, 'bangumi');

test('uses page theme config independently from global theme config', async () => {
  const page = await renderBangumi({ theme: 'dark' });

  assert.match(page.data.content, /bangumi-container/);
  assert.match(page.data.content, /bangumi-theme-dark/);
  assert.doesNotMatch(page.data.content, /bangumi-theme-site-theme/);
});

test('falls back to auto for unsupported page theme values', async () => {
  const page = await renderBangumi({ theme: 'unknown' });

  assert.match(page.data.content, /bangumi-theme-auto/);
});
