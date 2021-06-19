'use strict'

const ejs = require('ejs')
const path = require('path')
const i18n = require('./util').i18n
const fs = require('hexo-fs')
const log = require('hexo-log')({
  debug: false,
  silent: false
})

module.exports = async function (locals) {
  const config = this.config
  if (!config?.bangumi?.enable) {
    return
  }

  let root = config.root
  if (root.endsWith('/')) {
    root = root.slice(0, root.length - 1)
  }
  let wantWatch = []; let watching = []; let watched = [];
  // console.log(path.join(this.source_dir, '/_data/bangumis.json'))
  if (!fs.existsSync(path.join(this.source_dir, '/_data/bangumis.json'))) {
    log.info('Can\'t find bilibili bangumi data, please use \'hexo bangumi -u\' command to get data')
  } else {
    ({ wantWatch, watching, watched } = JSON.parse(fs.readFileSync(path.join(this.source_dir, '/_data/bangumis.json'))))

    // extra bangumis
    console.log(path.join(this.source_dir, '/_data/extra_bangumis.json'))
    if (fs.existsSync(path.join(this.source_dir, '/_data/extra_bangumis.json'))) {
      log.info('Found extra bangumi data');
      let wantWatchExtra = []; let watchingExtra = []; let watchedExtra = [];
      ({ wantWatchExtra, watchingExtra, watchedExtra } = JSON.parse(fs.readFileSync(path.join(this.source_dir, '/_data/extra_bangumis.json'))))
      if (wantWatchExtra) {
        wantWatch = wantWatch.concat(wantWatchExtra)
      }
      if (watchingExtra) {
        watching = watching.concat(watchingExtra)
      }
      if (watchedExtra) {
        watched = watched.concat(watchedExtra)
      }
    }

    log.info(wantWatch.length + watching.length + watched.length + ' bangumis have been loaded')
  }

  const __ = i18n.__(config.language)

  const ejsFile = config?.bangumi?.bgmtv ? 'templates/bangumi-tv.ejs' : 'templates/bangumi.ejs'
  log.info('use ' + ejsFile)

  const contents = await ejs.renderFile(path.join(__dirname, ejsFile), {
    quote: config.bangumi.quote,
    show: config.bangumi.show || 1,
    loading: config.bangumi.loading,
    metaColor: config.bangumi.metaColor ? `style="color:${config.bangumi.metaColor}"` : '',
    color: config.bangumi.color ? `style="color:${config.bangumi.color}"` : '',
    wantWatch: wantWatch,
    watched: watched,
    watching: watching,
    __: __,
    root: root
  },{ async: false })

  return {
    path: config.bangumi.path || 'bangumis/index.html',
    data: {
      title: config.bangumi.title,
      content: contents
    },
    layout: ['page', 'post']
  }
}
