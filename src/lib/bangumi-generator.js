'use strict';

const ejs = require('ejs');
const path = require('path');
const { i18n } = require('./util');
const fs = require('hexo-fs');
const log = require('hexo-log')({
  debug: false,
  silent: false
});

module.exports = async function (locals, type = 'bangumi') {
  const { config } = this;
  if (!config?.[type]?.enable) {
    return;
  }

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
    source: config[type].source ?? 'bili',
    wantWatch,
    watched,
    watching,
    type,
    __,
    root
  }, { async: false });

  const customPath = config[type].path;
  return {
    path: customPath || (`${type}s/index.html`),
    data: {
      title: config[type].title,
      content: contents,
      ...config?.[type]?.extra_options
    },
    layout: ['page', 'post']
  };
};
