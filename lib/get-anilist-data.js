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
 * @Date         : 2024-09-11 15:40:57
 * @LastEditTime : 2025-07-10 10:00:40
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/src/lib/get-anilist-data.js
 * @Description  : AniList数据获取模块，通过GraphQL API获取用户的动画收藏数据。
 *                 支持通过用户ID或用户名获取数据，包含标题、封面、评分、进度等信息，
 *                 并支持多语言标题显示和数据分页功能。
 */

var fs = require('hexo-fs');
var path = require('path');
var axios = require('axios');
var hexoLog = require('hexo-log');

// 常量定义
var ANILIST_API = 'https://graphql.anilist.co';
var CACHE_DIR = '_data';
var CACHE_FILE = 'bangumis.json';
var EXTRA_CACHE_FILE = 'extra_bangumis.json';
var USER_AGENT = 'HCLonely/hexo-bilibili-bangumi';
var MAX_RETRIES = 3;
var RETRY_DELAY = 1000;

// 状态映射
var STATUS_MAP = {
  PLANNING: 'wantWatch',
  CURRENT: 'watching',
  REPEATING: 'watching',
  COMPLETED: 'watched'
};

// 日志实例
var log = typeof hexoLog["default"] === 'function' ? hexoLog["default"]({
  debug: false,
  silent: false
}) : hexoLog({
  debug: false,
  silent: false
});

// GraphQL查询
var MEDIA_LIST_QUERY = "\n  query($userId:Int,$userName:String,$type:MediaType){\n    MediaListCollection(userId:$userId,userName:$userName,type:$type){\n      lists{\n        entries{\n          ...mediaListEntry\n        }\n      }\n    }\n  }\n  fragment mediaListEntry on MediaList{\n    id\n    mediaId\n    status\n    score\n    progress\n    notes\n    media{\n      id\n      title{\n        userPreferred\n        romaji\n        english\n        native\n      }\n      coverImage{\n        large\n      }\n      status(version:2)\n      episodes\n      averageScore\n      popularity\n      countryOfOrigin\n      genres\n      description(asHtml: false)\n    }\n  }\n";

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
 * @param {Object} postData 请求数据
 * @param {number} retries 重试次数
 * @returns {Promise<Object>}
 */
