'use strict';

const ejs = require('ejs');
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
  // eslint-disable-next-line camelcase
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

  const contents = await ejs.renderFile(path.join(__dirname, 'templates/bangumi.ejs'), {
    quote: config[type].quote,
    show: config[type].show || 1,
    loading: config[type].loading,
    metaColor: config[type].metaColor ? `style="color:${config[type].metaColor}"` : '',
    color: config[type].color ? `style="color:${config[type].color}"` : '',
    lazyload: config[type].lazyload ?? true,
    lazyloadAttrName: config[type].lazyloadAttrName,
    srcValue: config[type].srcValue || '__image__',
    source: config[type].source ?? 'bili',
    showMyComment: config[type].showMyComment ?? false,
    pagination: config[type].pagination ?? false,
    theme: fs.existsSync(path.join(__dirname, `templates/theme/${config.theme}.min.css`)) ? config.theme : null,
    ejsTemplate: fs.readFileSync(path.join(__dirname, `templates/${config[type].source === 'bili' ? 'bili' : 'bgm'}-template.ejs`)).toString()
      .replace('class="bangumi-item"', 'class="bangumi-item bangumi-hide"'),
    wantWatch,
    watched,
    watching,
    type,
    __,
    root
  }, { async: false });

  const customPath = config[type].path || (`${type}s/index.html`);
  return {
    path: customPath,
    data: {
      title: config[type].title,
      content: contents,
      permalink: full_url_for(customPath),
      ...config?.[type]?.extra_options
    },
    layout: ['page', 'post']
  };
};
