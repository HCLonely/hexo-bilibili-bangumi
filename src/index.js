/* global hexo */
'use strict';
const fs = require('hexo-fs');
const path = require('path');
const log = require('hexo-log')({
  debug: false,
  silent: false
});
const { getBiliData } = require('./lib/get-bili-data');
const { getBgmData } = require('./lib/get-bgm-data');

// eslint-disable-next-line no-var
if (typeof URL !== 'function') var { URL } = require('url');

const options = {
  options: [
    { name: '-u, --update', desc: 'Update data' },
    { name: '-d, --delete', desc: 'Delete data' }
  ]
};
hexo.extend.generator.register('bangumis', function (locals) {
  if (!this?.config?.bangumi?.enable) {
    return;
  }
  return require('./lib/bangumi-generator').call(this, locals, 'bangumi');
});
hexo.extend.generator.register('cinemas', function (locals) {
  if (!this?.config?.cinema?.enable) {
    return;
  }
  return require('./lib/bangumi-generator').call(this, locals, 'cinema');
});
hexo.extend.console.register('bangumi', 'Generate pages of bangumis for Hexo', options, function (args) {
  if (args.d) {
    if (fs.existsSync(path.join(this.source_dir, '/_data/bangumis.json'))) {
      fs.unlinkSync(path.join(this.source_dir, '/_data/bangumis.json'));
      log.info('Bangumis data has been deleted');
    }
  } else if (args.u) {
    if (!this?.config?.bangumi) {
      log.info('Please add config to _config.yml');
      return;
    }
    if (!this.config.bangumi.enable) {
      return;
    }
    if (!this.config.bangumi.vmid) {
      log.info('Please add vmid to _config.yml');
      return;
    }
    if (this.config.bangumi.source === 'bgm') {
      getBgmData(this.config.bangumi.vmid, this.config.bangumi.progress ?? true, this.source_dir, this.config.bangumi.proxy);
    } else {
      getBiliData(this.config.bangumi.vmid, 'bangumi', this.config.bangumi.progress ?? true, this.source_dir, this.config.bangumi.webp);
    }
  } else {
    log.info('Unknown command, please use "hexo bangumi -h" to see the available commands');
  }
});
hexo.extend.console.register('cinema', 'Generate pages of bilibili cinemas for Hexo', options, function (args) {
  if (args.d) {
    if (fs.existsSync(path.join(this.source_dir, '/_data/cinemas.json'))) {
      fs.unlinkSync(path.join(this.source_dir, '/_data/cinemas.json'));
      log.info('Cinemas data has been deleted');
    }
  } else if (args.u) {
    if (!this?.config?.cinema) {
      log.info('Please add config to _config.yml');
      return;
    }
    if (!this.config.cinema.enable) {
      return;
    }
    if (!this.config.cinema.vmid) {
      log.info('Please add vmid to _config.yml');
      return;
    }
    getBiliData(this.config.cinema.vmid, 'cinema', this.config.cinema.progress ?? true, this.source_dir, this.config.cinema.webp);
  } else {
    log.info('Unknown command, please use "hexo cinema -h" to see the available commands');
  }
});
