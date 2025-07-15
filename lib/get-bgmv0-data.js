"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/*
 * @Author       : HCLonely
 * @Date         : 2024-09-11 15:27:32
 * @LastEditTime : 2025-07-10 10:03:14
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/src/lib/get-bgmv0-data.js
 * @Description  : Bangumi.tv V0版API数据获取模块，支持获取用户的书籍、动画、音乐、
 *                 游戏和三次元内容数据。包含评分、标签、进度等详细信息，并支持
 *                 数据分页和自定义封面镜像源等功能。
 */

var fs = require('hexo-fs');
var path = require('path');
var axios = require('axios');
var hexoLog = require('hexo-log');
var ProgressBar = require('progress');

// 常量定义
var CONSTANTS = {
  TYPE: {
    1: '书籍',
    2: '动画',
    3: '音乐',
    4: '游戏',
    6: '三次元'
  },
  TYPE_EN: {
    1: 'book',
    2: 'bangumi',
    3: 'music',
    4: 'game',
    6: 'cinema'
  },
  TYPE_STATUS: {
    1: ['[想看]', '[已看]', '[在看]'],
    2: ['[想看]', '[已看]', '[在看]'],
    3: 'music',
    4: ['[想玩]', '[已玩]', '[在玩]'],
    6: ['[想看]', '[已看]', '[在看]']
  },
  API: {
    BASE_URL: 'http://api.bgm.tv/v0',
    PAGE_SIZE: 30,
    USER_AGENT: 'HCLonely/hexo-bilibili-bangumi'
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
      _t3;
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
          _t3 = _context5["catch"](2);
          if (!(i === retries - 1)) {
            _context5.next = 5;
            break;
          }
          throw _t3;
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
    var _response$data;
    var response;
    return _regenerator["default"].wrap(function (_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 1;
          return withRetry(function () {
            return axios.get("".concat(CONSTANTS.API.BASE_URL, "/users/").concat(vmid, "/collections"), {
              params: {
                subject_type: typeNum,
                type: status,
                limit: 1,
                offset: 0
              },
              headers: {
                'User-Agent': CONSTANTS.API.USER_AGENT
              }
            });
          });
        case 1:
          response = _context.sent;
          if (!(typeof (response === null || response === void 0 || (_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.total) !== 'undefined')) {
            _context.next = 2;
            break;
          }
          return _context.abrupt("return", {
            success: true,
            data: Math.ceil(response.data.total / CONSTANTS.API.PAGE_SIZE) + 1
          });
        case 2:
          return _context.abrupt("return", {
            success: false,
            data: (response === null || response === void 0 ? void 0 : response.data) || '获取数据失败'
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
 * 格式化条目数据
 * @param {Object} bangumi 条目数据
 * @param {string} coverMirror 图片镜像源
 * @returns {Object} 格式化后的数据
 */
var formatItemData = function formatItemData(bangumi, coverMirror) {
  var _bangumi$subject, _bangumi$subject2, _bangumi$subject3, _bangumi$subject4, _bangumi$subject5, _bangumi$subject$scor, _bangumi$subject6, _bangumi$subject7, _bangumi$subject$coll, _bangumi$subject8, _bangumi$subject9, _bangumi$subject0;
  return {
    title: (bangumi === null || bangumi === void 0 || (_bangumi$subject = bangumi.subject) === null || _bangumi$subject === void 0 ? void 0 : _bangumi$subject.name_cn) || (bangumi === null || bangumi === void 0 || (_bangumi$subject2 = bangumi.subject) === null || _bangumi$subject2 === void 0 ? void 0 : _bangumi$subject2.name),
    type: CONSTANTS.TYPE[(bangumi === null || bangumi === void 0 ? void 0 : bangumi.subject_type) || (bangumi === null || bangumi === void 0 ? void 0 : bangumi.type)] || '未知',
    cover: coverMirror + (bangumi === null || bangumi === void 0 || (_bangumi$subject3 = bangumi.subject) === null || _bangumi$subject3 === void 0 || (_bangumi$subject3 = _bangumi$subject3.images) === null || _bangumi$subject3 === void 0 ? void 0 : _bangumi$subject3.common),
    totalCount: bangumi === null || bangumi === void 0 || (_bangumi$subject4 = bangumi.subject) === null || _bangumi$subject4 === void 0 ? void 0 : _bangumi$subject4.eps,
    id: (bangumi === null || bangumi === void 0 ? void 0 : bangumi.subject_id) || (bangumi === null || bangumi === void 0 || (_bangumi$subject5 = bangumi.subject) === null || _bangumi$subject5 === void 0 ? void 0 : _bangumi$subject5.id),
    score: (_bangumi$subject$scor = bangumi === null || bangumi === void 0 || (_bangumi$subject6 = bangumi.subject) === null || _bangumi$subject6 === void 0 ? void 0 : _bangumi$subject6.score) !== null && _bangumi$subject$scor !== void 0 ? _bangumi$subject$scor : '-',
    des: bangumi !== null && bangumi !== void 0 && (_bangumi$subject7 = bangumi.subject) !== null && _bangumi$subject7 !== void 0 && _bangumi$subject7.short_summary ? "".concat(bangumi.subject.short_summary.trim(), "...") : '-',
    collect: (_bangumi$subject$coll = bangumi === null || bangumi === void 0 || (_bangumi$subject8 = bangumi.subject) === null || _bangumi$subject8 === void 0 ? void 0 : _bangumi$subject8.collection_total) !== null && _bangumi$subject$coll !== void 0 ? _bangumi$subject$coll : '-',
    myStars: (bangumi === null || bangumi === void 0 ? void 0 : bangumi.rate) || null,
    myComment: (bangumi === null || bangumi === void 0 ? void 0 : bangumi.comment) || null,
    progress: Math.round(((bangumi === null || bangumi === void 0 ? void 0 : bangumi.ep_status) || 0) / ((bangumi === null || bangumi === void 0 || (_bangumi$subject9 = bangumi.subject) === null || _bangumi$subject9 === void 0 ? void 0 : _bangumi$subject9.eps) || 1) * 100),
    tags: (bangumi === null || bangumi === void 0 || (_bangumi$subject0 = bangumi.subject) === null || _bangumi$subject0 === void 0 || (_bangumi$subject0 = _bangumi$subject0.tags) === null || _bangumi$subject0 === void 0 || (_bangumi$subject0 = _bangumi$subject0[0]) === null || _bangumi$subject0 === void 0 ? void 0 : _bangumi$subject0.name) || '-',
    ep_status: (bangumi === null || bangumi === void 0 ? void 0 : bangumi.ep_status) || 0
  };
};

/**
 * 获取单页数据
 * @param {string} vmid 用户ID
 * @param {number} status 状态
 * @param {number} typeNum 类型
 * @param {number} pn 页码
 * @param {string} coverMirror 图片镜像源
 * @returns {Promise<Array>}
 */
var getData = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(vmid, status, typeNum, pn, coverMirror) {
    var _response$data2;
    var response;
    return _regenerator["default"].wrap(function (_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 1;
          return withRetry(function () {
            return axios.get("".concat(CONSTANTS.API.BASE_URL, "/users/").concat(vmid, "/collections"), {
              params: {
                subject_type: typeNum,
                type: status,
                limit: CONSTANTS.API.PAGE_SIZE,
                offset: pn
              },
              headers: {
                'User-Agent': CONSTANTS.API.USER_AGENT
              }
            });
          });
        case 1:
          response = _context2.sent;
          if (!((response === null || response === void 0 ? void 0 : response.status) !== 200)) {
            _context2.next = 2;
            break;
          }
          throw new Error("\u83B7\u53D6\u6570\u636E\u5931\u8D25: HTTP ".concat(response === null || response === void 0 ? void 0 : response.status));
        case 2:
          return _context2.abrupt("return", ((response === null || response === void 0 || (_response$data2 = response.data) === null || _response$data2 === void 0 ? void 0 : _response$data2.data) || []).map(function (item) {
            return formatItemData(item, coverMirror);
          }));
        case 3:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function getData(_x5, _x6, _x7, _x8, _x9) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * 保存数据到文件
 * @param {string} filePath 文件路径
 * @param {Object} data 要保存的数据
 * @param {string} type 数据类型（用于日志）
 */
var saveDataToFile = function saveDataToFile(filePath, data, type) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
    log.info("Bgm ".concat(type, " data has been saved to ").concat(filePath));
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
 * 处理分页数据
 * @param {Object} params 参数对象
 * @returns {Promise<Array>}
 */
var processData = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(vmid, status, showProgress, typeNum, coverMirror) {
    var page, list, bar, statusText, typeText, i, data, _t;
    return _regenerator["default"].wrap(function (_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 1;
          return getDataPage(vmid, status, typeNum);
        case 1:
          page = _context3.sent;
          if (page !== null && page !== void 0 && page.success) {
            _context3.next = 2;
            break;
          }
          log.error("Get ".concat(CONSTANTS.TYPE_EN[typeNum], " data error:"), page === null || page === void 0 ? void 0 : page.data);
          return _context3.abrupt("return", []);
        case 2:
          list = [];
          bar = null;
          if (showProgress) {
            statusText = CONSTANTS.TYPE_STATUS[typeNum][status - 1];
            typeText = CONSTANTS.TYPE[typeNum];
            bar = new ProgressBar("\u6B63\u5728\u83B7\u53D6 ".concat(statusText, " ").concat(typeText, " [:bar] :percent :elapseds"), {
              total: page.data - 1,
              complete: '█'
            });
          }
          _context3.prev = 3;
          i = 1;
        case 4:
          if (!(i < page.data)) {
            _context3.next = 7;
            break;
          }
          if (showProgress) bar.tick();
          _context3.next = 5;
          return getData(vmid, status, typeNum, (i - 1) * CONSTANTS.API.PAGE_SIZE, coverMirror);
        case 5:
          data = _context3.sent;
          list.push.apply(list, (0, _toConsumableArray2["default"])(data));
        case 6:
          i++;
          _context3.next = 4;
          break;
        case 7:
          return _context3.abrupt("return", list);
        case 8:
          _context3.prev = 8;
          _t = _context3["catch"](3);
          log.error("\u5904\u7406\u6570\u636E\u65F6\u53D1\u751F\u9519\u8BEF: ".concat(_t.message));
          return _context3.abrupt("return", []);
        case 9:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[3, 8]]);
  }));
  return function processData(_x0, _x1, _x10, _x11, _x12) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * 获取Bangumi数据
 * @param {Object} options 配置选项
 * @returns {Promise<void>}
 */
module.exports.getBgmv0Data = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(_ref4) {
    var vmid, type, showProgress, sourceDir, extraOrder, pagination, coverMirror, startTime, wantWatch, watching, watched, endTime, bangumis, dataDir, allBangumis, extraPath, extraData, _t2;
    return _regenerator["default"].wrap(function (_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          vmid = _ref4.vmid, type = _ref4.type, showProgress = _ref4.showProgress, sourceDir = _ref4.sourceDir, extraOrder = _ref4.extraOrder, pagination = _ref4.pagination, coverMirror = _ref4.coverMirror;
          _context4.prev = 1;
          log.info("Getting bgm ".concat(CONSTANTS.TYPE_EN[type], " data, please wait..."));
          startTime = new Date().getTime(); // 获取三种状态的数据
          _context4.next = 2;
          return processData(vmid, 1, showProgress, type, coverMirror);
        case 2:
          wantWatch = _context4.sent;
          _context4.next = 3;
          return processData(vmid, 3, showProgress, type, coverMirror);
        case 3:
          watching = _context4.sent;
          _context4.next = 4;
          return processData(vmid, 2, showProgress, type, coverMirror);
        case 4:
          watched = _context4.sent;
          endTime = new Date().getTime();
          log.info("".concat(wantWatch.length + watching.length + watched.length, " ").concat(CONSTANTS.TYPE_EN[type], "s have been loaded in ").concat(endTime - startTime, " ms"));
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
          saveDataToFile(path.join(dataDir, "".concat(CONSTANTS.TYPE_EN[type], "s.json")), bangumis, CONSTANTS.TYPE_EN[type]);

          // 处理分页数据
          if (pagination) {
            allBangumis = _objectSpread({}, bangumis);
            extraPath = path.join(dataDir, "extra_".concat(CONSTANTS.TYPE_EN[type], "s.json")); // 合并额外数据
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
            saveDataToFile(path.join(sourceDir, "".concat(CONSTANTS.TYPE_EN[type], "s.json")), allBangumis, "".concat(CONSTANTS.TYPE_EN[type], " (with extras)"));
          }
          _context4.next = 6;
          break;
        case 5:
          _context4.prev = 5;
          _t2 = _context4["catch"](1);
          log.error("Failed to get bgm ".concat(CONSTANTS.TYPE_EN[type], " data"));
          console.error(_t2);
          throw _t2;
        case 6:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[1, 5]]);
  }));
  return function (_x13) {
    return _ref5.apply(this, arguments);
  };
}();