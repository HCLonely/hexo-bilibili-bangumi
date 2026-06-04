"use strict";

var ASSET_BLOCK_RE = /<!--\s*hexo-bilibili-bangumi-assets-start\s*-->([\s\S]*?)<!--\s*hexo-bilibili-bangumi-assets-end\s*-->/g;
var STYLE_RE = /<style\b[^>]*>[\s\S]*?<\/style>/gi;
var SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
var injectBefore = function injectBefore(html, pattern, value) {
  if (!value) {
    return html;
  }
  if (pattern.test(html)) {
    return html.replace(pattern, "".concat(value, "$&"));
  }
  return "".concat(value).concat(html);
};
var hoistBangumiAssets = function hoistBangumiAssets(html) {
  if (!html || !html.includes('hexo-bilibili-bangumi-assets-start')) {
    return html;
  }
  var styles = [];
  var scripts = [];
  var content = html.replace(ASSET_BLOCK_RE, function (_, block) {
    block.replace(STYLE_RE, function (style) {
      styles.push(style);
      return '';
    });
    block.replace(SCRIPT_RE, function (script) {
      scripts.push(script);
      return '';
    });
    return '';
  });
  return injectBefore(injectBefore(content, /<\/head>/i, styles.join('')), /<\/body>/i, scripts.join(''));
};
module.exports = {
  hoistBangumiAssets: hoistBangumiAssets
};