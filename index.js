"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var fs = require('hexo-fs');
var path = require('path');
var hexoLog = require('hexo-log');
var log = (typeof hexoLog["default"] === 'function' ? hexoLog["default"] : hexoLog)({
  debug: false,
  silent: false
});
var _require = require('./lib/get-bili-data'),
  getBiliData = _require.getBiliData;
var _require2 = require('./lib/get-bgm-data'),
  getBgmData = _require2.getBgmData;
var _require3 = require('./lib/get-bgmv0-data'),
  getBgmv0Data = _require3.getBgmv0Data;
var _require4 = require('./lib/get-anilist-data'),
  getAnilistData = _require4.getAnilistData;
var _require5 = require('./lib/get-simkl-data'),
  getSimklData = _require5.getSimklData;
var _require6 = require('./lib/asset-hoist'),
  hoistBangumiAssets = _require6.hoistBangumiAssets;
if (typeof URL !== 'function') {
  var _require7 = require('url'),
    _URL = _require7.URL;
  global.URL = _URL;
}
var COMMAND_OPTIONS = {
  options: [{
    name: '-u, --update',
    desc: 'Update data'
  }, {
    name: '-d, --delete',
    desc: 'Delete data'
  }]
};
var DATA_TYPES = {
  bangumi: {
    jsonFile: 'bangumis.json',
    configKey: 'bangumi',
    alias: 'bgm'
  },
  cinema: {
    jsonFile: 'cinemas.json',
    configKey: 'cinema',
    alias: 'cnm'
  },
  game: {
    jsonFile: 'games.json',
    configKey: 'game',
    alias: 'gm'
  }
};
Object.entries(DATA_TYPES).forEach(function (_ref) {
  var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
    type = _ref2[0],
    config = _ref2[1];
  hexo.extend.generator.register("bangumis-".concat(type), function (locals) {
    var _this$config;
    if (!(this !== null && this !== void 0 && (_this$config = this.config) !== null && _this$config !== void 0 && (_this$config = _this$config[config.configKey]) !== null && _this$config !== void 0 && _this$config.enable)) {
      return;
    }
    return require('./lib/bangumi-generator').call(this, locals, type);
  });
});
hexo.extend.filter.register('after_render:html', function (html) {
  return hoistBangumiAssets(html);
});
hexo.extend.filter.register('after_post_render', function (data) {
  if (data.path.split('.').at(-1) === 'json') {
    data.content = data._content;
  }
  return data;
}, 11);
var validateConfig = function validateConfig(config) {
  if (!config) {
    log.info('Please add config to _config.yml');
    return false;
  }
  if (!config.enable) {
    return false;
  }
  if (!config.vmid) {
    log.info('Please add vmid to _config.yml');
    return false;
  }
  return true;
};
var handleDataDelete = function handleDataDelete(sourceDir, type) {
  var jsonPath = path.join(sourceDir, "/_data/".concat(DATA_TYPES[type].jsonFile));
  if (fs.existsSync(jsonPath)) {
    fs.unlinkSync(jsonPath);
    log.info("".concat(type, " data has been deleted"));
  }
};
var handleDataUpdate = function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee(config, type, sourceDir, args) {
    var _config$progress, _config$coverMirror, _config$skipNsfw;
    var baseConfig, typeMapping, _t;
    return _regenerator["default"].wrap(function (_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          baseConfig = {
            vmid: config.vmid,
            showProgress: (_config$progress = config.progress) !== null && _config$progress !== void 0 ? _config$progress : true,
            sourceDir: sourceDir,
            extraOrder: config.extraOrder,
            pagination: config.pagination,
            coverMirror: (_config$coverMirror = config.coverMirror) !== null && _config$coverMirror !== void 0 ? _config$coverMirror : ''
          };
          _t = config.source;
          _context.next = _t === 'bgm' ? 1 : _t === 'bangumi' ? 1 : _t === 'bgmv0' ? 2 : _t === 'anilist' ? 3 : _t === 'simkl' ? 5 : 6;
          break;
        case 1:
          return _context.abrupt("return", getBgmData(_objectSpread(_objectSpread({}, baseConfig), {}, {
            type: type,
            proxy: config.proxy,
            infoApi: config.bgmInfoApi,
            host: "".concat(config.source, ".tv"),
            skipNsfw: (_config$skipNsfw = config.skipNsfw) !== null && _config$skipNsfw !== void 0 ? _config$skipNsfw : false
          })));
        case 2:
          typeMapping = {
            bangumi: 2,
            cinema: 6,
            game: 4
          };
          return _context.abrupt("return", getBgmv0Data(_objectSpread(_objectSpread({}, baseConfig), {}, {
            type: typeMapping[type],
            proxy: config.proxy
          })));
        case 3:
          if (!(type === 'bangumi')) {
            _context.next = 4;
            break;
          }
          return _context.abrupt("return", getAnilistData(_objectSpread(_objectSpread({}, baseConfig), {}, {
            type: 'ANIME'
          })));
        case 4:
          log.info("".concat(config.source, " not support for ").concat(type));
          return _context.abrupt("return");
        case 5:
          return _context.abrupt("return", getSimklData(_objectSpread(_objectSpread({}, baseConfig), {}, {
            type: type
          })));
        case 6:
          return _context.abrupt("return", getBiliData(_objectSpread(_objectSpread({}, baseConfig), {}, {
            type: type,
            useWebp: config.webp,
            SESSDATA: typeof args.u === 'string' ? args.u : null
          })));
        case 7:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function handleDataUpdate(_x, _x2, _x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}();
Object.entries(DATA_TYPES).forEach(function (_ref4) {
  var _ref5 = (0, _slicedToArray2["default"])(_ref4, 2),
    type = _ref5[0],
    config = _ref5[1];
  var options = _objectSpread({
    alias: config.alias
  }, COMMAND_OPTIONS);
  hexo.extend.console.register(type, "Generate pages of ".concat(type, " for Hexo"), options, function (args) {
    if (args.d) {
      handleDataDelete(this.source_dir, type);
    } else if (args.u) {
      var typeConfig = this.config[config.configKey];
      if (!validateConfig(typeConfig)) {
        return;
      }
      if (type === 'game' && typeConfig.source !== 'bgmv0') {
        log.info("".concat(typeConfig.source, " not support for game"));
        return;
      }
      handleDataUpdate(typeConfig, type, this.source_dir, args);
    } else {
      log.info("Unknown command, please use \"hexo ".concat(type, " -h\" to see the available commands"));
    }
  });
});