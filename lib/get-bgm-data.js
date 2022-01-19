"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var fs = require('hexo-fs');

var path = require('path');

var axios = require('axios');

var log = require('hexo-log')({
  debug: false,
  silent: false
});

var ProgressBar = require('progress');

var cheerio = require('cheerio');

var bangumiData = require('bangumi-data');

var getItemsId = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(vmid, status, showProgress) {
    var items, response, $, pageNum, bar, _loop, i;

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
              _context2.next = 17;
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

            if (!(pageNum < 2)) {
              _context2.next = 10;
              break;
            }

            return _context2.abrupt("return", items);

          case 10:
            _loop = /*#__PURE__*/_regenerator["default"].mark(function _loop(i) {
              var response, $;
              return _regenerator["default"].wrap(function _loop$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      if (showProgress) {
                        // eslint-disable-next-line no-nested-ternary
                        bar = new ProgressBar("\u6B63\u5728\u83B7\u53D6 ".concat(status === 'wish' ? '[想看]' : status === 'do' ? '[在看]' : '[已看]', " \u756A\u5267 [:bar] :percent :elapseds"), {
                          total: pageNum,
                          complete: '█'
                        });
                      }

                      _context.next = 3;
                      return axios.get("https://bangumi.tv/anime/list/".concat(vmid, "/").concat(status, "?page=").concat(i));

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

          case 12:
            if (!(i <= pageNum)) {
              _context2.next = 17;
              break;
            }

            return _context2.delegateYield(_loop(i), "t0", 14);

          case 14:
            i++;
            _context2.next = 12;
            break;

          case 17:
            return _context2.abrupt("return", items);

          case 18:
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
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(items) {
    return _regenerator["default"].wrap(function _callee2$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return axios.all(items.map(function (item) {
              return axios.get("https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Subject@master/data/".concat(parseInt(parseInt(item.id, 10) / 100, 10), "/").concat(item.id, ".json"), {
                itemData: item,
                responseType: 'json'
              });
            }));

          case 2:
            return _context3.abrupt("return", _context3.sent.map(function (_ref3) {
              var _data, _data2, _data3, _data4, _data5, _data5$rating, _data6, _data6$summary, _data7, _data7$collection, _data8, _data8$collection, _data9, _data9$collection, _data10, _data10$eps, _data11, _data11$eps;

              var config = _ref3.config,
                  data = _ref3.data;

              if (typeof data === 'string') {
                try {
                  // eslint-disable-next-line no-param-reassign
                  data = JSON.parse(data.replace(/(?<!":|\/|\\)("[^":,\]}][^"]*?[^":])"(?!,|]|}|:)/g, '\\$1\\"'));
                } catch (e) {
                  console.log("Error Id: ".concat(config.itemData.id));
                  console.error(e);
                }
              }

              return {
                id: ((_data = data) === null || _data === void 0 ? void 0 : _data.id) || config.itemData.id,
                title: jp2cnName(((_data2 = data) === null || _data2 === void 0 ? void 0 : _data2.name) || config.itemData.name),
                type: TYPE[(_data3 = data) === null || _data3 === void 0 ? void 0 : _data3.type] || '未知',
                cover: ((_data4 = data) === null || _data4 === void 0 ? void 0 : _data4.image) || config.itemData.cover,
                score: ((_data5 = data) === null || _data5 === void 0 ? void 0 : (_data5$rating = _data5.rating) === null || _data5$rating === void 0 ? void 0 : _data5$rating.score) || '-',
                des: ((_data6 = data) === null || _data6 === void 0 ? void 0 : (_data6$summary = _data6.summary) === null || _data6$summary === void 0 ? void 0 : _data6$summary.replace(/\r?\n/g, '').trim()) || '-',
                wish: ((_data7 = data) === null || _data7 === void 0 ? void 0 : (_data7$collection = _data7.collection) === null || _data7$collection === void 0 ? void 0 : _data7$collection.wish) || '-',
                doing: ((_data8 = data) === null || _data8 === void 0 ? void 0 : (_data8$collection = _data8.collection) === null || _data8$collection === void 0 ? void 0 : _data8$collection.doing) || '-',
                collect: ((_data9 = data) === null || _data9 === void 0 ? void 0 : (_data9$collection = _data9.collection) === null || _data9$collection === void 0 ? void 0 : _data9$collection.collect) || '-',
                totalCount: (_data10 = data) !== null && _data10 !== void 0 && (_data10$eps = _data10.eps) !== null && _data10$eps !== void 0 && _data10$eps.length ? "\u5168".concat((_data11 = data) === null || _data11 === void 0 ? void 0 : (_data11$eps = _data11.eps) === null || _data11$eps === void 0 ? void 0 : _data11$eps.length, "\u8BDD") : '-'
              };
            }));

          case 3:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee2);
  }));

  return function getBangumiData(_x4) {
    return _ref2.apply(this, arguments);
  };
}();
/*
(async () => {
  console.log(await getBangumiData([{ id: '975' }]));
})();
function count(e) {
  return e ? (e > 10000 && e < 100000000 ? `${(e / 10000).toFixed(1)} 万` : e > 100000000 ? `${(e / 100000000).toFixed(1)} 亿` : e) : '-';
}
function total(e, typeNum) {
  return e ? (e === -1 ? '未完结' : `全${e}${typeNum === 1 ? '话' : '集'}`) : '-';
}
*/


module.exports.getBgmData = /*#__PURE__*/function () {
  var _getBgmData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(vmid, showProgress, sourceDir) {
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
            _context4.next = 8;
            return (0, _context4.t0)(_context4.t1);

          case 8:
            wantWatch = _context4.sent;
            _context4.t2 = getBangumiData;
            _context4.next = 12;
            return getItemsId(vmid, 'do', showProgress);

          case 12:
            _context4.t3 = _context4.sent;
            _context4.next = 15;
            return (0, _context4.t2)(_context4.t3);

          case 15:
            watching = _context4.sent;
            _context4.t4 = getBangumiData;
            _context4.next = 19;
            return getItemsId(vmid, 'collect', showProgress);

          case 19:
            _context4.t5 = _context4.sent;
            _context4.next = 22;
            return (0, _context4.t4)(_context4.t5);

          case 22:
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
                log.info('Bilibili bangumis data has been saved');
              }
            });

          case 28:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee3);
  }));

  function getBgmData(_x5, _x6, _x7) {
    return _getBgmData.apply(this, arguments);
  }

  return getBgmData;
}();
