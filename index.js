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
// 裁剪动画描述解决pc描述过长 TODO: 移动页面？


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
  des = des.replace('　', '').replace(' ', '');
  var cutNum = 150;
  return des.length > cutNum ? des.substr(0, 150) + '...' : des.substr(0, des.length - 1) + '...';
} // 从bangumi-data查找中文名, 查不到返回null


function findBangumiCn() {
  var jp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var item = bangumiData.items.find(function (item) {
    return item.title === jp;
  });

  if (item) {
    var cn = item.titleTranslate && item.titleTranslate['zh-Hans'] && item.titleTranslate['zh-Hans'][0] || jp;
    return cn;
  }

  return null;
} // 从bgmtv抓取中文名， 查不到返回日文名


function queryCNName(_x11) {
  return _queryCNName.apply(this, arguments);
} // 对于有问题的CDN， 从源网页抓取


function _queryCNName() {
  _queryCNName = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(id) {
    var _$$attr$split$, _ref;

    var jpname,
        res,
        $,
        cn_name,
        _args4 = arguments;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            jpname = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : null;
            _context4.next = 3;
            return axios.get("https://bgm.tv/subject/".concat(id));

          case 3:
            res = _context4.sent;
            $ = cheerio.load(res.data); // const cn_name = $('span', '#infobox')[0]?.next?.data ?? null

            cn_name = (_$$attr$split$ = $('meta[name="keywords"]').attr('content').split(',')[0]) !== null && _$$attr$split$ !== void 0 ? _$$attr$split$ : null;
            return _context4.abrupt("return", (_ref = cn_name !== null && cn_name !== void 0 ? cn_name : jpname) !== null && _ref !== void 0 ? _ref : null);

          case 7:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _queryCNName.apply(this, arguments);
}

function fixData(_x12) {
  return _fixData.apply(this, arguments);
} // 抓取源网页时，话数只计算正式的集数，排除sp等


function _fixData() {
  _fixData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(id) {
    var _$$, _$$$children$, _$$find, _$, _$$attr, _$2, _yield$queryCNName, _$$text, _$3, _$4, _$5, _$$text$split$, _$6, _$$text$split$2, _$7, _$$text$split$3, _$8, _ref2, _$9, _$$2;

    var res, $, hastotalCount, people, view, i, _people$i$children$, _people$i$children$$d, typeNum;

    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return axios.get("https://bgm.tv/subject/".concat(id));

          case 2:
            res = _context5.sent;
            $ = cheerio.load(res.data);
            hastotalCount = (_$$ = $('span', '#infobox')[1]) === null || _$$ === void 0 ? void 0 : (_$$$children$ = _$$.children[0]) === null || _$$$children$ === void 0 ? void 0 : _$$$children$.data;
            people = (_$$find = (_$ = $('.tip_i')) === null || _$ === void 0 ? void 0 : _$.find('a')) !== null && _$$find !== void 0 ? _$$find : null;
            view = 0;

            for (i = 1; i < people.length; i++) {
              view += parseInt((_people$i$children$ = people[i].children[0]) === null || _people$i$children$ === void 0 ? void 0 : (_people$i$children$$d = _people$i$children$.data) === null || _people$i$children$$d === void 0 ? void 0 : _people$i$children$$d.split('人')[0]);
            }

            typeNum = (_$$attr = (_$2 = $('option[selected*=selected]')) === null || _$2 === void 0 ? void 0 : _$2.attr('value')) !== null && _$$attr !== void 0 ? _$$attr : null;
            _context5.next = 11;
            return queryCNName(id);

          case 11:
            _context5.t1 = _yield$queryCNName = _context5.sent;
            _context5.t0 = _context5.t1 !== null;

            if (!_context5.t0) {
              _context5.next = 15;
              break;
            }

            _context5.t0 = _yield$queryCNName !== void 0;

          case 15:
            if (!_context5.t0) {
              _context5.next = 19;
              break;
            }

            _context5.t2 = _yield$queryCNName;
            _context5.next = 20;
            break;

          case 19:
            _context5.t2 = null;

          case 20:
            _context5.t3 = _context5.t2;
            _context5.t4 = (_$$text = (_$3 = $('span[property*="v:average"]')) === null || _$3 === void 0 ? void 0 : _$3.text()) !== null && _$$text !== void 0 ? _$$text : null;
            _context5.t5 = (_$4 = $('#subject_summary')) !== null && _$4 !== void 0 && _$4.text() ? dealDes((_$5 = $('#subject_summary')) === null || _$5 === void 0 ? void 0 : _$5.text()) : null;
            _context5.t6 = (_$$text$split$ = (_$6 = $('a[href$="wishes"]')) === null || _$6 === void 0 ? void 0 : _$6.text().split('人')[0]) !== null && _$$text$split$ !== void 0 ? _$$text$split$ : null;
            _context5.t7 = (_$$text$split$2 = (_$7 = $('a[href$="collections"]')) === null || _$7 === void 0 ? void 0 : _$7.text().split('人')[0]) !== null && _$$text$split$2 !== void 0 ? _$$text$split$2 : null;
            _context5.t8 = (_$$text$split$3 = (_$8 = $('a[href$="doings"]')) === null || _$8 === void 0 ? void 0 : _$8.text().split('人')[0]) !== null && _$$text$split$3 !== void 0 ? _$$text$split$3 : null;
            _context5.t9 = (_ref2 = 'https:' + ((_$9 = $('img', '#bangumiInfo')) === null || _$9 === void 0 ? void 0 : _$9.attr('src'))) !== null && _ref2 !== void 0 ? _ref2 : null;
            _context5.t10 = hastotalCount ? ((_$$2 = $('span', '#infobox')[1]) === null || _$$2 === void 0 ? void 0 : _$$2.next.data) + '话' : '未知';
            _context5.t11 = typeNum === '2' ? '番剧' : '其他';
            _context5.t12 = view;
            _context5.t13 = id;
            return _context5.abrupt("return", {
              title: _context5.t3,
              score: _context5.t4,
              des: _context5.t5,
              wish: _context5.t6,
              collect: _context5.t7,
              doing: _context5.t8,
              cover: _context5.t9,
              totalCount: _context5.t10,
              type: _context5.t11,
              view: _context5.t12,
              id: _context5.t13
            });

          case 32:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _fixData.apply(this, arguments);
}

function findEps(eps) {
  var result = eps.filter(function (item) {
    return item.type === 0;
  });
  var epSum = result.length; // console.log('debug: eps ', epSum)

  return epSum;
} // 处理获取到的CDN数据


function dealBgmtvData(_x13, _x14) {
  return _dealBgmtvData.apply(this, arguments);
} // 从CDN获取数据


function _dealBgmtvData() {
  _dealBgmtvData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(rawdata, idlist) {
    var $data, _loop, index, elem, _ret;

    return _regenerator["default"].wrap(function _callee6$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            $data = []; // 使用CDN的数据，个别CDN数据有问题，则根据title是否正常去判断去源页面抓取

            _loop = /*#__PURE__*/_regenerator["default"].mark(function _loop() {
              var _elem$data$name, _elem, _elem$data, _elem2, _elem2$data, _elem3, _elem3$data, _findBangumiCn, _elem$data$rating$sco, _elem4, _elem4$data, _elem4$data$rating, _elem5, _elem5$data, _elem6, _elem6$data, _elem$data$collection, _elem7, _elem7$data, _elem7$data$collectio, _elem$data$collection2, _elem8, _elem8$data, _elem8$data$collectio, _elem$data$collection3, _elem9, _elem9$data, _elem9$data$collectio, _elem10, _elem10$data, _elem11, _elem11$data, _elem12, _elem12$data, _elem12$data$eps, _elem13, _elem13$data, _elem14, _elem14$data, _elem15, _elem15$data;

              var jp_title, viewArray;
              return _regenerator["default"].wrap(function _loop$(_context6) {
                while (1) {
                  switch (_context6.prev = _context6.next) {
                    case 0:
                      elem = rawdata[index];
                      jp_title = (_elem$data$name = (_elem = elem) === null || _elem === void 0 ? void 0 : (_elem$data = _elem.data) === null || _elem$data === void 0 ? void 0 : _elem$data.name) !== null && _elem$data$name !== void 0 ? _elem$data$name : null;

                      if (jp_title) {
                        _context6.next = 10;
                        break;
                      }

                      console.log('fix bangumi data: ', idlist[index]); // console.log(fData)

                      _context6.t0 = $data;
                      _context6.next = 7;
                      return fixData(idlist[index]);

                    case 7:
                      _context6.t1 = _context6.sent;

                      _context6.t0.push.call(_context6.t0, _context6.t1);

                      return _context6.abrupt("return", "continue");

                    case 10:
                      viewArray = (_elem2 = elem) !== null && _elem2 !== void 0 && (_elem2$data = _elem2.data) !== null && _elem2$data !== void 0 && _elem2$data.collection ? Object.values((_elem3 = elem) === null || _elem3 === void 0 ? void 0 : (_elem3$data = _elem3.data) === null || _elem3$data === void 0 ? void 0 : _elem3$data.collection) : null; // TODO: tags

                      _context6.t2 = $data;

                      if (!((_findBangumiCn = findBangumiCn(jp_title)) !== null && _findBangumiCn !== void 0)) {
                        _context6.next = 16;
                        break;
                      }

                      _context6.t3 = _findBangumiCn;
                      _context6.next = 19;
                      break;

                    case 16:
                      _context6.next = 18;
                      return queryCNName(idlist[index], jp_title);

                    case 18:
                      _context6.t3 = _context6.sent;

                    case 19:
                      _context6.t4 = _context6.t3;
                      _context6.t5 = (_elem$data$rating$sco = (_elem4 = elem) === null || _elem4 === void 0 ? void 0 : (_elem4$data = _elem4.data) === null || _elem4$data === void 0 ? void 0 : (_elem4$data$rating = _elem4$data.rating) === null || _elem4$data$rating === void 0 ? void 0 : _elem4$data$rating.score) !== null && _elem$data$rating$sco !== void 0 ? _elem$data$rating$sco : null;
                      _context6.t6 = (_elem5 = elem) !== null && _elem5 !== void 0 && (_elem5$data = _elem5.data) !== null && _elem5$data !== void 0 && _elem5$data.summary ? dealDes((_elem6 = elem) === null || _elem6 === void 0 ? void 0 : (_elem6$data = _elem6.data) === null || _elem6$data === void 0 ? void 0 : _elem6$data.summary) : null;
                      _context6.t7 = (_elem$data$collection = (_elem7 = elem) === null || _elem7 === void 0 ? void 0 : (_elem7$data = _elem7.data) === null || _elem7$data === void 0 ? void 0 : (_elem7$data$collectio = _elem7$data.collection) === null || _elem7$data$collectio === void 0 ? void 0 : _elem7$data$collectio.wish) !== null && _elem$data$collection !== void 0 ? _elem$data$collection : null;
                      _context6.t8 = (_elem$data$collection2 = (_elem8 = elem) === null || _elem8 === void 0 ? void 0 : (_elem8$data = _elem8.data) === null || _elem8$data === void 0 ? void 0 : (_elem8$data$collectio = _elem8$data.collection) === null || _elem8$data$collectio === void 0 ? void 0 : _elem8$data$collectio.collect) !== null && _elem$data$collection2 !== void 0 ? _elem$data$collection2 : null;
                      _context6.t9 = (_elem$data$collection3 = (_elem9 = elem) === null || _elem9 === void 0 ? void 0 : (_elem9$data = _elem9.data) === null || _elem9$data === void 0 ? void 0 : (_elem9$data$collectio = _elem9$data.collection) === null || _elem9$data$collectio === void 0 ? void 0 : _elem9$data$collectio.doing) !== null && _elem$data$collection3 !== void 0 ? _elem$data$collection3 : null;
                      _context6.t10 = (_elem10 = elem) !== null && _elem10 !== void 0 && (_elem10$data = _elem10.data) !== null && _elem10$data !== void 0 && _elem10$data.image ? "https:" + ((_elem11 = elem) === null || _elem11 === void 0 ? void 0 : (_elem11$data = _elem11.data) === null || _elem11$data === void 0 ? void 0 : _elem11$data.image) : null;
                      _context6.t11 = (_elem12 = elem) !== null && _elem12 !== void 0 && (_elem12$data = _elem12.data) !== null && _elem12$data !== void 0 && (_elem12$data$eps = _elem12$data.eps) !== null && _elem12$data$eps !== void 0 && _elem12$data$eps.length ? findEps((_elem13 = elem) === null || _elem13 === void 0 ? void 0 : (_elem13$data = _elem13.data) === null || _elem13$data === void 0 ? void 0 : _elem13$data.eps) + '话' : '未知';
                      _context6.t12 = ((_elem14 = elem) === null || _elem14 === void 0 ? void 0 : (_elem14$data = _elem14.data) === null || _elem14$data === void 0 ? void 0 : _elem14$data.type) === 2 ? '番剧' : '其他';
                      _context6.t13 = viewArray ? function () {
                        var sum = 0;
                        viewArray.forEach(function (val) {
                          sum += val;
                        });
                        return sum;
                      }() : null;
                      _context6.t14 = (_elem15 = elem) === null || _elem15 === void 0 ? void 0 : (_elem15$data = _elem15.data) === null || _elem15$data === void 0 ? void 0 : _elem15$data.id;
                      _context6.t15 = {
                        title: _context6.t4,
                        score: _context6.t5,
                        des: _context6.t6,
                        wish: _context6.t7,
                        collect: _context6.t8,
                        doing: _context6.t9,
                        cover: _context6.t10,
                        totalCount: _context6.t11,
                        type: _context6.t12,
                        view: _context6.t13,
                        id: _context6.t14
                      };

                      _context6.t2.push.call(_context6.t2, _context6.t15);

                    case 32:
                    case "end":
                      return _context6.stop();
                  }
                }
              }, _loop);
            });
            index = 0;

          case 3:
            if (!(index < rawdata.length)) {
              _context7.next = 11;
              break;
            }

            return _context7.delegateYield(_loop(), "t0", 5);

          case 5:
            _ret = _context7.t0;

            if (!(_ret === "continue")) {
              _context7.next = 8;
              break;
            }

            return _context7.abrupt("continue", 8);

          case 8:
            index++;
            _context7.next = 3;
            break;

          case 11:
            return _context7.abrupt("return", $data);

          case 12:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee6);
  }));
  return _dealBgmtvData.apply(this, arguments);
}

