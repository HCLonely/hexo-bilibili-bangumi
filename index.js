/* global hexo */
'use strict';
const fs = require('hexo-fs');
const path = require('path');
const log = require('hexo-log')({
  debug: false,
  silent: false
});

hexo.extend.generator.register('bangumis', function (locals) {
  if (!this.config.bangumi) {
    return;
  }
  return require('./lib/bangumi-generator').call(this, locals);
});

hexo.extend.console.register('bangumis', 'Generate pages from bangumi', function (args) {
  //Register route
  hexo.extend.generator.register("bangumis", require('./lib/bangumi-generator'));

  let self = this;
  let publicDir = self.public_dir;

  //Generate files
  self.load().then(function () {
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }
    const id = "bangumis/index.html";
    self.route.get(id) && self.route.get(id)._data().then(function (contents) {
      fs.writeFile(path.join(publicDir, id), contents);
      log.info("Generated: %s", id);
    });
  });
});