/*
 * @Author       : HCLonely
 * @Date         : 2024-09-11 15:40:57
 * @LastEditTime : 2025-08-15 09:58:47
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/src/lib/bangumi-generator.js
 * @Description  : Hexo页面生成器模块，负责生成番剧、影视和游戏的展示页面。
 *                 支持多种数据源模板（B站、Bangumi、AniList），可配置主题样式、
 *                 分页、排序、懒加载等功能，并支持额外数据的混合展示。
 */

const pug = require('pug');
const path = require('path');
const { i18n } = require('./util');
const fs = require('hexo-fs');
const hexoLog = require('hexo-log');
const log = typeof hexoLog.default === 'function' ? hexoLog.default({
  debug: false,
  silent: false
}) : hexoLog({
  debug: false,
  silent: false
});

module.exports = async function (locals, type = 'bangumi') {
  const { config } = this;
  if (!config?.[type]?.enable) {
    return;
  }

  const full_url_for = this.extend.helper.get('full_url_for').bind(this);

  let { root } = config;
  if (root.endsWith('/')) {
    root = root.slice(0, root.length - 1);
  }
  let wantWatch = [];
  let watching = [];
  let watched = [];
  if (!fs.existsSync(path.join(this.source_dir, `/_data/${type}s.json`))) {
    log.info(`Can't find bilibili ${type} data, please use 'hexo ${type} -u' command to get data`);
  } else {
    ({ wantWatch, watching, watched } = JSON.parse(fs.readFileSync(path.join(this.source_dir, `/_data/${type}s.json`))));

    // extra bangumis
    if (fs.existsSync(path.join(this.source_dir, `/_data/extra_${type}s.json`))) {
      log.info(`Found extra ${type}s data`);
      const { wantWatchExtra, watchingExtra, watchedExtra } = JSON.parse(fs.readFileSync(path.join(this.source_dir, `/_data/extra_${type}s.json`)));
      if (wantWatchExtra) {
        if (config[type].extraOrder === 1) {
          wantWatch = [...wantWatchExtra, ...wantWatch];
        } else {
          wantWatch = [...wantWatch, ...wantWatchExtra];
        }
      }
      if (watchingExtra) {
        if (config[type].extraOrder === 1) {
          watching = [...watchingExtra, ...watching];
        } else {
          watching = [...watching, ...watchingExtra];
        }
      }
      if (watchedExtra) {
        if (config[type].extraOrder === 1) {
          watched = [...watchedExtra, ...watched];
        } else {
          watched = [...watched, ...watchedExtra];
        }
      }
    }

    log.info(`${wantWatch.length + watching.length + watched.length} ${type}s have been loaded`);
  }

  // eslint-disable-next-line no-underscore-dangle
  const __ = i18n.__(config.language);

  const TEMPLATE_MAP = {
    bili: 'bili-template.pug',
    bgmv0: 'bgmv0-template.pug',
    bgm: 'bgm-template.pug',
    bangumi: 'bgm-template.pug',
    anilist: 'anilist-template.pug',
    simkl: 'simkl-template.pug'
  };
  const contents = await pug.renderFile(path.join(__dirname, 'templates/bangumi.pug'), {
    quote: config[type].quote,
    show: config[type].show || 1,
    // loading: config[type].loading,
    metaColor: config[type].metaColor,
    color: config[type].color,
    lazyload: config[type].lazyload ?? true,
    // lazyloadAttrName: config[type].lazyloadAttrName,
    srcValue: config[type].srcValue || '__image__',
    source: config[type].source ?? 'bili',
    showMyComment: config[type].showMyComment ?? false,
    pagination: config[type].pagination ?? false,
    progressBar: config[type].progressBar ?? true,
    theme: fs.existsSync(path.join(__dirname, `templates/theme/${config.theme}.min.css`)) ? config.theme : null,
    pugTemplate: config[type].pagination ? fs.readFileSync(path.join(__dirname, `templates/${TEMPLATE_MAP[config[type].source]}`)).toString()
      .replace('.bangumi-item', '.bangumi-item.bangumi-hide')
      // .replace(/=\s*?__\('(.+?)'\)/g, (match, key) => ` ${__(key)}`)
      .replace(/__\('(.+?)'\)/g, (match, key) => `('${__(key)}')`) : '',
    wantWatch: ['score', '-score'].includes(config[type].order) ? wantWatch.sort((a, b) => (config[type].order === 'score' ? (a.score - b.score) : (b.score - a.score))) : wantWatch,
    watched: ['score', '-score'].includes(config[type].order) ? watched.sort((a, b) => (config[type].order === 'score' ? (a.score - b.score) : (b.score - a.score))) : watched,
    watching: ['score', '-score'].includes(config[type].order) ? watching.sort((a, b) => (config[type].order === 'score' ? (a.score - b.score) : (b.score - a.score))) : watching,
    type,
    __,
    root,
    basedir: process.cwd()
  }, { async: false });

  const customPath = config[type].path || (`${type}s/index.html`);
  return {
    path: customPath,
    data: {
      title: config[type].title,
      content: contents,
      type: 'page',
      permalink: full_url_for(customPath),
      ...config?.[type]?.extra_options
    },
    layout: ['page', 'post']
  };
};
