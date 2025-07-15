"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/*
 * @Author       : HCLonely
 * @Date         : 2025-07-10 12:31:47
 * @LastEditTime : 2025-07-10 15:05:14
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/src/lib/get-simkl-data.js
 * @Description  : SIMKL数据获取模块，通过REST API获取用户的动画收藏数据。
 *                 支持获取观看中、计划观看、已完成三种状态的动画数据，
 *                 包含标题、封面、进度等信息。
 */

var fs = require('hexo-fs');
var path = require('path');
var axios = require('axios');
var hexoLog = require('hexo-log');

// 常量定义
var SIMKL_API = 'https://api.simkl.com';
var CACHE_DIR = '_data';
var CACHE_FILE = 'bangumis.json';
var EXTRA_CACHE_FILE = 'extra_bangumis.json';
var USER_AGENT = 'HCLonely/hexo-bilibili-bangumi';
var MAX_RETRIES = 3;
var RETRY_DELAY = 1000;

// 状态映射
var STATUS_MAP = {
  plantowatch: 'wantWatch',
  watching: 'watching',
  completed: 'watched'
};

// 日志实例
var log = typeof hexoLog["default"] === 'function' ? hexoLog["default"]({
  debug: false,
  silent: false
}) : hexoLog({
  debug: false,
  silent: false
});

/**
 * 延迟函数
 * @param {number} ms 延迟时间(毫秒)
 * @returns {Promise<void>}
 */
var delay = function delay(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};

/**
 * 带重试的API请求
 * @param {string} status 观看状态
 * @param {Object} config 配置信息
 * @param {number} retries 重试次数
 * @returns {Promise<Object>}
 */
