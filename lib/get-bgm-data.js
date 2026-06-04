"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var fs = require('hexo-fs');
var path = require('path');
var axios = require('axios');
var hexoLog = require('hexo-log');
var ProgressBar = require('progress');
var cheerio = require('cheerio');
var tunnel = require('tunnel');
var bangumiData = require('bangumi-data');
var CONSTANTS = {
  TYPE: {
    1: '书籍',
    2: '动画',
    3: '音乐',
    4: '游戏',
    6: '三次元'
  },
  TYPE_PATH_MAP: {
    bangumi: 'anime',
    game: 'game',
    cinema: 'real'
  },
  STATUS_TEXT: {
    wish: '[想看]',
    "do": '[在看]',
    collect: '[已看]'
  },
  TYPE_TEXT: {
    game: '游戏',
    real: '追剧',
    anime: '番剧',
    bangumi: '番剧'
  },
  API: {
    CDN_URL: 'https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Subject@master/data',
    BGM_API_URL: 'https://api.bgm.tv/v0/subjects',
    USER_AGENT: 'HCLonely/hexo-bilibili-bangumi (https://github.com/HCLonely/hexo-bilibili-bangumi)',
    BROWSER_USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36 Edg/97.0.1072.69'
  },
  CACHE: {
    SUBJECT_DIR: 'Bangumi-Subject-Cache',
    API_DIR: 'Bangumi-Api-Cache'
  },
  REQUEST_TIMEOUT: 30 * 1000
};
var log = typeof hexoLog["default"] === 'function' ? hexoLog["default"]({
  debug: false,
  silent: false
}) : hexoLog({
  debug: false,
  silent: false
});
var jp2cnName = function jp2cnName(name) {
  var _bangumiData$items$fi;
  return ((_bangumiData$items$fi = bangumiData.items.find(function (item) {
    return item.title === name;
  })) === null || _bangumiData$items$fi === void 0 || (_bangumiData$items$fi = _bangumiData$items$fi.titleTranslate) === null || _bangumiData$items$fi === void 0 || (_bangumiData$items$fi = _bangumiData$items$fi['zh-Hans']) === null || _bangumiData$items$fi === void 0 ? void 0 : _bangumiData$items$fi[0]) || name;
};
var createRequestConfig = function createRequestConfig(proxy) {
  var itemData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var config = {
    itemData: itemData,
    responseType: 'json',
    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300 || status === 403;
    },
    proxy: false,
    timeout: CONSTANTS.REQUEST_TIMEOUT
  };
  if (proxy !== null && proxy !== void 0 && proxy.host && proxy !== null && proxy !== void 0 && proxy.port) {
    config.httpsAgent = tunnel.httpsOverHttp({
      proxy: proxy,
      options: {
        rejectUnauthorized: false
      }
    });
  }
  return config;
};
var ensureCacheDir = function ensureCacheDir(sourceDir, cacheDir) {
  var cachePath = path.join(sourceDir, '/_data/', cacheDir);
  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, {
      recursive: true
    });
  }
  return cachePath;
};
var handleApiError = function handleApiError(error) {
  if (error.response) {
    log.error('API Error:', error.response.status);
  } else {
    log.error('Error:', error.stack);
  }
};
var formatSubjectData = function formatSubjectData(data, config, coverMirror) {
  var id = data.id,
    name = data.name,
    type = data.type,
    image = data.image,
    _data$rating = data.rating,
    rating = _data$rating === void 0 ? {} : _data$rating,
    summary = data.summary,
    _data$collection = data.collection,
    collection = _data$collection === void 0 ? {} : _data$collection,
    eps = data.eps,
    epsLength = data.epsLength,
    nsfw = data.nsfw;
  var totalCount = epsLength || (eps === null || eps === void 0 ? void 0 : eps.length);
  return {
    id: id || config.itemData.id,
    title: jp2cnName(name || config.itemData.name),
    type: CONSTANTS.TYPE[type] || '未知',
    cover: coverMirror + image || config.itemData.cover,
    score: rating.score || '-',
    des: (summary === null || summary === void 0 ? void 0 : summary.replace(/\r?\n/g, '').trim()) || '-',
    wish: collection.wish || '-',
    doing: collection.doing || '-',
    collect: collection.collect || '-',
    totalCount: totalCount ? "\u5168".concat(totalCount).concat(type === 6 ? '集' : '话') : '-',
    myStars: config.itemData.myStars,
    myComment: config.itemData.myComment,
    nsfw: nsfw
  };
};
var formatApiData = function formatApiData(data, config, coverMirror) {
  var id = data.id,
    name = data.name,
    name_cn = data.name_cn,
    type = data.type,
    _data$images = data.images,
    _data$images2 = _data$images === void 0 ? {} : _data$images,
    image = _data$images2.common,
    _data$rating2 = data.rating,
    rating = _data$rating2 === void 0 ? {} : _data$rating2,
    summary = data.summary,
    _data$collection2 = data.collection,
    collection = _data$collection2 === void 0 ? {} : _data$collection2,
    eps = data.eps,
    total_episodes = data.total_episodes,
    nsfw = data.nsfw;
  var totalCount = total_episodes || eps;
  return {
    id: id || config.itemData.id,
    title: name_cn || jp2cnName(name || config.itemData.name),
    type: CONSTANTS.TYPE[type] || '未知',
    cover: coverMirror + image || config.itemData.cover,
    score: rating.score || '-',
    des: (summary === null || summary === void 0 ? void 0 : summary.replace(/\r?\n/g, '').trim()) || '-',
    wish: collection.wish || '-',
    doing: collection.doing || '-',
    collect: collection.collect || '-',
    totalCount: totalCount ? "\u5168".concat(totalCount).concat(type === 6 ? '集' : '话') : '-',
    myStars: config.itemData.myStars,
    myComment: config.itemData.myComment,
    nsfw: nsfw
  };
};
var getBangumiDataFromBangumiSubject = function () {
  var _ref = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee2(items, sourceDir, proxy, coverMirror) {
    var cachePath, processItem, results;
    return _regenerator["default"].wrap(function (_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          cachePath = ensureCacheDir(sourceDir, CONSTANTS.CACHE.SUBJECT_DIR);
          processItem = function () {
            var _ref2 = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee(item) {
              var subjectPath, cachedData, config, folderNum, response, _t, _t2;
              return _regenerator["default"].wrap(function (_context) {
                while (1) switch (_context.prev = _context.next) {
                  case 0:
                    subjectPath = path.join(cachePath, "".concat(item.id, ".json"));
                    if (!fs.existsSync(subjectPath)) {
                      _context.next = 3;
                      break;
                    }
                    _context.prev = 1;
                    cachedData = fs.readFileSync(subjectPath).toString();
                    return _context.abrupt("return", {
                      config: {
                        itemData: item
                      },
                      data: cachedData,
                      status: 200
                    });
                  case 2:
                    _context.prev = 2;
                    _t = _context["catch"](1);
                    log.error("Failed to read cache for item ".concat(item.id, ":"), _t);
                  case 3:
                    _context.prev = 3;
                    config = createRequestConfig(proxy, item);
                    folderNum = parseInt(parseInt(item.id, 10) / 100, 10);
                    _context.next = 4;
                    return axios.get("".concat(CONSTANTS.API.CDN_URL, "/").concat(folderNum, "/").concat(item.id, ".json"), config);
                  case 4:
                    response = _context.sent;
                    return _context.abrupt("return", response);
                  case 5:
                    _context.prev = 5;
                    _t2 = _context["catch"](3);
                    handleApiError(_t2);
                    return _context.abrupt("return", {
                      config: {
                        itemData: item
                      },
                      error: _t2
                    });
                  case 6:
                  case "end":
                    return _context.stop();
                }
              }, _callee, null, [[1, 2], [3, 5]]);
            }));
            return function processItem(_x5) {
              return _ref2.apply(this, arguments);
            };
          }();
          _context2.next = 1;
          return Promise.allSettled(items.map(processItem));
        case 1:
          results = _context2.sent;
          return _context2.abrupt("return", results.map(function (_ref3) {
            var value = _ref3.value,
              reason = _ref3.reason;
            var _ref4 = value || reason,
              config = _ref4.config,
              data = _ref4.data,
              status = _ref4.status;
            if (reason || status === 403 || !data) {
              return {
                id: config === null || config === void 0 ? void 0 : config.itemData.id,
                title: jp2cnName(config.itemData.name),
                type: '未知',
                cover: config.itemData.cover,
                score: '-',
                des: '-',
                wish: '-',
                doing: '-',
                collect: '-',
                totalCount: '-'
              };
            }
            var bangumiData = data;
            if (typeof data === 'string') {
              try {
                bangumiData = JSON.parse(data.replace(/(?<!":|\/|\\)("[^":,\]}][^"]*?[^":])"(?!,|]|}|:)/g, '\\$1\\"'));
              } catch (e) {
                log.error("Error parsing data for ID: ".concat(config.itemData.id, ":"), e);
                return null;
              }
            }
            var subjectPath = path.join(cachePath, "".concat(config.itemData.id, ".json"));
            if (!fs.existsSync(subjectPath) && bangumiData.id) {
              var _bangumiData$rating, _bangumiData$collecti, _bangumiData$collecti2, _bangumiData$collecti3, _bangumiData$eps;
              var cacheData = {
                id: bangumiData.id,
                name: bangumiData.name,
                type: bangumiData.type,
                image: bangumiData.image,
                rating: {
                  score: (_bangumiData$rating = bangumiData.rating) === null || _bangumiData$rating === void 0 ? void 0 : _bangumiData$rating.score
                },
                summary: bangumiData.summary,
                collection: {
                  wish: (_bangumiData$collecti = bangumiData.collection) === null || _bangumiData$collecti === void 0 ? void 0 : _bangumiData$collecti.wish,
                  doing: (_bangumiData$collecti2 = bangumiData.collection) === null || _bangumiData$collecti2 === void 0 ? void 0 : _bangumiData$collecti2.doing,
                  collect: (_bangumiData$collecti3 = bangumiData.collection) === null || _bangumiData$collecti3 === void 0 ? void 0 : _bangumiData$collecti3.collect
                },
                epsLength: (_bangumiData$eps = bangumiData.eps) === null || _bangumiData$eps === void 0 ? void 0 : _bangumiData$eps.length
              };
              fs.writeFileSync(subjectPath, JSON.stringify(cacheData));
            }
            return formatSubjectData(bangumiData, config, coverMirror);
          }).filter(Boolean));
        case 2:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function getBangumiDataFromBangumiSubject(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();
var getBangumiDataFromBangumiApi = function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee4(items, sourceDir, proxy, coverMirror) {
    var cachePath, processItem, results;
    return _regenerator["default"].wrap(function (_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          cachePath = ensureCacheDir(sourceDir, CONSTANTS.CACHE.API_DIR);
          processItem = function () {
            var _ref6 = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee3(item) {
              var subjectPath, cachedData, config, response, _t3, _t4;
              return _regenerator["default"].wrap(function (_context3) {
                while (1) switch (_context3.prev = _context3.next) {
                  case 0:
                    subjectPath = path.join(cachePath, "".concat(item.id, ".json"));
                    if (!fs.existsSync(subjectPath)) {
                      _context3.next = 3;
                      break;
                    }
                    _context3.prev = 1;
                    cachedData = JSON.parse(fs.readFileSync(subjectPath).toString());
                    return _context3.abrupt("return", {
                      config: {
                        itemData: item
                      },
                      data: cachedData,
                      status: 200
                    });
                  case 2:
                    _context3.prev = 2;
                    _t3 = _context3["catch"](1);
                    log.error("Failed to read cache for item ".concat(item.id, ":"), _t3);
                  case 3:
                    _context3.prev = 3;
                    config = createRequestConfig(proxy, item);
                    config.headers = {
                      'user-agent': CONSTANTS.API.USER_AGENT
                    };
                    _context3.next = 4;
                    return axios.get("".concat(CONSTANTS.API.BGM_API_URL, "/").concat(item.id), config);
                  case 4:
                    response = _context3.sent;
                    return _context3.abrupt("return", response);
                  case 5:
                    _context3.prev = 5;
                    _t4 = _context3["catch"](3);
                    handleApiError(_t4);
                    return _context3.abrupt("return", {
                      config: {
                        itemData: item
                      },
                      error: _t4
                    });
                  case 6:
                  case "end":
                    return _context3.stop();
                }
              }, _callee3, null, [[1, 2], [3, 5]]);
            }));
            return function processItem(_x0) {
              return _ref6.apply(this, arguments);
            };
          }();
          _context4.next = 1;
          return Promise.allSettled(items.map(processItem));
        case 1:
          results = _context4.sent;
          return _context4.abrupt("return", results.map(function (_ref7) {
            var value = _ref7.value,
              reason = _ref7.reason;
            var _ref8 = value || reason,
              config = _ref8.config,
              data = _ref8.data,
              status = _ref8.status;
            if (reason || status === 403 || !data) {
              return {
                id: config.itemData.id,
                title: jp2cnName(config.itemData.name),
                type: '未知',
                cover: config.itemData.cover,
                score: '-',
                des: '-',
                wish: '-',
                doing: '-',
                collect: '-',
                totalCount: '-'
              };
            }
            var subjectPath = path.join(cachePath, "".concat(config.itemData.id, ".json"));
            if (!fs.existsSync(subjectPath) && data.id) {
              fs.writeFileSync(subjectPath, JSON.stringify(data));
            }
            return formatApiData(data, config, coverMirror);
          }).filter(Boolean));
        case 2:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return function getBangumiDataFromBangumiApi(_x6, _x7, _x8, _x9) {
    return _ref5.apply(this, arguments);
  };
}();
var getItemsId = function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee5(_ref9) {
    var vmid, type, status, showProgress, sourceDir, proxy, infoApi, host, coverMirror, skipNsfw, getBangumiData, items, bar, _response$request$pat, options, response, username, $, pageNum, i, _response, _$, _t5, _t6, _t7, _t8, _t9, _t0, _t1;
    return _regenerator["default"].wrap(function (_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          vmid = _ref9.vmid, type = _ref9.type, status = _ref9.status, showProgress = _ref9.showProgress, sourceDir = _ref9.sourceDir, proxy = _ref9.proxy, infoApi = _ref9.infoApi, host = _ref9.host, coverMirror = _ref9.coverMirror, skipNsfw = _ref9.skipNsfw;
          getBangumiData = infoApi === 'bgmSub' ? getBangumiDataFromBangumiSubject : getBangumiDataFromBangumiApi;
          items = [];
          _context5.prev = 1;
          options = createRequestConfig(proxy);
          _context5.next = 2;
          return axios.get("https://".concat(host, "/").concat(type, "/list/").concat(vmid, "/").concat(status, "?page=1"), options);
        case 2:
          response = _context5.sent;
          username = (_response$request$pat = response.request.path.match(/(anime|game|real)\/list\/(.*?)\//)) === null || _response$request$pat === void 0 ? void 0 : _response$request$pat[2];
          if (username) {
            _context5.next = 3;
            break;
          }
          throw new Error('Failed to get "username"!');
        case 3:
          if (response !== null && response !== void 0 && response.data) {
            _context5.next = 4;
            break;
          }
          throw new Error('No data received from server');
        case 4:
          $ = cheerio.load(response.data);
          pageNum = Math.max.apply(Math, (0, _toConsumableArray2["default"])($('#multipage').find('a').map(function (index, el) {
            var _$$attr;
            return parseInt(((_$$attr = $(el).attr('href')) === null || _$$attr === void 0 || (_$$attr = _$$attr.match(/\?page=([\d]+)/)) === null || _$$attr === void 0 ? void 0 : _$$attr[1]) || '0', 10);
          }).get())) || $('#multipage').find('a').length;
          _t5 = items.push;
          _t6 = items;
          _t7 = _toConsumableArray2["default"];
          _context5.next = 5;
          return getBangumiData(extractItemsFromPage($), sourceDir, proxy, coverMirror, skipNsfw);
        case 5:
          _t5.apply.call(_t5, _t6, _t7(_context5.sent));
          if (showProgress) {
            bar = new ProgressBar("\u6B63\u5728\u83B7\u53D6 ".concat(CONSTANTS.STATUS_TEXT[status], " ").concat(CONSTANTS.TYPE_TEXT[type], " [:bar] :percent :elapseds"), {
              total: pageNum < 2 ? 1 : pageNum,
              complete: '█'
            });
            bar.tick();
          }
          if (!(pageNum < 2)) {
            _context5.next = 6;
            break;
          }
          return _context5.abrupt("return", items);
        case 6:
          i = 2;
        case 7:
          if (!(i <= pageNum)) {
            _context5.next = 11;
            break;
          }
          if (showProgress) bar.tick();
          _context5.next = 8;
          return axios.get("https://".concat(host, "/").concat(type, "/list/").concat(username, "/").concat(status, "?page=").concat(i), _objectSpread(_objectSpread({}, options), {}, {
            headers: {
              'User-Agent': CONSTANTS.API.BROWSER_USER_AGENT
            }
          }));
        case 8:
          _response = _context5.sent;
          _$ = cheerio.load(_response.data);
          _t8 = items.push;
          _t9 = items;
          _t0 = _toConsumableArray2["default"];
          _context5.next = 9;
          return getBangumiData(extractItemsFromPage(_$), sourceDir, proxy, coverMirror, skipNsfw);
        case 9:
          _t8.apply.call(_t8, _t9, _t0(_context5.sent));
        case 10:
          i++;
          _context5.next = 7;
          break;
        case 11:
          return _context5.abrupt("return", items);
        case 12:
          _context5.prev = 12;
          _t1 = _context5["catch"](1);
          log.error('Error fetching items:', _t1);
          return _context5.abrupt("return", []);
        case 13:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[1, 12]]);
  }));
  return function getItemsId(_x1) {
    return _ref0.apply(this, arguments);
  };
}();
var extractItemsFromPage = function extractItemsFromPage($) {
  return $('#browserItemList>li').map(function (index, el) {
    var _$$find$attr;
    return {
      id: $(el).attr('id').replace('item_', ''),
      cover: $(el).find('img').attr('src'),
      name: $(el).find('h3>a').text(),
      myStars: (_$$find$attr = $(el).find('.starlight').attr('class')) === null || _$$find$attr === void 0 || (_$$find$attr = _$$find$attr.match(/stars([\d]+)/)) === null || _$$find$attr === void 0 ? void 0 : _$$find$attr[1],
      myComment: $(el).find('#comment_box').text().trim()
    };
  }).get();
};
var saveDataToFile = function saveDataToFile(filePath, data, type) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
    log.info("Bangumi ".concat(type, " data has been saved to ").concat(filePath));
  } catch (err) {
    log.error("Failed to write data to ".concat(filePath));
    console.error(err);
    throw err;
  }
};
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
module.exports.getBgmData = function () {
  var _getBgmData = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee6(_ref1) {
    var vmid, type, showProgress, sourceDir, extraOrder, pagination, proxy, infoApi, host, coverMirror, skipNsfw, startTime, options, wantWatch, watching, watched, endTime, bangumis, dataDir, allBangumis, extraPath, extraData, _t10;
    return _regenerator["default"].wrap(function (_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          vmid = _ref1.vmid, type = _ref1.type, showProgress = _ref1.showProgress, sourceDir = _ref1.sourceDir, extraOrder = _ref1.extraOrder, pagination = _ref1.pagination, proxy = _ref1.proxy, infoApi = _ref1.infoApi, host = _ref1.host, coverMirror = _ref1.coverMirror, skipNsfw = _ref1.skipNsfw;
          _context6.prev = 1;
          log.info('Getting bangumis, please wait...');
          startTime = new Date().getTime();
          options = {
            vmid: vmid,
            type: CONSTANTS.TYPE_PATH_MAP[type],
            showProgress: showProgress,
            sourceDir: sourceDir,
            proxy: proxy,
            infoApi: infoApi,
            host: host,
            coverMirror: coverMirror,
            skipNsfw: skipNsfw
          };
          _context6.next = 2;
          return getItemsId(_objectSpread(_objectSpread({}, options), {}, {
            status: 'wish'
          })).filter(function (item) {
            return !(skipNsfw && item.nsfw);
          });
        case 2:
          wantWatch = _context6.sent;
          _context6.next = 3;
          return getItemsId(_objectSpread(_objectSpread({}, options), {}, {
            status: 'do'
          })).filter(function (item) {
            return !(skipNsfw && item.nsfw);
          });
        case 3:
          watching = _context6.sent;
          _context6.next = 4;
          return getItemsId(_objectSpread(_objectSpread({}, options), {}, {
            status: 'collect'
          })).filter(function (item) {
            return !(skipNsfw && item.nsfw);
          });
        case 4:
          watched = _context6.sent;
          endTime = new Date().getTime();
          log.info("".concat(wantWatch.length + watching.length + watched.length, " ").concat(type, "s have been loaded in ").concat(endTime - startTime, " ms"));
          bangumis = {
            wantWatch: wantWatch,
            watching: watching,
            watched: watched
          };
          dataDir = path.join(sourceDir, '/_data/');
          if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, {
              recursive: true
            });
          }
          saveDataToFile(path.join(dataDir, "".concat(type, "s.json")), bangumis, type);
          if (pagination) {
            allBangumis = _objectSpread({}, bangumis);
            extraPath = path.join(dataDir, "extra_".concat(type, "s.json"));
            if (fs.existsSync(extraPath)) {
              try {
                extraData = JSON.parse(fs.readFileSync(extraPath, 'utf8'));
                allBangumis = mergeExtraData(allBangumis, extraData, extraOrder);
              } catch (error) {
                log.error("Failed to parse extra data from ".concat(extraPath));
                console.error(error);
              }
            }
            saveDataToFile(path.join(sourceDir, "".concat(type, "s.json")), allBangumis, "".concat(type, " (with extras)"));
          }
          _context6.next = 6;
          break;
        case 5:
          _context6.prev = 5;
          _t10 = _context6["catch"](1);
          log.error('Failed to get bangumi data:', _t10);
          throw _t10;
        case 6:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[1, 5]]);
  }));
  function getBgmData(_x10) {
    return _getBgmData.apply(this, arguments);
  }
  return getBgmData;
}();