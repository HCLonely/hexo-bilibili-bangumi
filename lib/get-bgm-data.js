"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

/* eslint-disable no-underscore-dangle */
var fs = require('hexo-fs');

var path = require('path');

var axios = require('axios');

var log = require('hexo-log')({
  debug: false,
  silent: false
});

var ProgressBar = require('progress');

var cheerio = require('cheerio');

var tunnel = require('tunnel');

var bangumiData = require('bangumi-data');

var getItemsId = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(vmid, status, showProgress) {
    var items, bar, response, $, pageNum, _loop, i;

    return _regenerator["default"].wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            items = [];
            _context2.next = 3;
            return axios.get("https://bangumi.tv/anime/list/".concat(vmid, "/").concat(status, "?page=1"));

          case 3:
            response = _context2.sent;

            if (!(response !== null && response !== void 0 && response.data)) {
              _context2.next = 19;
              break;
            }

            $ = cheerio.load(response.data);
            pageNum = $('#multipage').find('a').length;
            items = $('#browserItemList>li').map(function (index, el) {
              return {
                id: $(el).attr('id').replace('item_', ''),
                cover: $(el).find('img').attr('src'),
                name: $(el).find('h3>a').text()
              };
            }).get();

            if (showProgress) {
              // eslint-disable-next-line no-nested-ternary
              bar = new ProgressBar("\u6B63\u5728\u83B7\u53D6 ".concat(status === 'wish' ? '[想看]' : status === 'do' ? '[在看]' : '[已看]', " \u756A\u5267 [:bar] :percent :elapseds"), {
                total: pageNum < 2 ? 1 : pageNum,
                complete: '█'
              });
              bar.tick();
            }

            if (!(pageNum < 2)) {
              _context2.next = 12;
              break;
            }

            log.info('正在获取番剧详细数据，请耐心等待...');
            return _context2.abrupt("return", items);

          case 12:
            _loop = /*#__PURE__*/_regenerator["default"].mark(function _loop(i) {
              var response, $;
              return _regenerator["default"].wrap(function _loop$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      if (showProgress) bar.tick();
                      _context.next = 3;
                      return axios.get("https://bangumi.tv/anime/list/".concat(vmid, "/").concat(status, "?page=").concat(i), {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36 Edg/97.0.1072.69'
                      });

                    case 3:
                      response = _context.sent;
                      $ = cheerio.load(response.data);
                      items = [].concat((0, _toConsumableArray2["default"])(items), (0, _toConsumableArray2["default"])($('#browserItemList>li').map(function (index, el) {
                        return {
                          id: $(el).attr('id').replace('item_', ''),
                          cover: $(el).find('img').attr('src'),
                          name: $(el).find('h3>a').text()
                        };
                      }).get()));

                    case 6:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _loop);
            });
            i = 2;

          case 14:
            if (!(i <= pageNum)) {
              _context2.next = 19;
              break;
            }

            return _context2.delegateYield(_loop(i), "t0", 16);

          case 16:
            i++;
            _context2.next = 14;
            break;

          case 19:
            log.info('正在获取番剧详细数据，耗时与追番数量成正比，请耐心等待...');
            return _context2.abrupt("return", items);

          case 21:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee);
  }));

  return function getItemsId(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

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

var getBangumiData = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(items, sourceDir, proxy) {
    return _regenerator["default"].wrap(function _callee2$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return Promise.all(items.map(function (item) {
              var cachePath = path.join(sourceDir, '/_data/Bangumi-Subject-Cache');
              var subjectPath = path.join(cachePath, "".concat(item.id, ".json"));

              if (!fs.existsSync(cachePath)) {
                fs.mkdirsSync(cachePath);
              }

              if (fs.existsSync(subjectPath)) {
                return {
                  config: {
                    itemData: item
                  },
                  data: fs.readFileSync(subjectPath).toString(),
                  status: 200
                };
              }

              var options = {
                itemData: item,
                responseType: 'json',
                validateStatus: function validateStatus(status) {
                  return status >= 200 && status < 300 || status === 403;
                }
              };

              if (proxy !== null && proxy !== void 0 && proxy.host && proxy !== null && proxy !== void 0 && proxy.port) {
                options.httpsAgent = tunnel.httpsOverHttp({
                  proxy: proxy,
                  rejectUnauthorized: false
                });
              }

              return axios.get("https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Subject@master/data/".concat(parseInt(parseInt(item.id, 10) / 100, 10), "/").concat(item.id, ".json"), options).then(function (response) {
                return response;
              })["catch"](function (error) {
                if (error.response) {
                  console.error('Error', error.response.status);
                } else {
                  console.error('Error', error.stack);
                }

                return error;
              });
            }));

          case 2:
            return _context3.abrupt("return", _context3.sent.map(function (_ref3) {
              var config = _ref3.config,
                  data = _ref3.data,
                  status = _ref3.status;

              if (status === 403 || !data) {
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

              if (typeof data === 'string') {
                try {
                  // eslint-disable-next-line no-param-reassign
                  data = JSON.parse(data.replace(/(?<!":|\/|\\)("[^":,\]}][^"]*?[^":])"(?!,|]|}|:)/g, '\\$1\\"'));
                } catch (e) {
                  console.log("Error Id: ".concat(config.itemData.id));
                  console.error(e);
                }
              }

              var _data = data,
                  id = _data.id,
                  name = _data.name,
                  type = _data.type,
                  image = _data.image,
                  _data$rating = _data.rating;
              _data$rating = _data$rating === void 0 ? {} : _data$rating;
              var score = _data$rating.score,
                  summary = _data.summary,
                  _data$collection = _data.collection;
              _data$collection = _data$collection === void 0 ? {} : _data$collection;
              var wish = _data$collection.wish,
                  doing = _data$collection.doing,
                  collect = _data$collection.collect,
                  eps = _data.eps,
                  epsLength = _data.epsLength;
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
                totalCount: totalCount ? "\u5168".concat(totalCount, "\u8BDD") : '-'
              };
            }));

          case 3:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee2);
  }));

  return function getBangumiData(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();

module.exports.getBgmData = /*#__PURE__*/function () {
  var _getBgmData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(vmid, showProgress, sourceDir, proxy) {
    var startTime, wantWatch, watching, watched, endTime, bangumis;
    return _regenerator["default"].wrap(function _callee3$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            log.info('Getting bangumis, please wait...');
            startTime = new Date().getTime();
            _context4.t0 = getBangumiData;
            _context4.next = 5;
            return getItemsId(vmid, 'wish', showProgress);

          case 5:
            _context4.t1 = _context4.sent;
            _context4.t2 = sourceDir;
            _context4.t3 = proxy;
            _context4.next = 10;
            return (0, _context4.t0)(_context4.t1, _context4.t2, _context4.t3);

          case 10:
            wantWatch = _context4.sent;
            _context4.t4 = getBangumiData;
            _context4.next = 14;
            return getItemsId(vmid, 'do', showProgress);

          case 14:
            _context4.t5 = _context4.sent;
            _context4.t6 = sourceDir;
            _context4.t7 = proxy;
            _context4.next = 19;
            return (0, _context4.t4)(_context4.t5, _context4.t6, _context4.t7);

          case 19:
            watching = _context4.sent;
            _context4.t8 = getBangumiData;
            _context4.next = 23;
            return getItemsId(vmid, 'collect', showProgress);

          case 23:
            _context4.t9 = _context4.sent;
            _context4.t10 = sourceDir;
            _context4.t11 = proxy;
            _context4.next = 28;
            return (0, _context4.t8)(_context4.t9, _context4.t10, _context4.t11);

          case 28:
            watched = _context4.sent;
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
                log.info('Failed to write data to bangumis.json');
                console.error(err);
              } else {
                log.info('Bangumi bangumis data has been saved');
              }
            });

          case 34:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee3);
  }));

  function getBgmData(_x7, _x8, _x9, _x10) {
    return _getBgmData.apply(this, arguments);
  }

  return getBgmData;
}();
