"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/*
 * @Author       : HCLonely
 * @Date         : 2024-09-11 15:40:57
 * @LastEditTime : 2025-07-10 14:01:12
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/src/index.js
 * @Description  : Hexo插件主入口文件，提供了bangumi、cinema和game三个命令，
 *                 用于生成和管理番剧、影视和游戏页面。支持从多个数据源获取数据，
 *                 包括bilibili、bangumi.tv和AniList等，并提供数据更新和删除功能。
 */

var fs = require('hexo-fs');
var path = require('path');
var hexoLog = require('hexo-log');

/**
 * @constant {Object} log - 统一的日志记录器实例
 * @description 配置了统一的日志输出工具
 */
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
if (typeof URL !== 'function') {
  var _require6 = require('url'),
    _URL = _require6.URL;
  global.URL = _URL;
}

/**
 * @constant {Object} COMMAND_OPTIONS - 命令行选项配置
 * @property {Array<Object>} options - 可用的命令行选项列表
 */
var COMMAND_OPTIONS = {
  options: [{
    name: '-u, --update',
    desc: 'Update data'
  }, {
    name: '-d, --delete',
    desc: 'Delete data'
  }]
};

/**
 * @constant {Object} DATA_TYPES - 数据类型配置对象
 * @property {Object} bangumi - 番剧相关配置
 * @property {Object} cinema - 影视相关配置
 * @property {Object} game - 游戏相关配置
 */
var DATA_TYPES = {
  bangumi: {
    jsonFile: 'bangumis.json',
    configKey: 'bangumi'
  },
  cinema: {
    jsonFile: 'cinemas.json',
    configKey: 'cinema'
  },
  game: {
    jsonFile: 'games.json',
    configKey: 'game'
  }
};

/**
 * @description 注册页面生成器
 * 为每种数据类型（bangumi、cinema、game）注册对应的页面生成器
 */
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

/**
 * @function validateConfig
 * @param {Object} config - 配置对象
 * @returns {boolean} 配置是否有效
 * @description 验证配置对象是否包含必要的字段和值
 */
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

/**
 * @function handleDataDelete
 * @param {string} sourceDir - 源目录路径
 * @param {string} type - 数据类型（bangumi/cinema/game）
 * @description 处理数据删除操作，删除指定类型的JSON数据文件
 */
var handleDataDelete = function handleDataDelete(sourceDir, type) {
  var jsonPath = path.join(sourceDir, "/_data/".concat(DATA_TYPES[type].jsonFile));
  if (fs.existsSync(jsonPath)) {
    fs.unlinkSync(jsonPath);
    log.info("".concat(type, " data has been deleted"));
  }
};

/**
 * @function handleDataUpdate
 * @async
 * @param {Object} config - 更新配置
 * @param {string} type - 数据类型
 * @param {string} sourceDir - 源目录路径
 * @param {Object} args - 命令行参数
 * @returns {Promise} 更新操作的Promise
 * @description 根据不同的数据源处理数据更新操作
 */
var handleDataUpdate = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(config, type, sourceDir, args) {
    var _config$progress, _config$coverMirror;
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
            host: "".concat(config.source, ".tv")
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

/**
 * @description 注册命令
 * 为每种数据类型注册对应的命令，支持更新(-u)和删除(-d)操作
 */
Object.entries(DATA_TYPES).forEach(function (_ref4) {
  var _ref5 = (0, _slicedToArray2["default"])(_ref4, 2),
    type = _ref5[0],
    config = _ref5[1];
  hexo.extend.console.register(type, "Generate pages of ".concat(type, " for Hexo"), COMMAND_OPTIONS, function (args) {
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