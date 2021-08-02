/* global hexo */
'use strict';

var fs = require('hexo-fs');

var path = require('path');

var log = require('hexo-log')({
  debug: false,
  silent: false
});

var _require = require('./lib/get-bili-data'),
    getBiliData = _require.getBiliData;

if (typeof URL !== 'function') var _require2 = require('url'),
    URL = _require2.URL;
var options = {
  options: [{
    name: '-u, --update',
    desc: 'Update bilibili data'
  }, {
    name: '-d, --delete',
    desc: 'Delete bilibili data'
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
hexo.extend.console.register('bangumi', 'Generate pages of bilibili bangumis for Hexo', options, function (args) {
  if (args.d) {
    if (fs.existsSync(path.join(this.source_dir, '/_data/bangumis.json'))) {
      fs.unlinkSync(path.join(this.source_dir, '/_data/bangumis.json'));
      log.info('Bangumis data has been deleted');
    }
  } else if (args.u) {
    var _this$config3, _this$config$bangumi$;

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

    getBiliData(this.config.bangumi.vmid, 'bangumi', (_this$config$bangumi$ = this.config.bangumi.progress) !== null && _this$config$bangumi$ !== void 0 ? _this$config$bangumi$ : true, this.source_dir, this.config.bangumi.webp);
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

    getBiliData(this.config.cinema.vmid, 'cinema', (_this$config$cinema$p = this.config.cinema.progress) !== null && _this$config$cinema$p !== void 0 ? _this$config$cinema$p : true, this.source_dir, this.config.cinema.webp);
  } else {
    log.info('Unknown command, please use "hexo cinema -h" to see the available commands');
  }
});