var _fetchWithRetry = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(postData) {
    var retries,
      response,
      _args = arguments,
      _t;
    return _regenerator["default"].wrap(function (_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          retries = _args.length > 1 && _args[1] !== undefined ? _args[1] : MAX_RETRIES;
          _context.prev = 1;
          _context.next = 2;
          return axios.post(ANILIST_API, postData, {
            headers: {
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
          return _context.abrupt("return", _fetchWithRetry(postData, retries - 1));
        case 5:
          throw _t;
        case 6:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[1, 3]]);
  }));
  return function fetchWithRetry(_x) {
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
  var _bangumi$media, _bangumi$media2, _bangumi$media3, _bangumi$media4, _bangumi$media5, _bangumi$media6, _bangumi$media7, _bangumi$media8, _bangumi$media$averag, _bangumi$media9, _bangumi$media0, _bangumi$media1, _bangumi$media10, _bangumi$media11;
  return {
    title: (bangumi === null || bangumi === void 0 || (_bangumi$media = bangumi.media) === null || _bangumi$media === void 0 || (_bangumi$media = _bangumi$media.title) === null || _bangumi$media === void 0 ? void 0 : _bangumi$media.userPreferred) || (bangumi === null || bangumi === void 0 || (_bangumi$media2 = bangumi.media) === null || _bangumi$media2 === void 0 || (_bangumi$media2 = _bangumi$media2.title) === null || _bangumi$media2 === void 0 ? void 0 : _bangumi$media2["native"]) || (bangumi === null || bangumi === void 0 || (_bangumi$media3 = bangumi.media) === null || _bangumi$media3 === void 0 || (_bangumi$media3 = _bangumi$media3.title) === null || _bangumi$media3 === void 0 ? void 0 : _bangumi$media3.english) || (bangumi === null || bangumi === void 0 || (_bangumi$media4 = bangumi.media) === null || _bangumi$media4 === void 0 || (_bangumi$media4 = _bangumi$media4.title) === null || _bangumi$media4 === void 0 ? void 0 : _bangumi$media4.romaji),
    type: (bangumi === null || bangumi === void 0 || (_bangumi$media5 = bangumi.media) === null || _bangumi$media5 === void 0 || (_bangumi$media5 = _bangumi$media5.genres) === null || _bangumi$media5 === void 0 ? void 0 : _bangumi$media5[0]) || '-',
    cover: coverMirror + (bangumi === null || bangumi === void 0 || (_bangumi$media6 = bangumi.media) === null || _bangumi$media6 === void 0 || (_bangumi$media6 = _bangumi$media6.coverImage) === null || _bangumi$media6 === void 0 ? void 0 : _bangumi$media6.large),
    totalCount: bangumi === null || bangumi === void 0 || (_bangumi$media7 = bangumi.media) === null || _bangumi$media7 === void 0 ? void 0 : _bangumi$media7.episodes,
    id: bangumi === null || bangumi === void 0 || (_bangumi$media8 = bangumi.media) === null || _bangumi$media8 === void 0 ? void 0 : _bangumi$media8.id,
    score: (_bangumi$media$averag = bangumi === null || bangumi === void 0 || (_bangumi$media9 = bangumi.media) === null || _bangumi$media9 === void 0 ? void 0 : _bangumi$media9.averageScore) !== null && _bangumi$media$averag !== void 0 ? _bangumi$media$averag : '-',
    des: (bangumi === null || bangumi === void 0 || (_bangumi$media0 = bangumi.media) === null || _bangumi$media0 === void 0 || (_bangumi$media0 = _bangumi$media0.description) === null || _bangumi$media0 === void 0 || (_bangumi$media0 = _bangumi$media0.trim()) === null || _bangumi$media0 === void 0 || (_bangumi$media0 = _bangumi$media0.split('\n')) === null || _bangumi$media0 === void 0 || (_bangumi$media0 = _bangumi$media0[0]) === null || _bangumi$media0 === void 0 ? void 0 : _bangumi$media0.replace(/<[^>]*>?/g, '')) || '-',
    collect: (bangumi === null || bangumi === void 0 || (_bangumi$media1 = bangumi.media) === null || _bangumi$media1 === void 0 ? void 0 : _bangumi$media1.popularity) || '-',
    area: (bangumi === null || bangumi === void 0 || (_bangumi$media10 = bangumi.media) === null || _bangumi$media10 === void 0 ? void 0 : _bangumi$media10.countryOfOrigin) || '-',
    myStars: bangumi.score || null,
    myComment: bangumi.notes || null,
    progress: Math.round(((bangumi === null || bangumi === void 0 ? void 0 : bangumi.progress) || 0) / ((bangumi === null || bangumi === void 0 || (_bangumi$media11 = bangumi.media) === null || _bangumi$media11 === void 0 ? void 0 : _bangumi$media11.episodes) || 1) * 100),
    ep_status: (bangumi === null || bangumi === void 0 ? void 0 : bangumi.progress) || 0
  };
};

/**
 * 获取AniList数据
 * @param {string|number} vmid 用户ID或用户名
 * @param {string} coverMirror 图片镜像
 * @param {string} type 媒体类型
 * @returns {Promise<Object>}
 */
var getData = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(vmid, coverMirror) {
    var type,
      variables,
      postData,
      _response$data,
      response,
      $data,
      list,
      _args2 = arguments,
      _t2;
    return _regenerator["default"].wrap(function (_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          type = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : 'ANIME';
          variables = _objectSpread({
            type: type
          }, typeof vmid === 'number' ? {
            userId: vmid
          } : {
            userName: vmid
          });
          postData = {
            query: MEDIA_LIST_QUERY,
            variables: variables
          };
          _context2.prev = 1;
          _context2.next = 2;
          return _fetchWithRetry(postData);
        case 2:
          response = _context2.sent;
          if (!((response === null || response === void 0 ? void 0 : response.status) !== 200)) {
            _context2.next = 3;
            break;
          }
          throw new Error("API\u8BF7\u6C42\u5931\u8D25: ".concat(response === null || response === void 0 ? void 0 : response.status));
        case 3:
          $data = {
            wantWatch: [],
            watching: [],
            watched: []
          };
          list = (response === null || response === void 0 || (_response$data = response.data) === null || _response$data === void 0 || (_response$data = _response$data.data) === null || _response$data === void 0 || (_response$data = _response$data.MediaListCollection) === null || _response$data === void 0 ? void 0 : _response$data.lists) || [];
          list.forEach(function (list) {
            list.entries.forEach(function (bangumi) {
              var status = STATUS_MAP[bangumi === null || bangumi === void 0 ? void 0 : bangumi.status];
              if (status) {
                var _$data$status;
                (_$data$status = $data[status]) === null || _$data$status === void 0 || _$data$status.push(formatBangumiData(bangumi, coverMirror));
              }
            });
          });
          return _context2.abrupt("return", $data);
        case 4:
          _context2.prev = 4;
          _t2 = _context2["catch"](1);
          log.error("\u83B7\u53D6AniList\u6570\u636E\u5931\u8D25: ".concat(_t2.message));
          throw _t2;
        case 5:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[1, 4]]);
  }));
  return function getData(_x2, _x3) {
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
 * 获取AniList番剧数据
 * @param {Object} options 配置选项
 * @returns {Promise<void>}
 */
module.exports.getAnilistData = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(_ref3) {
    var vmid, type, sourceDir, extraOrder, pagination, coverMirror, startTime, bangumis, totalCount, endTime, mainDataPath, allBangumis, extraDataPath, extraData, paginationPath, _t3;
    return _regenerator["default"].wrap(function (_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          vmid = _ref3.vmid, type = _ref3.type, sourceDir = _ref3.sourceDir, extraOrder = _ref3.extraOrder, pagination = _ref3.pagination, coverMirror = _ref3.coverMirror;
          _context3.prev = 1;
          log.info('Getting anilist bangumi data, please wait...');
          startTime = new Date().getTime(); // 获取数据
          _context3.next = 2;
          return getData(vmid, coverMirror, type);
        case 2:
          bangumis = _context3.sent;
          totalCount = Object.values(bangumis).reduce(function (sum, arr) {
            return sum + arr.length;
          }, 0);
          endTime = new Date().getTime();
          log.info("".concat(totalCount, " bangumis have been loaded in ").concat(endTime - startTime, " ms"));

          // 确保数据目录存在
          ensureDataDir(sourceDir);

          // 写入主数据文件
          mainDataPath = path.join(sourceDir, "/".concat(CACHE_DIR, "/").concat(CACHE_FILE));
          writeDataToFile(mainDataPath, bangumis, 'Failed to write data to _data/bangumis.json', 'Anilist bangumis data has been saved');

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
            writeDataToFile(paginationPath, allBangumis, 'Failed to write data to bangumis.json', 'Anilist bangumis data has been saved');
          }
          _context3.next = 4;
          break;
        case 3:
          _context3.prev = 3;
          _t3 = _context3["catch"](1);
          log.error("\u83B7\u53D6AniList\u6570\u636E\u5931\u8D25: ".concat(_t3.message));
          throw _t3;
        case 4:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[1, 3]]);
  }));
  return function (_x4) {
    return _ref4.apply(this, arguments);
  };
}();