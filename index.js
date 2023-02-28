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

// eslint-disable-next-line no-var
if (typeof URL !== 'function') var _require3 = require('url'),
  URL = _require3.URL;
var options = {
  options: [{
    name: '-u, --update',
    desc: 'Update data'
  }, {
    name: '-d, --delete',
    desc: 'Delete data'
  }]
};
hexo.extend.generator.register('bangumis', function (locals) {
  var _this$config, _this$config$bangumi;
  if (!(this !== null && this !== void 0 && (_this$config = this.config) !== null && _this$config !== void 0 && (_this$config$bangumi = _this$config.bangumi) !== null && _this$config$bangumi !== void 0 && _this$config$bangumi.enable)) {
    return;
  }
  return require('./lib/bangumi-generator').call(this, locals, 'bangumi');
});
hexo.extend.generator.register('cinemas', function (locals) {
  var _this$config2, _this$config2$cinema;
  if (!(this !== null && this !== void 0 && (_this$config2 = this.config) !== null && _this$config2 !== void 0 && (_this$config2$cinema = _this$config2.cinema) !== null && _this$config2$cinema !== void 0 && _this$config2$cinema.enable)) {
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
    var _this$config3;
    if (!(this !== null && this !== void 0 && (_this$config3 = this.config) !== null && _this$config3 !== void 0 && _this$config3.bangumi)) {
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
      var _this$config$bangumi$;
      getBgmData({
        vmid: this.config.bangumi.vmid,
        showProgress: (_this$config$bangumi$ = this.config.bangumi.progress) !== null && _this$config$bangumi$ !== void 0 ? _this$config$bangumi$ : true,
        sourceDir: this.source_dir,
        extraOrder: this.config.bangumi.extraOrder,
        pagination: this.config.bangumi.pagination,
        proxy: this.config.bangumi.proxy,
        infoApi: this.config.bangumi.bgmInfoApi,
        host: "".concat(this.config.bangumi.source, ".tv")
      });
    } else {
      var _this$config$bangumi$2;
      getBiliData({
        vmid: this.config.bangumi.vmid,
        type: 'bangumi',
        showProgress: (_this$config$bangumi$2 = this.config.bangumi.progress) !== null && _this$config$bangumi$2 !== void 0 ? _this$config$bangumi$2 : true,
        sourceDir: this.source_dir,
        extraOrder: this.config.bangumi.extraOrder,
        pagination: this.config.bangumi.pagination,
        useWebp: this.config.bangumi.webp
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
    var _this$config4, _this$config$cinema$p;
    if (!(this !== null && this !== void 0 && (_this$config4 = this.config) !== null && _this$config4 !== void 0 && _this$config4.cinema)) {
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
      type: 'cinema',
      showProgress: (_this$config$cinema$p = this.config.cinema.progress) !== null && _this$config$cinema$p !== void 0 ? _this$config$cinema$p : true,
      sourceDir: this.source_dir,
      extraOrder: this.config.cinema.extraOrder,
      pagination: this.config.cinema.pagination,
      useWebp: this.config.cinema.webp
    });
  } else {
    log.info('Unknown command, please use "hexo cinema -h" to see the available commands');
  }
});
