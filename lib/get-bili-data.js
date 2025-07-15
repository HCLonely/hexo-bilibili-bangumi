"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/*
 * @Author       : HCLonely
 * @Date         : 2025-04-02 15:24:17
 * @LastEditTime : 2025-07-15 17:14:49
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/src/lib/get-bili-data.js
 * @Description  : 哔哩哔哩数据获取模块，负责从B站API获取用户的番剧和追剧数据。
 *                 支持获取想看、在看、已看三种状态的内容，包含封面、进度、评分等信息，
 *                 并支持数据分页、WebP图片格式和自定义镜像源等功能。
 */
var fs = require('hexo-fs');
var path = require('path');
var axios = require('axios');
var hexoLog = require('hexo-log');
var ProgressBar = require('progress');

// 常量定义
var CONSTANTS = {
  STATUS_MAP: {
    1: '[想看]',
    2: '[在看]',
    3: '[已看]'
  },
  TYPE_MAP: {
    1: '番剧',
    2: '追剧'
  },
  NUMBERS: {
    TEN_THOUSAND: 10000,
    HUNDRED_MILLION: 100000000
  },
  API: {
    BASE_URL: 'https://api.bilibili.com/x/space/bangumi/follow/list',
    PAGE_SIZE: 30
  },
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};

// 初始化日志
var log = typeof hexoLog["default"] === 'function' ? hexoLog["default"]({
  debug: false,
  silent: false
}) : hexoLog({
  debug: false,
  silent: false
});

/**
 * 延迟函数
 * @param {number} ms 延迟时间（毫秒）
 * @returns {Promise<void>}
 */
var delay = function delay(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};

/**
 * 带重试机制的API请求
 * @param {Function} apiCall API调用函数
 * @param {number} retries 重试次数
 * @returns {Promise<any>}
 */
function withRetry(_x) {
  return _withRetry.apply(this, arguments);
}
/**
 * 获取数据总页数
 * @param {string} vmid 用户ID
 * @param {number} status 状态
 * @param {number} typeNum 类型
 * @returns {Promise<{success: boolean, data: number|string}>}
 */