var _fetchWithRetry = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(status, config, type) {
    var retries,
      response,
      _args = arguments,
      _t;
    return _regenerator["default"].wrap(function (_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          retries = _args.length > 3 && _args[3] !== undefined ? _args[3] : MAX_RETRIES;
          _context.prev = 1;
          _context.next = 2;
          return axios({
            method: 'GET',
            url: "".concat(SIMKL_API, "/sync/all-items/").concat(type, "/").concat(status, "?memos=yes"),
            headers: {
              'Content-Type': 'application/json',
              Authorization: "Bearer ".concat(config.token),
              'simkl-api-key': config.clientId,
              'User-Agent': USER_AGENT
            }
          });
        case 2:
          response = _context.sent;
          return _context.abrupt("return", response);
        case 3:
          _context.prev = 3;
          _t = _context["catch"](1);
          if (!(retries > 0)) {
            _context.next = 5;
            break;
          }
          _context.next = 4;
          return delay(RETRY_DELAY);
        case 4:
          return _context.abrupt("return", _fetchWithRetry(status, config, type, retries - 1));
        case 5:
          throw _t;
        case 6:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[1, 3]]);
  }));
  return function fetchWithRetry(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * 格式化番剧数据
 * @param {Object} bangumi 原始数据
 * @param {string} coverMirror 图片镜像
 * @returns {Object}
 */
var formatBangumiData = function formatBangumiData(bangumi, coverMirror) {
  var _bangumi$show, _bangumi$show2, _bangumi$show3, _bangumi$show4, _bangumi$show5, _bangumi$show6, _bangumi$memo;
  return {
    title: (_bangumi$show = bangumi.show) === null || _bangumi$show === void 0 ? void 0 : _bangumi$show.title,
    type: bangumi.anime_type,
    cover: "".concat(coverMirror, "https://simkl.in/posters/").concat((_bangumi$show2 = bangumi.show) === null || _bangumi$show2 === void 0 ? void 0 : _bangumi$show2.poster, "_m.jpg"),
    totalCount: bangumi.total_episodes_count,
    id: (_bangumi$show3 = bangumi.show) === null || _bangumi$show3 === void 0 || (_bangumi$show3 = _bangumi$show3.ids) === null || _bangumi$show3 === void 0 ? void 0 : _bangumi$show3.simkl,
    des: ((_bangumi$show4 = bangumi.show) === null || _bangumi$show4 === void 0 || (_bangumi$show4 = _bangumi$show4.ids) === null || _bangumi$show4 === void 0 || (_bangumi$show4 = _bangumi$show4.wikien) === null || _bangumi$show4 === void 0 ? void 0 : _bangumi$show4.replaceAll('_', ' ')) || ((_bangumi$show5 = bangumi.show) === null || _bangumi$show5 === void 0 || (_bangumi$show5 = _bangumi$show5.ids) === null || _bangumi$show5 === void 0 ? void 0 : _bangumi$show5.wikijp) || '-',
    year: ((_bangumi$show6 = bangumi.show) === null || _bangumi$show6 === void 0 ? void 0 : _bangumi$show6.year) || '-',
    myStars: bangumi.user_rating,
    myComment: ((_bangumi$memo = bangumi.memo) === null || _bangumi$memo === void 0 ? void 0 : _bangumi$memo.text) || '-',
    progress: Math.round(bangumi.watched_episodes_count / (bangumi.total_episodes_count || 1) * 100),
    ep_status: bangumi.watched_episodes_count,
    new_ep: bangumi.total_episodes_count
  };
};

/**
 * 获取SIMKL数据
 * @param {Object} config 配置信息
 * @param {string} coverMirror 图片镜像
 * @returns {Promise<Object>}
 */
var getData = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(config, coverMirror, type) {
    var $data, _loop, _i, _arr;
    return _regenerator["default"].wrap(function (_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          $data = {
            wantWatch: [],
            watching: [],
            watched: []
          };
          _loop = /*#__PURE__*/_regenerator["default"].mark(function _loop() {
            var status, _response$data, response, animeList, mappedStatus, _t2;
            return _regenerator["default"].wrap(function (_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  status = _arr[_i];
                  _context2.prev = 1;
                  _context2.next = 2;
                  return _fetchWithRetry(status, config, type);
                case 2:
                  response = _context2.sent;
                  if (!((response === null || response === void 0 ? void 0 : response.status) !== 200)) {
                    _context2.next = 3;
                    break;
                  }
                  throw new Error("API\u8BF7\u6C42\u5931\u8D25: ".concat(response === null || response === void 0 ? void 0 : response.status));
                case 3:
                  animeList = (response === null || response === void 0 || (_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.anime) || [];
                  mappedStatus = STATUS_MAP[status];
                  animeList.forEach(function (bangumi) {
                    $data[mappedStatus].push(formatBangumiData(bangumi, coverMirror));
                  });
                  _context2.next = 5;
                  break;
                case 4:
                  _context2.prev = 4;
                  _t2 = _context2["catch"](1);
                  log.error("\u83B7\u53D6SIMKL ".concat(status, "\u6570\u636E\u5931\u8D25: ").concat(_t2.message));
                  throw _t2;
                case 5:
                case "end":
                  return _context2.stop();
              }
            }, _loop, null, [[1, 4]]);
          });
          _i = 0, _arr = ['plantowatch', 'watching', 'completed'];
        case 1:
          if (!(_i < _arr.length)) {
            _context3.next = 3;
            break;
          }
          return _context3.delegateYield(_loop(), "t0", 2);
        case 2:
          _i++;
          _context3.next = 1;
          break;
        case 3:
          return _context3.abrupt("return", $data);
        case 4:
        case "end":
          return _context3.stop();
      }
    }, _callee2);
  }));
  return function getData(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * 确保数据目录存在
 * @param {string} sourceDir 源目录
 * @param {string} dataDir 数据目录
 */
var ensureDataDir = function ensureDataDir(sourceDir) {
  var dataDir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CACHE_DIR;
  var dir = path.join(sourceDir, dataDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return dir;
};

/**
 * 写入数据到文件
 * @param {string} filePath 文件路径
 * @param {Object} data 数据
 * @param {string} errorMsg 错误信息
 * @param {string} successMsg 成功信息
 */
var writeDataToFile = function writeDataToFile(filePath, data, errorMsg, successMsg) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
    log.info(successMsg);
  } catch (err) {
    log.error(errorMsg);
    console.error(err);
  }
};

