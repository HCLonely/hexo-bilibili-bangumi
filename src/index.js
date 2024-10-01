/* global hexo */
'use strict';
const fs = require('hexo-fs');
const path = require('path');
const hexoLog = require('hexo-log');
const log = typeof hexoLog.default === 'function' ? hexoLog.default({
  debug: false,
  silent: false
}) : hexoLog({
  debug: false,
  silent: false
});
const { getBiliData } = require('./lib/get-bili-data');
const { getBgmData } = require('./lib/get-bgm-data');
const { getBgmv0Data } = require('./lib/get-bgmv0-data');

// eslint-disable-next-line no-var
if (typeof URL !== 'function') var { URL } = require('url');

const options = {
  options: [
    { name: '-u, --update', desc: 'Update data' },
    { name: '-d, --delete', desc: 'Delete data' }
  ]
};
hexo.extend.generator.register('bangumis-bangumi', function (locals) {
  if (!this?.config?.bangumi?.enable) {
    return;
  }
  return require('./lib/bangumi-generator').call(this, locals, 'bangumi');
});
hexo.extend.generator.register('bangumis-cinema', function (locals) {
  if (!this?.config?.cinema?.enable) {
    return;
  }
  return require('./lib/bangumi-generator').call(this, locals, 'cinema');
});

hexo.extend.generator.register('bangumis-game', function (locals) {
  if (!this?.config?.game?.enable) {
    return;
  }
  return require('./lib/bangumi-generator').call(this, locals, 'game');
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
    if (['bgm', 'bangumi'].includes(this.config.bangumi.source)) {
      getBgmData({
        vmid: this.config.bangumi.vmid,
        type: "bangumi",
        showProgress: this.config.bangumi.progress ?? true,
        sourceDir: this.source_dir,
        extraOrder: this.config.bangumi.extraOrder,
        pagination: this.config.bangumi.pagination,
        proxy: this.config.bangumi.proxy,
        infoApi: this.config.bangumi.bgmInfoApi,
        host: `${this.config.bangumi.source}.tv`,
        coverMirror: this.config.bangumi.coverMirror ?? ''
      });
    } else if (this.config.bangumi.source === 'bgmv0') {
      getBgmv0Data({
        vmid: this.config.bangumi.vmid,
        type: 2,
        showProgress: this.config.bangumi.progress ?? true,
        sourceDir: this.source_dir,
        extraOrder: this.config.bangumi.extraOrder,
        pagination: this.config.bangumi.pagination,
        proxy: this.config.bangumi.proxy,
        coverMirror: this.config.bangumi.coverMirror ?? ''
      });
    } else {
      getBiliData({
        vmid: this.config.bangumi.vmid,
        type: 'bangumi',
        showProgress: this.config.bangumi.progress ?? true,
        sourceDir: this.source_dir,
        extraOrder: this.config.bangumi.extraOrder,
        pagination: this.config.bangumi.pagination,
        useWebp: this.config.bangumi.webp,
        coverMirror: this.config.bangumi.coverMirror ?? '',
        SESSDATA: typeof args.u === 'string' ? args.u : null
      });
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
    getBiliData({
      vmid: this.config.cinema.vmid,
      type: "cinema",
      showProgress: this.config.cinema.progress ?? true,
      sourceDir: this.source_dir,
      extraOrder: this.config.cinema.extraOrder,
      pagination: this.config.cinema.pagination,
      useWebp: this.config.cinema.webp,
      coverMirror: this.config.cinema.coverMirror ?? "",
    });
  } else {
    log.info('Unknown command, please use "hexo cinema -h" to see the available commands');
  }
});

hexo.extend.console.register('game', 'Generate pages of games for Hexo', options, function (args) {
  if (args.d) {
    if (fs.existsSync(path.join(this.source_dir, '/_data/games.json'))) {
      fs.unlinkSync(path.join(this.source_dir, '/_data/games.json'));
      log.info('Games data has been deleted');
    }
  } else if (args.u) {
    if (!this?.config?.game) {
      log.info('Please add config to _config.yml');
      return;
    }
    if (!this.config.game.enable) {
      return;
    }
    if (!this.config.game.vmid) {
      log.info('Please add vmid to _config.yml');
      return;
    }
    if (this.config.game.source !== 'bgmv0') {
      log.info(`${this.config.bangumi.source} not support`);
      return;
    }
    getBgmv0Data({
      vmid: this.config.game.vmid,
      type: 4,
      showProgress: this.config.game.progress ?? true,
      sourceDir: this.source_dir,
      extraOrder: this.config.game.extraOrder,
      pagination: this.config.game.pagination,
      proxy: this.config.game.proxy,
      coverMirror: this.config.game.coverMirror ?? ''
    });
  } else {
    log.info('Unknown command, please use "hexo game -h" to see the available commands');
  }
});