function _withRetry() {
  _withRetry = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(apiCall) {
    var retries,
      i,
      _args5 = arguments,
      _t2;
    return _regenerator["default"].wrap(function (_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          retries = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : CONSTANTS.MAX_RETRIES;
          i = 0;
        case 1:
          if (!(i < retries)) {
            _context5.next = 8;
            break;
          }
          _context5.prev = 2;
          _context5.next = 3;
          return apiCall();
        case 3:
          return _context5.abrupt("return", _context5.sent);
        case 4:
          _context5.prev = 4;
          _t2 = _context5["catch"](2);
          if (!(i === retries - 1)) {
            _context5.next = 5;
            break;
          }
          throw _t2;
        case 5:
          _context5.next = 6;
          return delay(CONSTANTS.RETRY_DELAY);
        case 6:
          log.warn("\u8BF7\u6C42\u5931\u8D25\uFF0C\u6B63\u5728\u8FDB\u884C\u7B2C".concat(i + 1, "\u6B21\u91CD\u8BD5..."));
        case 7:
          i++;
          _context5.next = 1;
          break;
        case 8:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[2, 4]]);
  }));
  return _withRetry.apply(this, arguments);
}
var getDataPage = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(vmid, status, typeNum) {
    var _response$data, _response$data2, _response$data3, _response$data4;
    var response;
    return _regenerator["default"].wrap(function (_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 1;
          return withRetry(function () {
            return axios.get("".concat(CONSTANTS.API.BASE_URL, "?type=").concat(typeNum, "&follow_status=").concat(status, "&vmid=").concat(vmid, "&ps=1&pn=1"));
          });
        case 1:
          response = _context.sent;
          if (!((response === null || response === void 0 || (_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.code) === 0 && (response === null || response === void 0 || (_response$data2 = response.data) === null || _response$data2 === void 0 ? void 0 : _response$data2.message) === '0' && (response === null || response === void 0 || (_response$data3 = response.data) === null || _response$data3 === void 0 || (_response$data3 = _response$data3.data) === null || _response$data3 === void 0 ? void 0 : _response$data3.total) !== undefined)) {
            _context.next = 2;
            break;
          }
          return _context.abrupt("return", {
            success: true,
            data: Math.ceil(response.data.data.total / CONSTANTS.API.PAGE_SIZE) + 1
          });
        case 2:
          return _context.abrupt("return", {
            success: false,
            data: (response === null || response === void 0 || (_response$data4 = response.data) === null || _response$data4 === void 0 ? void 0 : _response$data4.message) || '获取数据失败'
          });
        case 3:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function getDataPage(_x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * 格式化数字
 * @param {number} num 要格式化的数字
 * @returns {string} 格式化后的字符串
 */
var formatNumber = function formatNumber(num) {
  if (!num) return '-';
  if (num > CONSTANTS.NUMBERS.HUNDRED_MILLION) {
    return "".concat((num / CONSTANTS.NUMBERS.HUNDRED_MILLION).toFixed(1), " \u4EBF");
  }
  if (num > CONSTANTS.NUMBERS.TEN_THOUSAND) {
    return "".concat((num / CONSTANTS.NUMBERS.TEN_THOUSAND).toFixed(1), " \u4E07");
  }
  return num.toString();
};

/**
 * 格式化总集数
 * @param {number} count 总集数
 * @param {number} typeNum 类型
 * @returns {string}
 */
var formatTotal = function formatTotal(count, typeNum) {
  if (!count) return '-';
  if (count === -1) return '未完结';
  var unit = typeNum === 1 ? '话' : '集';
  return "\u5168".concat(count).concat(unit);
};
var getData = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(vmid, status, useWebp, typeNum, pn, coverMirror, SESSDATA) {
    var _response$data5, _response$data7;
    var response, _response$data6;
    return _regenerator["default"].wrap(function (_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 1;
          return withRetry(function () {
            return axios.get("".concat(CONSTANTS.API.BASE_URL, "?type=").concat(typeNum, "&follow_status=").concat(status, "&vmid=").concat(vmid, "&ps=").concat(CONSTANTS.API.PAGE_SIZE, "&pn=").concat(pn), {
              headers: SESSDATA ? {
                cookie: "SESSDATA=".concat(SESSDATA, ";")
              } : {}
            });
          });
        case 1:
          response = _context2.sent;
          if (!((response === null || response === void 0 || (_response$data5 = response.data) === null || _response$data5 === void 0 ? void 0 : _response$data5.code) !== 0)) {
            _context2.next = 2;
            break;
          }
          throw new Error("\u83B7\u53D6\u6570\u636E\u5931\u8D25: ".concat((response === null || response === void 0 || (_response$data6 = response.data) === null || _response$data6 === void 0 ? void 0 : _response$data6.message) || '未知错误'));
        case 2:
          return _context2.abrupt("return", ((response === null || response === void 0 || (_response$data7 = response.data) === null || _response$data7 === void 0 || (_response$data7 = _response$data7.data) === null || _response$data7 === void 0 ? void 0 : _response$data7.list) || []).map(function (bangumi) {
            var _bangumi$areas, _bangumi$stat, _bangumi$stat2, _bangumi$stat3, _bangumi$stat4, _bangumi$rating$score, _bangumi$rating, _bangumi$progress$mat, _bangumi$new_ep, _bangumi$progress$mat2, _bangumi$new_ep2;
            var cover = bangumi === null || bangumi === void 0 ? void 0 : bangumi.cover;
            if (cover) {
              var href = new URL(cover);
              href.protocol = 'https';
              if (useWebp) href.pathname += '@220w_280h.webp';
              cover = "".concat(coverMirror).concat(href.href);
            }
            return {
              title: bangumi === null || bangumi === void 0 ? void 0 : bangumi.title,
              type: bangumi === null || bangumi === void 0 ? void 0 : bangumi.season_type_name,
              area: bangumi === null || bangumi === void 0 || (_bangumi$areas = bangumi.areas) === null || _bangumi$areas === void 0 || (_bangumi$areas = _bangumi$areas[0]) === null || _bangumi$areas === void 0 ? void 0 : _bangumi$areas.name,
              cover: cover,
              totalCount: formatTotal(bangumi === null || bangumi === void 0 ? void 0 : bangumi.total_count, typeNum),
              id: bangumi === null || bangumi === void 0 ? void 0 : bangumi.media_id,
              follow: formatNumber(bangumi === null || bangumi === void 0 || (_bangumi$stat = bangumi.stat) === null || _bangumi$stat === void 0 ? void 0 : _bangumi$stat.follow),
              view: formatNumber(bangumi === null || bangumi === void 0 || (_bangumi$stat2 = bangumi.stat) === null || _bangumi$stat2 === void 0 ? void 0 : _bangumi$stat2.view),
              danmaku: formatNumber(bangumi === null || bangumi === void 0 || (_bangumi$stat3 = bangumi.stat) === null || _bangumi$stat3 === void 0 ? void 0 : _bangumi$stat3.danmaku),
              coin: formatNumber(bangumi === null || bangumi === void 0 || (_bangumi$stat4 = bangumi.stat) === null || _bangumi$stat4 === void 0 ? void 0 : _bangumi$stat4.coin),
              score: (_bangumi$rating$score = bangumi === null || bangumi === void 0 || (_bangumi$rating = bangumi.rating) === null || _bangumi$rating === void 0 ? void 0 : _bangumi$rating.score) !== null && _bangumi$rating$score !== void 0 ? _bangumi$rating$score : '-',
              des: bangumi === null || bangumi === void 0 ? void 0 : bangumi.evaluate,
              progress: !SESSDATA ? false : Math.round((parseInt((bangumi === null || bangumi === void 0 || (_bangumi$progress$mat = bangumi.progress.match(/\d+/)) === null || _bangumi$progress$mat === void 0 ? void 0 : _bangumi$progress$mat[0]) || '0', 10) || 0) / ((bangumi === null || bangumi === void 0 ? void 0 : bangumi.total_count) > 0 ? bangumi.total_count : ((_bangumi$new_ep = bangumi.new_ep) === null || _bangumi$new_ep === void 0 ? void 0 : _bangumi$new_ep.title) || 1) * 100),
              ep_status: !SESSDATA ? false : parseInt((bangumi === null || bangumi === void 0 || (_bangumi$progress$mat2 = bangumi.progress.match(/\d+/)) === null || _bangumi$progress$mat2 === void 0 ? void 0 : _bangumi$progress$mat2[0]) || '0', 10) || 0,
              new_ep: (bangumi === null || bangumi === void 0 ? void 0 : bangumi.total_count) > 0 ? bangumi.total_count : ((_bangumi$new_ep2 = bangumi.new_ep) === null || _bangumi$new_ep2 === void 0 ? void 0 : _bangumi$new_ep2.title) || -1
            };
          }));
        case 3:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function getData(_x5, _x6, _x7, _x8, _x9, _x0, _x1) {
    return _ref2.apply(this, arguments);
  };
}();
var processData = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(vmid, status, useWebp, showProgress, typeNum, coverMirror, SESSDATA) {
    var page, list, bar, statusText, typeText, i, data;
    return _regenerator["default"].wrap(function (_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 1;
          return getDataPage(vmid, status, typeNum);
        case 1:
          page = _context3.sent;
          if (!(page !== null && page !== void 0 && page.success)) {
            _context3.next = 6;
            break;
          }
          list = [];
          bar = null;
          if (showProgress) {
            statusText = CONSTANTS.STATUS_MAP[status] || '[未知]';
            typeText = CONSTANTS.TYPE_MAP[typeNum] || '未知';
            bar = new ProgressBar("\u6B63\u5728\u83B7\u53D6 ".concat(statusText, " ").concat(typeText, " [:bar] :percent :elapseds"), {
              total: page.data - 1,
              complete: '█'
            });
          }
          i = 1;
        case 2:
          if (!(i < page.data)) {
            _context3.next = 5;
            break;
          }
          if (showProgress) bar.tick();
          _context3.next = 3;
          return getData(vmid, status, useWebp, typeNum, i, coverMirror, SESSDATA);
        case 3:
          data = _context3.sent;
          list.push.apply(list, (0, _toConsumableArray2["default"])(data));
        case 4:
          i++;
          _context3.next = 2;
          break;
        case 5:
          return _context3.abrupt("return", list);
        case 6:
          log.error("Get ".concat(typeNum === 1 ? 'bangumi' : 'cinema', " data error:"), page === null || page === void 0 ? void 0 : page.data);
          return _context3.abrupt("return", []);
        case 7:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return function processData(_x10, _x11, _x12, _x13, _x14, _x15, _x16) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * 同步保存数据到文件
 * @param {string} filePath 文件路径
 * @param {Object} data 要保存的数据
 * @param {string} type 数据类型（用于日志）
 */
var saveDataToFile = function saveDataToFile(filePath, data, type) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
    log.info("Bilibili ".concat(type, " data has been saved to ").concat(filePath));
  } catch (err) {
    log.error("Failed to write data to ".concat(filePath));
    console.error(err);
    throw err;
  }
};

/**
 * 合并额外数据
 * @param {Object} original 原始数据
 * @param {Object} extra 额外数据
 * @param {number} extraOrder 合并顺序（1: 额外数据在前，其他: 额外数据在后）
 * @returns {Object} 合并后的数据
 */
var mergeExtraData = function mergeExtraData(original, extra, extraOrder) {
  var result = _objectSpread({}, original);
  var categories = ['wantWatch', 'watching', 'watched'];
  categories.forEach(function (category) {
    var extraData = extra["".concat(category, "Extra")];
    if (extraData) {
      result[category] = extraOrder === 1 ? [].concat((0, _toConsumableArray2["default"])(extraData), (0, _toConsumableArray2["default"])(result[category])) : [].concat((0, _toConsumableArray2["default"])(result[category]), (0, _toConsumableArray2["default"])(extraData));
    }
  });
  return result;
};

/**
 * 获取B站番剧数据
 * @param {Object} options 配置选项
 * @param {string} options.vmid 用户ID
 * @param {string} options.type 类型（bangumi/cinema）
 * @param {boolean} options.showProgress 是否显示进度条
 * @param {string} options.sourceDir 源目录
 * @param {number} options.extraOrder 额外数据顺序
 * @param {boolean} options.pagination 是否分页
 * @param {boolean} options.useWebp 是否使用WebP格式
 * @param {string} options.coverMirror 图片镜像源
 * @param {string} options.SESSDATA 会话数据
 * @returns {Promise<void>}
 */
module.exports.getBiliData = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(_ref4) {
    var vmid, type, showProgress, sourceDir, extraOrder, pagination, _ref4$useWebp, useWebp, coverMirror, SESSDATA, typeNum, startTime, wantWatch, watching, watched, endTime, bangumis, dataDir, allBangumis, extraPath, extraData, _t;
    return _regenerator["default"].wrap(function (_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          vmid = _ref4.vmid, type = _ref4.type, showProgress = _ref4.showProgress, sourceDir = _ref4.sourceDir, extraOrder = _ref4.extraOrder, pagination = _ref4.pagination, _ref4$useWebp = _ref4.useWebp, useWebp = _ref4$useWebp === void 0 ? true : _ref4$useWebp, coverMirror = _ref4.coverMirror, SESSDATA = _ref4.SESSDATA;
          _context4.prev = 1;
          typeNum = type === 'cinema' ? 2 : 1;
          log.info("Getting bilibili ".concat(type, ", please wait..."));
          startTime = new Date().getTime(); // 获取三种状态的数据
          _context4.next = 2;
          return processData(vmid, 1, useWebp, showProgress, typeNum, coverMirror, SESSDATA);
        case 2:
          wantWatch = _context4.sent;
          _context4.next = 3;
          return processData(vmid, 2, useWebp, showProgress, typeNum, coverMirror, SESSDATA);
        case 3:
          watching = _context4.sent;
          _context4.next = 4;
          return processData(vmid, 3, useWebp, showProgress, typeNum, coverMirror, SESSDATA);
        case 4:
          watched = _context4.sent;
          endTime = new Date().getTime();
          log.info("".concat(wantWatch.length + watching.length + watched.length, " ").concat(type, "s have been loaded in ").concat(endTime - startTime, " ms"));
          bangumis = {
            wantWatch: wantWatch,
            watching: watching,
            watched: watched
          }; // 确保目录存在
          dataDir = path.join(sourceDir, '/_data/');
          if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, {
              recursive: true
            });
          }

          // 保存原始数据
          saveDataToFile(path.join(dataDir, "".concat(type, "s.json")), bangumis, type);

          // 处理分页数据
          if (pagination) {
            allBangumis = _objectSpread({}, bangumis);
            extraPath = path.join(dataDir, "extra_".concat(type, "s.json")); // 合并额外数据
            if (fs.existsSync(extraPath)) {
              try {
                extraData = JSON.parse(fs.readFileSync(extraPath, 'utf8'));
                allBangumis = mergeExtraData(allBangumis, extraData, extraOrder);
              } catch (error) {
                log.error("Failed to parse extra data from ".concat(extraPath));
                console.error(error);
              }
            }

            // 保存合并后的数据
            saveDataToFile(path.join(sourceDir, "".concat(type, "s.json")), allBangumis, "".concat(type, " (with extras)"));
          }
          _context4.next = 6;
          break;
        case 5:
          _context4.prev = 5;
          _t = _context4["catch"](1);
          log.error("Failed to get bilibili ".concat(type, " data"));
          console.error(_t);
          throw _t;
        case 6:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[1, 5]]);
  }));
  return function (_x17) {
    return _ref5.apply(this, arguments);
  };
}();