function getBangumiCDN(_x15) {
  return _getBangumiCDN.apply(this, arguments);
} // 计算页面数目，获取收藏的动画id


function _getBangumiCDN() {
  _getBangumiCDN = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(idlist) {
    var url, response;
    return _regenerator["default"].wrap(function _callee7$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            url = "https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Subject@master/data/";
            _context8.next = 3;
            return axios.all(idlist.map(function (subjectId) {
              return axios.get(url + "".concat(parseInt(parseInt(subjectId) / 100), "/").concat(subjectId, ".json"));
            }));

          case 3:
            response = _context8.sent;
            return _context8.abrupt("return", response);

          case 5:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee7);
  }));
  return _getBangumiCDN.apply(this, arguments);
}

function getPageNum(_x16, _x17) {
  return _getPageNum.apply(this, arguments);
} // bangumi 获取方式入口


function _getPageNum() {
  _getPageNum = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(userid, status) {
    var idlist, res, $, pagenum, _loop2, i;

    return _regenerator["default"].wrap(function _callee8$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            idlist = [];
            _context10.next = 3;
            return axios.get("https://bangumi.tv/anime/list/".concat(userid, "/").concat(status));

          case 3:
            res = _context10.sent;
            $ = cheerio.load(res.data);
            pagenum = $('#multipage').find('a').length;
            pagenum = pagenum > 0 ? pagenum : 1; // console.log(pagenum);

            _loop2 = /*#__PURE__*/_regenerator["default"].mark(function _loop2() {
              var res, $;
              return _regenerator["default"].wrap(function _loop2$(_context9) {
                while (1) {
                  switch (_context9.prev = _context9.next) {
                    case 0:
                      _context9.next = 2;
                      return axios.get("https://bangumi.tv/anime/list/".concat(userid, "/").concat(status, "?page=").concat(i + 1));

                    case 2:
                      res = _context9.sent;
                      $ = cheerio.load(res.data);
                      $('li', '#browserItemList').each(function (index, elem) {
                        idlist.push($(elem).attr('id').split('_')[1]);
                      });

                    case 5:
                    case "end":
                      return _context9.stop();
                  }
                }
              }, _loop2);
            });
            i = 0;

          case 9:
            if (!(i < pagenum)) {
              _context10.next = 14;
              break;
            }

            return _context10.delegateYield(_loop2(), "t0", 11);

          case 11:
            i++;
            _context10.next = 9;
            break;

          case 14:
            return _context10.abrupt("return", idlist);

          case 15:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee8);
  }));
  return _getPageNum.apply(this, arguments);
}

