const ASSET_BLOCK_RE = /<!--\s*hexo-bilibili-bangumi-assets-start\s*-->([\s\S]*?)<!--\s*hexo-bilibili-bangumi-assets-end\s*-->/g;
const STYLE_RE = /<style\b[^>]*>[\s\S]*?<\/style>/gi;
const SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi;

const injectBefore = (html, pattern, value) => {
  if (!value) {
    return html;
  }
  if (pattern.test(html)) {
    return html.replace(pattern, `${value}$&`);
  }
  return `${value}${html}`;
};

const hoistBangumiAssets = (html) => {
  if (!html || !html.includes('hexo-bilibili-bangumi-assets-start')) {
    return html;
  }

  const styles = [];
  const scripts = [];
  const content = html.replace(ASSET_BLOCK_RE, (_, block) => {
    block.replace(STYLE_RE, (style) => {
      styles.push(style);
      return style;
    });
    block.replace(SCRIPT_RE, (script) => {
      scripts.push(script);
      return script;
    });
    return block;
  });

  return injectBefore(
    injectBefore(content, /<\/head>/i, styles.join('')),
    // /<\/body>/i,
    /<\/head>/i,
    scripts.join('')
  );
};

module.exports = {
  hoistBangumiAssets
};