/**
 * 合并额外数据
 * @param {Object} bangumis 原数据
 * @param {Object} extras 额外数据
 * @param {number} order 顺序
 * @returns {Object}
 */
var mergeExtraData = function mergeExtraData(bangumis, extras, order) {
  var result = _objectSpread({}, bangumis);
  var wantWatchExtra = extras.wantWatchExtra,
    watchingExtra = extras.watchingExtra,
    watchedExtra = extras.watchedExtra;
  ['wantWatch', 'watching', 'watched'].forEach(function (key) {
    var extra = {
      wantWatch: wantWatchExtra,
      watching: watchingExtra,
      watched: watchedExtra
    }[key];
    if (extra) {
      result[key] = order === 1 ? [].concat((0, _toConsumableArray2["default"])(extra), (0, _toConsumableArray2["default"])(result[key])) : [].concat((0, _toConsumableArray2["default"])(result[key]), (0, _toConsumableArray2["default"])(extra));
    }
  });
  return result;
};

/**
 * 获取SIMKL番剧数据
 * @param {Object} options 配置选项
 * @returns {Promise<void>}
 */
module.exports.getSimklData = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(_ref3) {
    var vmid, type, sourceDir, extraOrder, pagination, coverMirror, startTime, _vmid$split, _vmid$split2, clientId, token, bangumis, totalCount, endTime, mainDataPath, allBangumis, extraDataPath, extraData, paginationPath, _t3;
    return _regenerator["default"].wrap(function (_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          vmid = _ref3.vmid, type = _ref3.type, sourceDir = _ref3.sourceDir, extraOrder = _ref3.extraOrder, pagination = _ref3.pagination, coverMirror = _ref3.coverMirror;
          _context4.prev = 1;
          log.info('Getting SIMKL bangumi data, please wait...');
          startTime = new Date().getTime();
          _vmid$split = vmid.split('-'), _vmid$split2 = (0, _slicedToArray2["default"])(_vmid$split, 2), clientId = _vmid$split2[0], token = _vmid$split2[1]; // 获取数据
          _context4.next = 2;
          return getData({
            token: token,
            clientId: clientId
          }, coverMirror, type);
        case 2:
          bangumis = _context4.sent;
          totalCount = Object.values(bangumis).reduce(function (sum, arr) {
            return sum + arr.length;
          }, 0);
          endTime = new Date().getTime();
          log.info("".concat(totalCount, " bangumis have been loaded in ").concat(endTime - startTime, " ms"));

          // 确保数据目录存在
          ensureDataDir(sourceDir);

          // 写入主数据文件
          mainDataPath = path.join(sourceDir, "/".concat(CACHE_DIR, "/").concat(CACHE_FILE));
          writeDataToFile(mainDataPath, bangumis, 'Failed to write data to _data/bangumis.json', 'SIMKL bangumis data has been saved');

          // 处理分页数据
          if (pagination) {
            allBangumis = _objectSpread({}, bangumis); // 合并额外数据
            extraDataPath = path.join(sourceDir, "/".concat(CACHE_DIR, "/").concat(EXTRA_CACHE_FILE));
            if (fs.existsSync(extraDataPath)) {
              extraData = JSON.parse(fs.readFileSync(extraDataPath));
              allBangumis = mergeExtraData(allBangumis, extraData, extraOrder);
            }

            // 写入分页数据
            paginationPath = path.join(sourceDir, '/bangumis.json');
            writeDataToFile(paginationPath, allBangumis, 'Failed to write data to bangumis.json', 'SIMKL bangumis data (with extras) has been saved');
          }
          _context4.next = 4;
          break;
        case 3:
          _context4.prev = 3;
          _t3 = _context4["catch"](1);
          log.error("\u83B7\u53D6SIMKL\u6570\u636E\u5931\u8D25: ".concat(_t3.message));
          throw _t3;
        case 4:
        case "end":
          return _context4.stop();
      }
    }, _callee3, null, [[1, 3]]);
  }));
  return function (_x7) {
    return _ref4.apply(this, arguments);
  };
}();