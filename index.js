/* global hexo */
'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var fs = require('hexo-fs');

var path = require('path');

var axios = require('axios');

var cheerio = require('cheerio');

var util = require('util');

var bangumiData = require('bangumi-data');

var log = require('hexo-log')({
  debug: false,
  silent: false
});

var ProgressBar = require('progress');

var _require = require('process'),
    config = _require.config;

if (typeof URL !== 'function') var _require2 = require('url'),
    URL = _require2.URL;
var options = {
  options: [{
    name: '-u, --update',
    desc: 'Update bangumi data'
  }, {
    name: '-d, --delete',
    desc: 'Delete bangumi data'
  }]
};
hexo.extend.generator.register('bangumis', function (locals) {
  var _this$config, _this$config$bangumi;

  if (!(this !== null && this !== void 0 && (_this$config = this.config) !== null && _this$config !== void 0 && (_this$config$bangumi = _this$config.bangumi) !== null && _this$config$bangumi !== void 0 && _this$config$bangumi.enable)) {
    return;
  }

  return require('./lib/bangumi-generator').call(this, locals);
});
hexo.extend.console.register('bangumi', 'Generate pages of bilibili bangumis for Hexo', options, function (args) {
  if (args.d) {
    if (fs.existsSync(path.join(this.source_dir, '/_data/bangumis.json'))) {
      fs.unlinkSync(path.join(this.source_dir, '/_data/bangumis.json'));
      log.info('Bangumis data has been deleted');
    }
  } else if (args.u) {
    var _this$config2, _this$config$bangumi$;

    if (!(this !== null && this !== void 0 && (_this$config2 = this.config) !== null && _this$config2 !== void 0 && _this$config2.bangumi)) {
      log.info('Please add config to _config.yml');
      return;
    }

    if (!this.config.bangumi.enable) {
      return;
    }

    if (!this.config.bangumi.vmid) {
      log.info('Please add vmid to _config.yml');
      return;
    }

    if (this.config.bangumi.bgmtv) {
      log.info('Use bgmtv to construct!');
      var constructMethod = bgmtvBangumi;
    } else {
      log.info('Use bilibili to construct!');
      var constructMethod = biliBangumi; // 保留原模式供选择
    }

    saveBangumiData(constructMethod, this.config.bangumi.vmid, this.config.bangumi.webp, (_this$config$bangumi$ = this.config.bangumi.progress) !== null && _this$config$bangumi$ !== void 0 ? _this$config$bangumi$ : true, this.source_dir);
  } else {
    log.info('Unknown command, please use "hexo bangumi -h" to see the available commands');
  }
});

function getBangumiPage(_x, _x2) {
  return _getBangumiPage.apply(this, arguments);
}

