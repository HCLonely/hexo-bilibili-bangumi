/*
 * @Author       : HCLonely
 * @Date         : 2025-07-09 19:24:22
 * @LastEditTime : 2025-07-10 14:02:12
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/scripts/babel.js
 * @Description  : Babel编译脚本，用于将ES6+代码转换为兼容版本。分别处理Node.js环境代码和浏览器环境代码，
 *                 其中Node.js代码使用@babel/preset-env进行转换，浏览器代码额外使用minify进行压缩。
 */
const babel = require('@babel/core');
const fs = require('fs');

const nodeFiles = [
  {
    from: 'src/index.js',
    to: 'index.js'
  },
  {
    from: 'src/lib/util.js',
    to: 'lib/util.js'
  },
  {
    from: 'src/lib/get-bili-data.js',
    to: 'lib/get-bili-data.js'
  },
  {
    from: 'src/lib/get-bgm-data.js',
    to: 'lib/get-bgm-data.js'
  },
  {
    from: 'src/lib/get-bgmv0-data.js',
    to: 'lib/get-bgmv0-data.js'
  },
  {
    from: 'src/lib/get-anilist-data.js',
    to: 'lib/get-anilist-data.js'
  },
  {
    from: 'src/lib/get-simkl-data.js',
    to: 'lib/get-simkl-data.js'
  },
  {
    from: 'src/lib/bangumi-generator.js',
    to: 'lib/bangumi-generator.js'
  }
];
const browserFiles = [
  {
    from: 'src/lib/templates/index.js',
    to: 'lib/templates/index.js'
  },
  {
    from: 'src/lib/templates/pagination.js',
    to: 'lib/templates/pagination.js'
  }
];

const nodeOptions = {
  presets: [
    '@babel/preset-env'
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
};

const browserOptions = {
  presets: ['@babel/preset-env', 'minify'],
  targets: '> 0.25%, not dead'
};

nodeFiles.forEach((file) => {
  const code = fs.readFileSync(file.from, 'utf-8');
  const result = babel.transformSync(code, nodeOptions);
  fs.writeFileSync(file.to, result.code);
});

browserFiles.forEach((file) => {
  const code = fs.readFileSync(file.from, 'utf-8');
  const result = babel.transformSync(code, browserOptions);
  fs.writeFileSync(file.to, result.code);
});
