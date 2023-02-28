"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
/* eslint-disable no-underscore-dangle */
var fs = require('hexo-fs');
var path = require('path');
var axios = require('axios');
var hexoLog = require('hexo-log');
var log = typeof hexoLog["default"] === 'function' ? hexoLog["default"]({
  debug: false,
  silent: false
}) : hexoLog({
  debug: false,
  silent: false
});
var ProgressBar = require('progress');
var cheerio = require('cheerio');
var tunnel = require('tunnel');
var bangumiData = require('bangumi-data');
var jp2cnName = function jp2cnName(name) {
  var _bangumiData$items$fi, _bangumiData$items$fi2, _bangumiData$items$fi3;
  return ((_bangumiData$items$fi = bangumiData.items.find(function (item) {
    return item.title === name;
  })) === null || _bangumiData$items$fi === void 0 ? void 0 : (_bangumiData$items$fi2 = _bangumiData$items$fi.titleTranslate) === null || _bangumiData$items$fi2 === void 0 ? void 0 : (_bangumiData$items$fi3 = _bangumiData$items$fi2['zh-Hans']) === null || _bangumiData$items$fi3 === void 0 ? void 0 : _bangumiData$items$fi3[0]) || name;
};
var TYPE = {
  1: '书籍',
  2: '动画',
  3: '音乐',
  4: '游戏',
  6: '三次元'
};
var getBangumiDataFromBangumiSubject = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(items, sourceDir, proxy) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return Promise.allSettled(items.map( /*#__PURE__*/function () {
              var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(item, index) {
                var cachePath, subjectPath, options;
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        cachePath = path.join(sourceDir, '/_data/Bangumi-Subject-Cache');
                        subjectPath = path.join(cachePath, "".concat(item.id, ".json"));
                        if (!fs.existsSync(cachePath)) {
                          fs.mkdirsSync(cachePath);
                        }
                        if (!fs.existsSync(subjectPath)) {
                          _context.next = 5;
                          break;
                        }
                        return _context.abrupt("return", {
                          config: {
                            itemData: item
                          },
                          data: fs.readFileSync(subjectPath).toString(),
                          status: 200
                        });
                      case 5:
                        options = {
                          itemData: item,
                          responseType: 'json',
                          validateStatus: function validateStatus(status) {
                            return status >= 200 && status < 300 || status === 403;
                          },
                          proxy: false,
                          timeout: 30 * 1000
                        };
                        if (proxy !== null && proxy !== void 0 && proxy.host && proxy !== null && proxy !== void 0 && proxy.port) {
                          options.httpsAgent = tunnel.httpsOverHttp({
                            proxy: proxy,
                            options: {
                              rejectUnauthorized: false
                            }
                          });
                        }
                        _context.next = 9;
                        return axios.get("https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Subject@master/data/".concat(parseInt(parseInt(item.id, 10) / 100, 10), "/").concat(item.id, ".json"), options).then(function (response) {
                          return response;
                        })["catch"](function (error) {
                          if (error.response) {
                            console.error('Error', error.response.status);
                          } else {
                            console.error('Error', error.stack);
                          }
                          return {
                            config: {
                              itemData: item
                            },
                            error: error
                          };
                        });
                      case 9:
                        return _context.abrupt("return", _context.sent);
                      case 10:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));
              return function (_x4, _x5) {
                return _ref2.apply(this, arguments);
              };
            }()));
          case 2:
            return _context2.abrupt("return", _context2.sent.map(function (_ref3) {
              var value = _ref3.value,
                reason = _ref3.reason;
              var _ref4 = value || reason,
                config = _ref4.config,
                data = _ref4.data,
                status = _ref4.status;
              var bangumiData = data;
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
              if (typeof data === 'string') {
                try {
                  // eslint-disable-next-line no-param-reassign
                  bangumiData = JSON.parse(data.replace(/(?<!":|\/|\\)("[^":,\]}][^"]*?[^":])"(?!,|]|}|:)/g, '\\$1\\"'));
                } catch (e) {
                  console.log("Error Id: ".concat(config.itemData.id));
                  console.error(e);
                }
              }
              var _bangumiData = bangumiData,
                id = _bangumiData.id,
                name = _bangumiData.name,
                type = _bangumiData.type,
                image = _bangumiData.image,
                _bangumiData$rating = _bangumiData.rating;
              _bangumiData$rating = _bangumiData$rating === void 0 ? {} : _bangumiData$rating;
              var score = _bangumiData$rating.score,
                summary = _bangumiData.summary,
                _bangumiData$collecti = _bangumiData.collection;
              _bangumiData$collecti = _bangumiData$collecti === void 0 ? {} : _bangumiData$collecti;
              var wish = _bangumiData$collecti.wish,
                doing = _bangumiData$collecti.doing,
                collect = _bangumiData$collecti.collect,
                eps = _bangumiData.eps,
                epsLength = _bangumiData.epsLength;
              var totalCount = epsLength || (eps === null || eps === void 0 ? void 0 : eps.length);
              var subjectPath = path.join(sourceDir, '/_data/Bangumi-Subject-Cache', "".concat(config.itemData.id, ".json"));
              if (!fs.existsSync(subjectPath)) {
                if (id && name && type && image && score && summary && wish && doing && collect && (eps === null || eps === void 0 ? void 0 : eps.length) > 0) {
                  fs.writeFileSync(subjectPath, JSON.stringify({
                    id: id,
                    name: name,
                    type: type,
                    image: image,
                    rating: {
                      score: score
                    },
                    summary: summary,
                    collection: {
                      wish: wish,
                      doing: doing,
                      collect: collect
                    },
                    epsLength: eps.length
                  }));
                }
              }
              return {
                id: id || config.itemData.id,
                title: jp2cnName(name || config.itemData.name),
                type: TYPE[type] || '未知',
                cover: image || config.itemData.cover,
                score: score || '-',
                des: (summary === null || summary === void 0 ? void 0 : summary.replace(/\r?\n/g, '').trim()) || '-',
                wish: wish || '-',
                doing: doing || '-',
                collect: collect || '-',
                totalCount: totalCount ? "\u5168".concat(totalCount, "\u8BDD") : '-',
                myStars: config.itemData.myStars,
                myComment: config.itemData.myComment
              };
            }));
          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return function getBangumiDataFromBangumiSubject(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var getBangumiDataFromBangumiApi = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(items, sourceDir, proxy) {
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return Promise.allSettled(items.map( /*#__PURE__*/function () {
              var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(item, index) {
                var cachePath, subjectPath, options;
                return _regenerator["default"].wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        cachePath = path.join(sourceDir, '/_data/Bangumi-Api-Cache');
                        subjectPath = path.join(cachePath, "".concat(item.id, ".json"));
                        if (!fs.existsSync(cachePath)) {
                          fs.mkdirsSync(cachePath);
                        }
                        if (!fs.existsSync(subjectPath)) {
                          _context3.next = 5;
                          break;
                        }
                        return _context3.abrupt("return", {
                          config: {
                            itemData: item
                          },
                          data: JSON.parse(fs.readFileSync(subjectPath).toString()),
                          status: 200
                        });
                      case 5:
                        options = {
                          itemData: item,
                          responseType: 'json',
                          validateStatus: function validateStatus(status) {
                            return status >= 200 && status < 300 || status === 403;
                          },
                          proxy: false,
                          timeout: 30 * 1000
                        };
                        if (proxy !== null && proxy !== void 0 && proxy.host && proxy !== null && proxy !== void 0 && proxy.port) {
                          options.httpsAgent = tunnel.httpsOverHttp({
                            proxy: proxy,
                            options: {
                              rejectUnauthorized: false
                            }
                          });
                        }
                        _context3.next = 9;
                        return axios.get("https://api.bgm.tv/v0/subjects/".concat(item.id), _objectSpread(_objectSpread({}, options), {}, {
                          headers: {
                            'user-agent': 'HCLonely/hexo-bilibili-bangumi (https://github.com/HCLonely/hexo-bilibili-bangumi)'
                          }
                        })).then(function (response) {
                          return response;
                        })["catch"](function (error) {
                          if (error.response) {
                            console.error('Error', error.response.status);
                          } else {
                            console.error('Error', error.stack);
                          }
                          return {
                            config: {
                              itemData: item
                            },
                            error: error
                          };
                        });
                      case 9:
                        return _context3.abrupt("return", _context3.sent);
                      case 10:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));
              return function (_x9, _x10) {
                return _ref6.apply(this, arguments);
              };
            }()));
          case 2:
            return _context4.abrupt("return", _context4.sent.map(function (_ref7) {
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
              // eslint-disable-next-line camelcase
              var id = data.id,
                name = data.name,
                name_cn = data.name_cn,
                type = data.type,
                image = data.images.common,
                _data$rating = data.rating;
              _data$rating = _data$rating === void 0 ? {} : _data$rating;
              var score = _data$rating.score,
                summary = data.summary,
                _data$collection = data.collection;
              _data$collection = _data$collection === void 0 ? {} : _data$collection;
              var wish = _data$collection.wish,
                doing = _data$collection.doing,
                collect = _data$collection.collect,
                eps = data.eps,
                total_episodes = data.total_episodes;
              // eslint-disable-next-line camelcase
              var totalCount = total_episodes || eps;
              var subjectPath = path.join(sourceDir, '/_data/Bangumi-Api-Cache', "".concat(config.itemData.id, ".json"));
              if (!fs.existsSync(subjectPath)) {
                // eslint-disable-next-line camelcase
                if (id && name && type && image && score && summary && wish && doing && collect && (total_episodes || eps)) {
                  // eslint-disable-next-line camelcase
                  fs.writeFileSync(subjectPath, JSON.stringify({
                    id: id,
                    name: name,
                    name_cn: name_cn,
                    type: type,
                    images: {
                      common: image
                    },
                    rating: {
                      score: score
                    },
                    summary: summary,
                    collection: {
                      wish: wish,
                      doing: doing,
                      collect: collect
                    },
                    eps: eps,
                    total_episodes: total_episodes
                  }));
                }
              }
              return {
                id: id || config.itemData.id,
                // eslint-disable-next-line camelcase
                title: name_cn || jp2cnName(name || config.itemData.name),
                type: TYPE[type] || '未知',
                cover: image || config.itemData.cover,
                score: score || '-',
                des: (summary === null || summary === void 0 ? void 0 : summary.replace(/\r?\n/g, '').trim()) || '-',
                wish: wish || '-',
                doing: doing || '-',
                collect: collect || '-',
                totalCount: totalCount ? "\u5168".concat(totalCount, "\u8BDD") : '-',
                myStars: config.itemData.myStars,
                myComment: config.itemData.myComment
              };
            }));
          case 3:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return function getBangumiDataFromBangumiApi(_x6, _x7, _x8) {
    return _ref5.apply(this, arguments);
  };
}();
var getItemsId = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(_ref9) {
    var _response$request$pat;
    var vmid, status, showProgress, sourceDir, proxy, infoApi, host, getBangumiData, items, bar, options, response, username, $, pageNum, _loop, i;
    return _regenerator["default"].wrap(function _callee5$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            vmid = _ref9.vmid, status = _ref9.status, showProgress = _ref9.showProgress, sourceDir = _ref9.sourceDir, proxy = _ref9.proxy, infoApi = _ref9.infoApi, host = _ref9.host;
            getBangumiData = infoApi === 'bgmSub' ? getBangumiDataFromBangumiSubject : getBangumiDataFromBangumiApi;
            items = [];
            options = {
              proxy: false,
              timeout: 30 * 1000
            };
            if (proxy !== null && proxy !== void 0 && proxy.host && proxy !== null && proxy !== void 0 && proxy.port) {
              options.httpsAgent = tunnel.httpsOverHttp({
                proxy: proxy,
                options: {
                  rejectUnauthorized: false
                }
              });
            }
            _context6.next = 7;
            return axios.get("https://".concat(host, "/anime/list/").concat(vmid, "/").concat(status, "?page=1"), options);
          case 7:
            response = _context6.sent;
            username = (_response$request$pat = response.request.path.match(/anime\/list\/(.*?)\//)) === null || _response$request$pat === void 0 ? void 0 : _response$request$pat[1];
            if (username) {
              _context6.next = 11;
              break;
            }
            return _context6.abrupt("return", console.error('Failed to get "username"!'));
          case 11:
            if (!(response !== null && response !== void 0 && response.data)) {
              _context6.next = 32;
              break;
            }
            $ = cheerio.load(response.data);
            pageNum = Math.max.apply(Math, (0, _toConsumableArray2["default"])($('#multipage').find('a').map(function (index, el) {
              var _$$attr, _$$attr$match;
              return parseInt(((_$$attr = $(el).attr('href')) === null || _$$attr === void 0 ? void 0 : (_$$attr$match = _$$attr.match(/\?page=([\d]+)/)) === null || _$$attr$match === void 0 ? void 0 : _$$attr$match[1]) || '0', 10);
            }).get())) || $('#multipage').find('a').length;
            _context6.t0 = items.push;
            _context6.t1 = items;
            _context6.t2 = _toConsumableArray2["default"];
            _context6.next = 19;
            return getBangumiData($('#browserItemList>li').map(function (index, el) {
              var _$$find$attr, _$$find$attr$match;
              return {
                id: $(el).attr('id').replace('item_', ''),
                cover: $(el).find('img').attr('src'),
                name: $(el).find('h3>a').text(),
                myStars: (_$$find$attr = $(el).find('.starlight').attr('class')) === null || _$$find$attr === void 0 ? void 0 : (_$$find$attr$match = _$$find$attr.match(/stars([\d]+)/)) === null || _$$find$attr$match === void 0 ? void 0 : _$$find$attr$match[1],
                myComment: $(el).find('#comment_box').text().trim()
              };
            }).get(), sourceDir, proxy);
          case 19:
            _context6.t3 = _context6.sent;
            _context6.t4 = (0, _context6.t2)(_context6.t3);
            _context6.t0.apply.call(_context6.t0, _context6.t1, _context6.t4);
            if (showProgress) {
              // eslint-disable-next-line no-nested-ternary
              bar = new ProgressBar("\u6B63\u5728\u83B7\u53D6 ".concat(status === 'wish' ? '[想看]' : status === 'do' ? '[在看]' : '[已看]', " \u756A\u5267 [:bar] :percent :elapseds"), {
                total: pageNum < 2 ? 1 : pageNum,
                complete: '█'
              });
              bar.tick();
            }
            if (!(pageNum < 2)) {
              _context6.next = 25;
              break;
            }
            return _context6.abrupt("return", items);
          case 25:
            _loop = /*#__PURE__*/_regenerator["default"].mark(function _loop(i) {
              var response, $;
              return _regenerator["default"].wrap(function _loop$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      if (showProgress) bar.tick();
                      _context5.next = 3;
                      return axios.get("https://".concat(host, "/anime/list/").concat(username, "/").concat(status, "?page=").concat(i), _objectSpread(_objectSpread({}, options), {}, {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36 Edg/97.0.1072.69'
                      }));
                    case 3:
                      response = _context5.sent;
                      $ = cheerio.load(response.data);
                      _context5.t0 = items.push;
                      _context5.t1 = items;
                      _context5.t2 = _toConsumableArray2["default"];
                      _context5.next = 10;
                      return getBangumiData($('#browserItemList>li').map(function (index, el) {
                        var _$$find$attr2, _$$find$attr2$match;
                        return {
                          id: $(el).attr('id').replace('item_', ''),
                          cover: $(el).find('img').attr('src'),
                          name: $(el).find('h3>a').text(),
                          myStars: (_$$find$attr2 = $(el).find('.starlight').attr('class')) === null || _$$find$attr2 === void 0 ? void 0 : (_$$find$attr2$match = _$$find$attr2.match(/stars([\d]+)/)) === null || _$$find$attr2$match === void 0 ? void 0 : _$$find$attr2$match[1],
                          myComment: $(el).find('#comment_box').text().trim()
                        };
                      }).get(), sourceDir, proxy);
                    case 10:
                      _context5.t3 = _context5.sent;
                      _context5.t4 = (0, _context5.t2)(_context5.t3);
                      _context5.t0.apply.call(_context5.t0, _context5.t1, _context5.t4);
                    case 13:
                    case "end":
                      return _context5.stop();
                  }
                }
              }, _loop);
            });
            i = 2;
          case 27:
            if (!(i <= pageNum)) {
              _context6.next = 32;
              break;
            }
            return _context6.delegateYield(_loop(i), "t5", 29);
          case 29:
            i++;
            _context6.next = 27;
            break;
          case 32:
            return _context6.abrupt("return", items);
          case 33:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee5);
  }));
  return function getItemsId(_x11) {
    return _ref10.apply(this, arguments);
  };
}();
module.exports.getBgmData = /*#__PURE__*/function () {
  var _getBgmData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(_ref11) {
    var vmid, showProgress, sourceDir, extraOrder, pagination, proxy, infoApi, host, startTime, wantWatch, watching, watched, endTime, bangumis, allBangumis, _JSON$parse, wantWatchExtra, watchingExtra, watchedExtra;
    return _regenerator["default"].wrap(function _callee6$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            vmid = _ref11.vmid, showProgress = _ref11.showProgress, sourceDir = _ref11.sourceDir, extraOrder = _ref11.extraOrder, pagination = _ref11.pagination, proxy = _ref11.proxy, infoApi = _ref11.infoApi, host = _ref11.host;
            log.info('Getting bangumis, please wait...');
            startTime = new Date().getTime();
            _context7.next = 5;
            return getItemsId({
              vmid: vmid,
              status: 'wish',
              showProgress: showProgress,
              sourceDir: sourceDir,
              proxy: proxy,
              infoApi: infoApi,
              host: host
            });
          case 5:
            wantWatch = _context7.sent;
            _context7.next = 8;
            return getItemsId({
              vmid: vmid,
              status: 'do',
              showProgress: showProgress,
              sourceDir: sourceDir,
              proxy: proxy,
              infoApi: infoApi,
              host: host
            });
          case 8:
            watching = _context7.sent;
            _context7.next = 11;
            return getItemsId({
              vmid: vmid,
              status: 'collect',
              showProgress: showProgress,
              sourceDir: sourceDir,
              proxy: proxy,
              infoApi: infoApi,
              host: host
            });
          case 11:
            watched = _context7.sent;
            endTime = new Date().getTime();
            log.info("".concat(wantWatch.length + watching.length + watched.length, " bangumis have been loaded in ").concat(endTime - startTime, " ms"));
            bangumis = {
              wantWatch: wantWatch,
              watching: watching,
              watched: watched
            };
            if (!fs.existsSync(path.join(sourceDir, '/_data/'))) {
              fs.mkdirsSync(path.join(sourceDir, '/_data/'));
            }
            fs.writeFile(path.join(sourceDir, '/_data/bangumis.json'), JSON.stringify(bangumis), function (err) {
              if (err) {
                log.info('Failed to write data to _data/bangumis.json');
                console.error(err);
              } else {
                log.info('Bangumi bangumis data has been saved');
              }
            });
            if (pagination) {
              allBangumis = _objectSpread({}, bangumis); // extra bangumis
              if (fs.existsSync(path.join(sourceDir, '/_data/extra_bangumis.json'))) {
                _JSON$parse = JSON.parse(fs.readFileSync(path.join(this.source_dir, "/_data/extra_".concat(type, "s.json")))), wantWatchExtra = _JSON$parse.wantWatchExtra, watchingExtra = _JSON$parse.watchingExtra, watchedExtra = _JSON$parse.watchedExtra;
                if (wantWatchExtra) {
                  if (extraOrder === 1) {
                    allBangumis.wantWatch = [].concat((0, _toConsumableArray2["default"])(wantWatchExtra), (0, _toConsumableArray2["default"])(allBangumis.wantWatch));
                  } else {
                    allBangumis.wantWatch = [].concat((0, _toConsumableArray2["default"])(allBangumis.wantWatch), (0, _toConsumableArray2["default"])(wantWatchExtra));
                  }
                }
                if (watchingExtra) {
                  if (extraOrder === 1) {
                    allBangumis.watching = [].concat((0, _toConsumableArray2["default"])(watchingExtra), (0, _toConsumableArray2["default"])(allBangumis.watching));
                  } else {
                    allBangumis.watching = [].concat((0, _toConsumableArray2["default"])(allBangumis.watching), (0, _toConsumableArray2["default"])(watchingExtra));
                  }
                }
                if (watchedExtra) {
                  if (extraOrder === 1) {
                    allBangumis.watched = [].concat((0, _toConsumableArray2["default"])(watchedExtra), (0, _toConsumableArray2["default"])(allBangumis.watched));
                  } else {
                    allBangumis.watched = [].concat((0, _toConsumableArray2["default"])(allBangumis.watched), (0, _toConsumableArray2["default"])(watchedExtra));
                  }
                }
              }
              fs.writeFile(path.join(sourceDir, '/bangumis.json'), JSON.stringify(allBangumis), function (err) {
                if (err) {
                  log.info('Failed to write data to bangumis.json');
                  console.error(err);
                } else {
                  log.info('Bangumi bangumis data has been saved');
                }
              });
            }
          case 18:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee6, this);
  }));
  function getBgmData(_x12) {
    return _getBgmData.apply(this, arguments);
  }
  return getBgmData;
}();