function _getBangumiPage() {
  _getBangumiPage = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(vmid, status) {
    var _response$data, _response$data2, _response$data3, _response$data4, _response$data4$data;

    var response;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return axios.get("https://api.bilibili.com/x/space/bangumi/follow/list?type=1&follow_status=".concat(status, "&vmid=").concat(vmid, "&ps=1&pn=1"));

          case 2:
            response = _context.sent;

            if (!((response === null || response === void 0 ? void 0 : (_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.code) === 0 && (response === null || response === void 0 ? void 0 : (_response$data2 = response.data) === null || _response$data2 === void 0 ? void 0 : _response$data2.message) === '0' && response !== null && response !== void 0 && (_response$data3 = response.data) !== null && _response$data3 !== void 0 && _response$data3.data && typeof (response === null || response === void 0 ? void 0 : (_response$data4 = response.data) === null || _response$data4 === void 0 ? void 0 : (_response$data4$data = _response$data4.data) === null || _response$data4$data === void 0 ? void 0 : _response$data4$data.total) !== 'undefined')) {
              _context.next = 7;
              break;
            }

            return _context.abrupt("return", {
              success: true,
              data: Math.ceil(response.data.data.total / 30) + 1
            });

          case 7:
            if (!(response && response.data && response.data.message !== '0')) {
              _context.next = 11;
              break;
            }

            return _context.abrupt("return", {
              success: false,
              data: response.data.message
            });

          case 11:
            if (!(response && response.data)) {
              _context.next = 15;
              break;
            }

            return _context.abrupt("return", {
              success: false,
              data: response.data
            });

          case 15:
            return _context.abrupt("return", {
              success: false,
              data: response
            });

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getBangumiPage.apply(this, arguments);
}

function getBangumi(_x3, _x4, _x5, _x6) {
  return _getBangumi.apply(this, arguments);
}

function _getBangumi() {
  _getBangumi = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(vmid, status, webp, pn) {
    var _response$data5;

    var response, $data, _response$data6, data, list, _iterator, _step, _bangumi$areas, _bangumi$areas$, _bangumi$stat, _bangumi$stat2, _bangumi$stat3, _bangumi$rating, bangumi, cover, href;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return axios.get("https://api.bilibili.com/x/space/bangumi/follow/list?type=1&follow_status=".concat(status, "&vmid=").concat(vmid, "&ps=30&pn=").concat(pn));

          case 2:
            response = _context2.sent;
            $data = [];

            if (!((response === null || response === void 0 ? void 0 : (_response$data5 = response.data) === null || _response$data5 === void 0 ? void 0 : _response$data5.code) === 0)) {
              _context2.next = 10;
              break;
            }

            data = response === null || response === void 0 ? void 0 : (_response$data6 = response.data) === null || _response$data6 === void 0 ? void 0 : _response$data6.data;
            list = (data === null || data === void 0 ? void 0 : data.list) || [];
            _iterator = _createForOfIteratorHelper(list);

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                bangumi = _step.value;
                cover = bangumi === null || bangumi === void 0 ? void 0 : bangumi.cover;

                if (cover) {
                  href = new URL(cover);
                  href.protocol = 'https';
                  if (webp) href.pathname += '@220w_280h.webp';
                  cover = href.href;
                }

                $data.push({
                  title: bangumi === null || bangumi === void 0 ? void 0 : bangumi.title,
                  type: bangumi === null || bangumi === void 0 ? void 0 : bangumi.season_type_name,
                  area: bangumi === null || bangumi === void 0 ? void 0 : (_bangumi$areas = bangumi.areas) === null || _bangumi$areas === void 0 ? void 0 : (_bangumi$areas$ = _bangumi$areas[0]) === null || _bangumi$areas$ === void 0 ? void 0 : _bangumi$areas$.name,
                  cover: cover,
                  totalCount: total(bangumi === null || bangumi === void 0 ? void 0 : bangumi.total_count),
                  id: bangumi === null || bangumi === void 0 ? void 0 : bangumi.media_id,
                  follow: count(bangumi === null || bangumi === void 0 ? void 0 : (_bangumi$stat = bangumi.stat) === null || _bangumi$stat === void 0 ? void 0 : _bangumi$stat.follow),
                  view: count(bangumi === null || bangumi === void 0 ? void 0 : (_bangumi$stat2 = bangumi.stat) === null || _bangumi$stat2 === void 0 ? void 0 : _bangumi$stat2.view),
                  danmaku: count(bangumi === null || bangumi === void 0 ? void 0 : (_bangumi$stat3 = bangumi.stat) === null || _bangumi$stat3 === void 0 ? void 0 : _bangumi$stat3.danmaku),
                  coin: count(bangumi.stat.coin),
                  score: bangumi !== null && bangumi !== void 0 && bangumi.rating ? bangumi === null || bangumi === void 0 ? void 0 : (_bangumi$rating = bangumi.rating) === null || _bangumi$rating === void 0 ? void 0 : _bangumi$rating.score : '暂无评分',
                  des: bangumi === null || bangumi === void 0 ? void 0 : bangumi.evaluate
                });
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }

            return _context2.abrupt("return", $data);

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _getBangumi.apply(this, arguments);
}

function count(e) {
  return e ? e > 10000 && e < 100000000 ? "".concat((e / 10000).toFixed(1), " \u4E07") : e > 100000000 ? "".concat((e / 100000000).toFixed(1), " \u4EBF") : e : '-';
}

function total(e) {
  return e ? e === -1 ? '未完结' : "\u5168".concat(e, "\u8BDD") : '-';
}

function biliBangumi(_x7, _x8, _x9, _x10) {
  return _biliBangumi.apply(this, arguments);
} // added by @Freddd13
// 不太会JS，花了半天读了一遍这个项目的代码后，模仿作者的一些用法和现查一些文档改出来的，请见谅


function _biliBangumi() {
  _biliBangumi = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(vmid, status, webp, progress) {
    var page, list, bar, i, data;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return getBangumiPage(vmid, status, webp);

          case 2:
            page = _context3.sent;

            if (!(page !== null && page !== void 0 && page.success)) {
              _context3.next = 20;
              break;
            }

            list = [];
            bar = null;
            if (progress) bar = new ProgressBar("\u6B63\u5728\u83B7\u53D6 ".concat(status === 1 ? '[想看]' : status === 2 ? '[在看]' : '[已看]', " \u756A\u5267 [:bar] :percent :elapseds"), {
              total: page.data - 1,
              complete: '█'
            });
            i = 1;

          case 8:
            if (!(i < page.data)) {
              _context3.next = 17;
              break;
            }

            if (progress) bar.tick();
            _context3.next = 12;
            return getBangumi(vmid, status, webp, i);

          case 12:
            data = _context3.sent;
            list.push.apply(list, (0, _toConsumableArray2["default"])(data));

          case 14:
            i++;
            _context3.next = 8;
            break;

          case 17:
            return _context3.abrupt("return", list);

          case 20:
            console.log('Get bangumi data error:', page === null || page === void 0 ? void 0 : page.data);
            return _context3.abrupt("return", []);

          case 22:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _biliBangumi.apply(this, arguments);
}

function dealDes(des) {
  // 解决pc描述过长 移动页面？
  des = des.replace('　', ' ');
  var cutNum = 150;
  return des.length > cutNum ? des.substr(0, 150) + '...' : des.substr(0, des.length - 1) + '...';
}

function getPageNum(_x11, _x12) {
  return _getPageNum.apply(this, arguments);
}

function _getPageNum() {
  _getPageNum = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(userid, status) {
    var idlist, res, $, pagenum, _loop, i;

    return _regenerator["default"].wrap(function _callee4$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            idlist = [];
            _context5.next = 3;
            return axios.get("https://bangumi.tv/anime/list/".concat(userid, "/").concat(status));

          case 3:
            res = _context5.sent;
            $ = cheerio.load(res.data);
            pagenum = $('#multipage').find('a').length;
            pagenum = pagenum > 0 ? pagenum : 1; // console.log(pagenum);

            _loop = /*#__PURE__*/_regenerator["default"].mark(function _loop() {
              var res, $;
              return _regenerator["default"].wrap(function _loop$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      _context4.next = 2;
                      return axios.get("https://bangumi.tv/anime/list/".concat(userid, "/").concat(status, "?page=").concat(i + 1));

                    case 2:
                      res = _context4.sent;
                      $ = cheerio.load(res.data);
                      $('li', '#browserItemList').each(function (index, elem) {
                        idlist.push($(elem).attr('id').split('_')[1]);
                      });

                    case 5:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _loop);
            });
            i = 0;

          case 9:
            if (!(i < pagenum)) {
              _context5.next = 14;
              break;
            }

            return _context5.delegateYield(_loop(), "t0", 11);

          case 11:
            i++;
            _context5.next = 9;
            break;

          case 14:
            return _context5.abrupt("return", idlist);

          case 15:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee4);
  }));
  return _getPageNum.apply(this, arguments);
}

function dealBgmtvData(rawdata) {
  var $data = [];
  var tmptags = []; // 生成数据, 后续再整理

  rawdata.forEach(function (elem) {
    var _elem$data$name, _elem$data, _elem$data$rating$sco, _elem$data2, _elem$data2$rating, _elem$data3, _elem$data4, _elem$data$collection, _elem$data5, _elem$data5$collectio, _elem$data$collection2, _elem$data6, _elem$data6$collectio, _elem$data$collection3, _elem$data7, _elem$data7$collectio, _elem$data8, _elem$data8$eps, _elem$data9, _elem$data9$eps, _elem$data10, _elem$data11, _elem$data12, _elem$data13, _elem$data14, _elem$data15;

    var jp_title = (_elem$data$name = elem === null || elem === void 0 ? void 0 : (_elem$data = elem.data) === null || _elem$data === void 0 ? void 0 : _elem$data.name) !== null && _elem$data$name !== void 0 ? _elem$data$name : null; //TODO undefined? 有些cdn数据有问题，后面再写一个修复

    var cn_name = jp_title ? findBangumiCn(jp_title) : null;
    var title = cn_name;
    var score = (_elem$data$rating$sco = elem === null || elem === void 0 ? void 0 : (_elem$data2 = elem.data) === null || _elem$data2 === void 0 ? void 0 : (_elem$data2$rating = _elem$data2.rating) === null || _elem$data2$rating === void 0 ? void 0 : _elem$data2$rating.score) !== null && _elem$data$rating$sco !== void 0 ? _elem$data$rating$sco : null;
    var summary = elem !== null && elem !== void 0 && (_elem$data3 = elem.data) !== null && _elem$data3 !== void 0 && _elem$data3.summary ? dealDes(elem === null || elem === void 0 ? void 0 : (_elem$data4 = elem.data) === null || _elem$data4 === void 0 ? void 0 : _elem$data4.summary) : null;
    var wish = (_elem$data$collection = elem === null || elem === void 0 ? void 0 : (_elem$data5 = elem.data) === null || _elem$data5 === void 0 ? void 0 : (_elem$data5$collectio = _elem$data5.collection) === null || _elem$data5$collectio === void 0 ? void 0 : _elem$data5$collectio.wish) !== null && _elem$data$collection !== void 0 ? _elem$data$collection : null;
    var collect = (_elem$data$collection2 = elem === null || elem === void 0 ? void 0 : (_elem$data6 = elem.data) === null || _elem$data6 === void 0 ? void 0 : (_elem$data6$collectio = _elem$data6.collection) === null || _elem$data6$collectio === void 0 ? void 0 : _elem$data6$collectio.collect) !== null && _elem$data$collection2 !== void 0 ? _elem$data$collection2 : null;
    var doing = (_elem$data$collection3 = elem === null || elem === void 0 ? void 0 : (_elem$data7 = elem.data) === null || _elem$data7 === void 0 ? void 0 : (_elem$data7$collectio = _elem$data7.collection) === null || _elem$data7$collectio === void 0 ? void 0 : _elem$data7$collectio.doing) !== null && _elem$data$collection3 !== void 0 ? _elem$data$collection3 : null; // TODO 有些动画计数包含了sp, .5集等，待优化

    var totalCount = elem !== null && elem !== void 0 && (_elem$data8 = elem.data) !== null && _elem$data8 !== void 0 && (_elem$data8$eps = _elem$data8.eps) !== null && _elem$data8$eps !== void 0 && _elem$data8$eps.length ? (elem === null || elem === void 0 ? void 0 : (_elem$data9 = elem.data) === null || _elem$data9 === void 0 ? void 0 : (_elem$data9$eps = _elem$data9.eps) === null || _elem$data9$eps === void 0 ? void 0 : _elem$data9$eps.length) + '话' : '未知'; // 防止没有样式塌了。。

    var type = (elem === null || elem === void 0 ? void 0 : (_elem$data10 = elem.data) === null || _elem$data10 === void 0 ? void 0 : _elem$data10.type) === 2 ? '番剧' : '其他';
    var viewArray = elem !== null && elem !== void 0 && (_elem$data11 = elem.data) !== null && _elem$data11 !== void 0 && _elem$data11.collection ? Object.values(elem === null || elem === void 0 ? void 0 : (_elem$data12 = elem.data) === null || _elem$data12 === void 0 ? void 0 : _elem$data12.collection) : null;
    var id = elem === null || elem === void 0 ? void 0 : (_elem$data13 = elem.data) === null || _elem$data13 === void 0 ? void 0 : _elem$data13.id;
    var view = viewArray ? function () {
      var sum = 0;
      viewArray.forEach(function (val) {
        sum += val;
      });
      return sum;
    }() : null;
    var cover = elem !== null && elem !== void 0 && (_elem$data14 = elem.data) !== null && _elem$data14 !== void 0 && _elem$data14.image ? "https:" + (elem === null || elem === void 0 ? void 0 : (_elem$data15 = elem.data) === null || _elem$data15 === void 0 ? void 0 : _elem$data15.image) : null; // TODO,tags
    // 完成了一组动画数据

    $data.push({
      title: cn_name,
      score: score,
      des: summary,
      wish: wish,
      collect: collect,
      doing: doing,
      cover: cover,
      totalCount: totalCount,
      type: type,
      view: view,
      id: id
    });
  });
  return $data;
} // 查找中文名


function findBangumiCn() {
  var jp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var item = bangumiData.items.find(function (item) {
    return item.title === jp;
  });

  if (item) {
    var cn = item.titleTranslate && item.titleTranslate['zh-Hans'] && item.titleTranslate['zh-Hans'][0] || jp;
    return cn;
  }

  return jp;
}

function getBangumiCDN(_x13) {
  return _getBangumiCDN.apply(this, arguments);
}

function _getBangumiCDN() {
  _getBangumiCDN = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(idlist) {
    var url, response;
    return _regenerator["default"].wrap(function _callee5$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            url = "https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Subject@master/data/"; // 并发请求，很爽

            _context6.next = 3;
            return axios.all(idlist.map(function (subjectId) {
              return axios.get(url + "".concat(parseInt(parseInt(subjectId) / 100), "/").concat(subjectId, ".json"));
            }));

          case 3:
            response = _context6.sent;
            return _context6.abrupt("return", response);

          case 5:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee5);
  }));
  return _getBangumiCDN.apply(this, arguments);
}

