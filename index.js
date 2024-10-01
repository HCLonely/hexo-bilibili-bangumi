/* global hexo */
'use strict';

var fs = require('hexo-fs');
var path = require('path');
var hexoLog = require('hexo-log');
var log = typeof hexoLog["default"] === 'function' ? hexoLog["default"]({
  debug: false,
  silent: false
}) : hexoLog({
  debug: false,
  silent: false
});
var _require = require('./lib/get-bili-data'),
  getBiliData = _require.getBiliData;
var _require2 = require('./lib/get-bgm-data'),
  getBgmData = _require2.getBgmData;
var _require3 = require('./lib/get-bgmv0-data'),
  getBgmv0Data = _require3.getBgmv0Data;

// eslint-disable-next-line no-var
if (typeof URL !== 'function') var _require4 = require('url'),
  URL = _require4.URL;
var options = {
  options: [{
    name: '-u, --update',
    desc: 'Update data'
  }, {
    name: '-d, --delete',
    desc: 'Delete data'
  }]
};
hexo.extend.generator.register('bangumis-bangumi', function (locals) {
  var _this$config;
  if (!(this !== null && this !== void 0 && (_this$config = this.config) !== null && _this$config !== void 0 && (_this$config = _this$config.bangumi) !== null && _this$config !== void 0 && _this$config.enable)) {
    return;
  }
  return require('./lib/bangumi-generator').call(this, locals, 'bangumi');
});
hexo.extend.generator.register('bangumis-cinema', function (locals) {
  var _this$config2;
  if (!(this !== null && this !== void 0 && (_this$config2 = this.config) !== null && _this$config2 !== void 0 && (_this$config2 = _this$config2.cinema) !== null && _this$config2 !== void 0 && _this$config2.enable)) {
    return;
  }
  return require('./lib/bangumi-generator').call(this, locals, 'cinema');
});
hexo.extend.generator.register('bangumis-game', function (locals) {
  var _this$config3;
  if (!(this !== null && this !== void 0 && (_this$config3 = this.config) !== null && _this$config3 !== void 0 && (_this$config3 = _this$config3.game) !== null && _this$config3 !== void 0 && _this$config3.enable)) {
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
    var _this$config4;
    if (!(this !== null && this !== void 0 && (_this$config4 = this.config) !== null && _this$config4 !== void 0 && _this$config4.bangumi)) {
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
      var _this$config$bangumi$, _this$config$bangumi$2;
      getBgmData({
        vmid: this.config.bangumi.vmid,
        type: "bangumi",
        showProgress: (_this$config$bangumi$ = this.config.bangumi.progress) !== null && _this$config$bangumi$ !== void 0 ? _this$config$bangumi$ : true,
        sourceDir: this.source_dir,
        extraOrder: this.config.bangumi.extraOrder,
        pagination: this.config.bangumi.pagination,
        proxy: this.config.bangumi.proxy,
        infoApi: this.config.bangumi.bgmInfoApi,
        host: "".concat(this.config.bangumi.source, ".tv"),
        coverMirror: (_this$config$bangumi$2 = this.config.bangumi.coverMirror) !== null && _this$config$bangumi$2 !== void 0 ? _this$config$bangumi$2 : ''
      });
    } else if (this.config.bangumi.source === 'bgmv0') {
      var _this$config$bangumi$3, _this$config$bangumi$4;
      getBgmv0Data({
        vmid: this.config.bangumi.vmid,
        type: 2,
        showProgress: (_this$config$bangumi$3 = this.config.bangumi.progress) !== null && _this$config$bangumi$3 !== void 0 ? _this$config$bangumi$3 : true,
        sourceDir: this.source_dir,
        extraOrder: this.config.bangumi.extraOrder,
        pagination: this.config.bangumi.pagination,
        proxy: this.config.bangumi.proxy,
        coverMirror: (_this$config$bangumi$4 = this.config.bangumi.coverMirror) !== null && _this$config$bangumi$4 !== void 0 ? _this$config$bangumi$4 : ''
      });
    } else {
      var _this$config$bangumi$5, _this$config$bangumi$6;
      getBiliData({
        vmid: this.config.bangumi.vmid,
        type: 'bangumi',
        showProgress: (_this$config$bangumi$5 = this.config.bangumi.progress) !== null && _this$config$bangumi$5 !== void 0 ? _this$config$bangumi$5 : true,
        sourceDir: this.source_dir,
        extraOrder: this.config.bangumi.extraOrder,
        pagination: this.config.bangumi.pagination,
        useWebp: this.config.bangumi.webp,
        coverMirror: (_this$config$bangumi$6 = this.config.bangumi.coverMirror) !== null && _this$config$bangumi$6 !== void 0 ? _this$config$bangumi$6 : '',
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
    var _this$config5, _this$config$cinema$p, _this$config$cinema$c;
    if (!(this !== null && this !== void 0 && (_this$config5 = this.config) !== null && _this$config5 !== void 0 && _this$config5.cinema)) {
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
      showProgress: (_this$config$cinema$p = this.config.cinema.progress) !== null && _this$config$cinema$p !== void 0 ? _this$config$cinema$p : true,
      sourceDir: this.source_dir,
      extraOrder: this.config.cinema.extraOrder,
      pagination: this.config.cinema.pagination,
      useWebp: this.config.cinema.webp,
      coverMirror: (_this$config$cinema$c = this.config.cinema.coverMirror) !== null && _this$config$cinema$c !== void 0 ? _this$config$cinema$c : ""
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
    var _this$config6, _this$config$game$pro, _this$config$game$cov;
    if (!(this !== null && this !== void 0 && (_this$config6 = this.config) !== null && _this$config6 !== void 0 && _this$config6.game)) {
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
      log.info("".concat(this.config.bangumi.source, " not support"));
      return;
    }
    getBgmv0Data({
      vmid: this.config.game.vmid,
      type: 4,
      showProgress: (_this$config$game$pro = this.config.game.progress) !== null && _this$config$game$pro !== void 0 ? _this$config$game$pro : true,
      sourceDir: this.source_dir,
      extraOrder: this.config.game.extraOrder,
      pagination: this.config.game.pagination,
      proxy: this.config.game.proxy,
      coverMirror: (_this$config$game$cov = this.config.game.coverMirror) !== null && _this$config$game$cov !== void 0 ? _this$config$game$cov : ''
    });
  } else {
    log.info('Unknown command, please use "hexo game -h" to see the available commands');
  }
});
