/* global hexo */
'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var fs = require('hexo-fs');

var path = require('path');

var axios = require('axios');

var log = require('hexo-log')({
  debug: false,
  silent: false
});

var ProgressBar = require('progress');

if (typeof URL !== 'function') var _require = require('url'),
    URL = _require.URL;
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

  if (!(this === null || this === void 0 ? void 0 : (_this$config = this.config) === null || _this$config === void 0 ? void 0 : (_this$config$bangumi = _this$config.bangumi) === null || _this$config$bangumi === void 0 ? void 0 : _this$config$bangumi.enable)) {
    return;
  }

  return require('./lib/bangumi-generator').call(this, locals);
});
hexo.extend.console.register('bangumi', 'Generate pages of bilibili bangumis for Hexo', options, function (args) {
  if (args.d) {
    if (fs.existsSync(path.join(this.source_dir, '/_data/'))) {
      fs.rmdirSync(path.join(this.source_dir, '/_data/'));
      log.info('Bangumis data has been deleted');
    }
  } else if (args.u) {
    var _this$config2, _this$config$bangumi$;

    if (!(this === null || this === void 0 ? void 0 : (_this$config2 = this.config) === null || _this$config2 === void 0 ? void 0 : _this$config2.bangumi)) {
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

    saveBangumiData(this.config.bangumi.vmid, this.config.bangumi.webp, (_this$config$bangumi$ = this.config.bangumi.progress) !== null && _this$config$bangumi$ !== void 0 ? _this$config$bangumi$ : true, this.source_dir);
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

            if (!((response === null || response === void 0 ? void 0 : (_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.code) === 0 && (response === null || response === void 0 ? void 0 : (_response$data2 = response.data) === null || _response$data2 === void 0 ? void 0 : _response$data2.message) === '0' && (response === null || response === void 0 ? void 0 : (_response$data3 = response.data) === null || _response$data3 === void 0 ? void 0 : _response$data3.data) && typeof (response === null || response === void 0 ? void 0 : (_response$data4 = response.data) === null || _response$data4 === void 0 ? void 0 : (_response$data4$data = _response$data4.data) === null || _response$data4$data === void 0 ? void 0 : _response$data4$data.total) !== 'undefined')) {
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
                  score: (bangumi === null || bangumi === void 0 ? void 0 : bangumi.rating) ? bangumi === null || bangumi === void 0 ? void 0 : (_bangumi$rating = bangumi.rating) === null || _bangumi$rating === void 0 ? void 0 : _bangumi$rating.score : '暂无评分',
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
}

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

            if (!(page === null || page === void 0 ? void 0 : page.success)) {
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

function saveBangumiData(_x11) {
  return _saveBangumiData.apply(this, arguments);
}

function _saveBangumiData() {
  _saveBangumiData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(vmid) {
    var webp,
        progress,
        sourceDir,
        startTime,
        wantWatch,
        watching,
        watched,
        endTime,
        bangumis,
        _args4 = arguments;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            webp = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : true;
            progress = _args4.length > 2 ? _args4[2] : undefined;
            sourceDir = _args4.length > 3 ? _args4[3] : undefined;
            log.info('Getting bilibili bangumis, please wait...');
            startTime = new Date().getTime();
            _context4.next = 7;
            return biliBangumi(vmid, 1, webp, progress);

          case 7:
            wantWatch = _context4.sent;
            _context4.next = 10;
            return biliBangumi(vmid, 2, webp, progress);

          case 10:
            watching = _context4.sent;
            _context4.next = 13;
            return biliBangumi(vmid, 3, webp, progress);

          case 13:
            watched = _context4.sent;
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
                log.info('Bilibili bangumis data has been saved');
              }
            });

          case 19:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _saveBangumiData.apply(this, arguments);
}