function bgmtvBangumi(_x14, _x15, _x16, _x17) {
  return _bgmtvBangumi.apply(this, arguments);
} // --------


function _bgmtvBangumi() {
  _bgmtvBangumi = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(vmid, status, webp, progress) {
    var idlist, rawdata, finaldata;
    return _regenerator["default"].wrap(function _callee6$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            //TODO: webp, progress
            status = status === 1 ? 'wish' : status === 2 ? 'do' : 'collect';
            _context7.next = 3;
            return getPageNum(vmid, status);

          case 3:
            idlist = _context7.sent;
            _context7.next = 6;
            return getBangumiCDN(idlist);

          case 6:
            rawdata = _context7.sent;
            finaldata = dealBgmtvData(rawdata); // console.log(finaldata)

            return _context7.abrupt("return", finaldata);

          case 9:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee6);
  }));
  return _bgmtvBangumi.apply(this, arguments);
}

function saveBangumiData(_x18, _x19) {
  return _saveBangumiData.apply(this, arguments);
}

function _saveBangumiData() {
  _saveBangumiData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(constructMethod, vmid) {
    var webp,
        progress,
        sourceDir,
        methodInfo,
        startTime,
        wantWatch,
        watching,
        watched,
        endTime,
        bangumis,
        _args8 = arguments;
    return _regenerator["default"].wrap(function _callee7$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            webp = _args8.length > 2 && _args8[2] !== undefined ? _args8[2] : true;
            progress = _args8.length > 3 ? _args8[3] : undefined;
            sourceDir = _args8.length > 4 ? _args8[4] : undefined;
            methodInfo = constructMethod === biliBangumi ? 'bilibili' : 'bgmtv';
            log.info("Getting ".concat(methodInfo, " bangumis, please wait..."));
            startTime = new Date().getTime();
            _context8.next = 8;
            return constructMethod(vmid, 1, webp, progress);

          case 8:
            wantWatch = _context8.sent;
            _context8.next = 11;
            return constructMethod(vmid, 2, webp, progress);

          case 11:
            watching = _context8.sent;
            _context8.next = 14;
            return constructMethod(vmid, 3, webp, progress);

          case 14:
            watched = _context8.sent;
            endTime = new Date().getTime();
            log.info(wantWatch.length + watching.length + watched.length + ' bangumis have been loaded in ' + (endTime - startTime) + ' ms');
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
                log.info("All ".concat(methodInfo, " bangumis data has been saved"));
              }
            });

          case 20:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee7);
  }));
  return _saveBangumiData.apply(this, arguments);
}
