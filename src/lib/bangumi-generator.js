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
  let wantWatch = []; let watching = []; let watched = []
  console.log(path.join(this.source_dir, '/_data/bangumis.json'))
  if (!fs.existsSync(path.join(this.source_dir, '/_data/bangumis.json'))) {
    log.info('Can\'t find bilibili bangumi data, please use \'hexo bangumi -u\' command to get data')
  } else {
    ({ wantWatch, watching, watched } = JSON.parse(fs.readFileSync(path.join(this.source_dir, '/_data/bangumis.json'))))
    log.info(wantWatch.length + watching.length + watched.length + ' bangumis have been loaded')
  }

  const __ = i18n.__(config.language)

  const contents = ejs.renderFile(path.join(__dirname, 'templates/bangumi.ejs'), {
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
  },
  function (err, result) {
    if (err) console.log(err)
    return result
  })

  return {
    path: config.bangumi.path || 'bangumis/index.html',
    data: {
      title: config.bangumi.title,
      content: contents
    },
    layout: ['page', 'post']
  }
}