function bgmtvBangumi(_x18, _x19, _x20, _x21) {
  return _bgmtvBangumi.apply(this, arguments);
} // 程序更新追番入口


function _bgmtvBangumi() {
  _bgmtvBangumi = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(vmid, status, webp, progress) {
    var idlist, rawdata, finaldata;
    return _regenerator["default"].wrap(function _callee9$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            //TODO: webp, progress
            status = status === 1 ? 'wish' : status === 2 ? 'do' : 'collect';
            _context11.next = 3;
            return getPageNum(vmid, status);

          case 3:
            idlist = _context11.sent;
            _context11.next = 6;
            return getBangumiCDN(idlist);

          case 6:
            rawdata = _context11.sent;
            _context11.next = 9;
            return dealBgmtvData(rawdata, idlist);

          case 9:
            finaldata = _context11.sent;
            return _context11.abrupt("return", finaldata);

          case 11:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee9);
  }));
  return _bgmtvBangumi.apply(this, arguments);
}

function saveBangumiData(_x22, _x23) {
  return _saveBangumiData.apply(this, arguments);
}

function _saveBangumiData() {
  _saveBangumiData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(constructMethod, vmid) {
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
        _args12 = arguments;
    return _regenerator["default"].wrap(function _callee10$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            webp = _args12.length > 2 && _args12[2] !== undefined ? _args12[2] : true;
            progress = _args12.length > 3 ? _args12[3] : undefined;
            sourceDir = _args12.length > 4 ? _args12[4] : undefined;
            methodInfo = constructMethod === biliBangumi ? 'bilibili' : 'bgmtv';
            log.info("Getting ".concat(methodInfo, " bangumis, please wait..."));
            startTime = new Date().getTime();
            _context12.next = 8;
            return constructMethod(vmid, 1, webp, progress);

          case 8:
            wantWatch = _context12.sent;
            _context12.next = 11;
            return constructMethod(vmid, 2, webp, progress);

          case 11:
            watching = _context12.sent;
            _context12.next = 14;
            return constructMethod(vmid, 3, webp, progress);

          case 14:
            watched = _context12.sent;
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
            return _context12.stop();
        }
      }
    }, _callee10);
  }));
  return _saveBangumiData.apply(this, arguments);
}
