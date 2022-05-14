"use strict";

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

var log = require('hexo-log')({
  debug: false,
  silent: false
});

var ProgressBar = require('progress');

var getDataPage = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(vmid, status, typeNum) {
    var _response$data, _response$data2, _response$data3, _response$data4, _response$data4$data;

    var response;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return axios.get("https://api.bilibili.com/x/space/bangumi/follow/list?type=".concat(typeNum, "&follow_status=").concat(status, "&vmid=").concat(vmid, "&ps=1&pn=1"));

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
              _context.next = 13;
              break;
            }

            return _context.abrupt("return", {
              success: false,
              data: response.data
            });

          case 13:
            return _context.abrupt("return", {
              success: false,
              data: response
            });

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getDataPage(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var getData = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(vmid, status, useWebp, typeNum, pn) {
    var _response$data5;

    var response, $data, _response$data6, data, list, _iterator, _step, _bangumi$areas, _bangumi$areas$, _bangumi$stat, _bangumi$stat2, _bangumi$stat3, _bangumi$rating$score, _bangumi$rating, bangumi, cover, href;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return axios.get("https://api.bilibili.com/x/space/bangumi/follow/list?type=".concat(typeNum, "&follow_status=").concat(status, "&vmid=").concat(vmid, "&ps=30&pn=").concat(pn));

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
                  if (useWebp) href.pathname += '@220w_280h.webp';
                  cover = href.href;
                }

                $data.push({
                  title: bangumi === null || bangumi === void 0 ? void 0 : bangumi.title,
                  type: bangumi === null || bangumi === void 0 ? void 0 : bangumi.season_type_name,
                  area: bangumi === null || bangumi === void 0 ? void 0 : (_bangumi$areas = bangumi.areas) === null || _bangumi$areas === void 0 ? void 0 : (_bangumi$areas$ = _bangumi$areas[0]) === null || _bangumi$areas$ === void 0 ? void 0 : _bangumi$areas$.name,
                  cover: cover,
                  totalCount: total(bangumi === null || bangumi === void 0 ? void 0 : bangumi.total_count, typeNum),
                  id: bangumi === null || bangumi === void 0 ? void 0 : bangumi.media_id,
                  follow: count(bangumi === null || bangumi === void 0 ? void 0 : (_bangumi$stat = bangumi.stat) === null || _bangumi$stat === void 0 ? void 0 : _bangumi$stat.follow),
                  view: count(bangumi === null || bangumi === void 0 ? void 0 : (_bangumi$stat2 = bangumi.stat) === null || _bangumi$stat2 === void 0 ? void 0 : _bangumi$stat2.view),
                  danmaku: count(bangumi === null || bangumi === void 0 ? void 0 : (_bangumi$stat3 = bangumi.stat) === null || _bangumi$stat3 === void 0 ? void 0 : _bangumi$stat3.danmaku),
                  coin: count(bangumi.stat.coin),
                  score: (_bangumi$rating$score = bangumi === null || bangumi === void 0 ? void 0 : (_bangumi$rating = bangumi.rating) === null || _bangumi$rating === void 0 ? void 0 : _bangumi$rating.score) !== null && _bangumi$rating$score !== void 0 ? _bangumi$rating$score : '-',
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

  return function getData(_x4, _x5, _x6, _x7, _x8) {
    return _ref2.apply(this, arguments);
  };
}(); // eslint-disable-next-line no-nested-ternary


var count = function count(e) {
  return e ? e > 10000 && e < 100000000 ? "".concat((e / 10000).toFixed(1), " \u4E07") : e > 100000000 ? "".concat((e / 100000000).toFixed(1), " \u4EBF") : e : '-';
}; // eslint-disable-next-line no-nested-ternary


var total = function total(e, typeNum) {
  return e ? e === -1 ? '未完结' : "\u5168".concat(e).concat(typeNum === 1 ? '话' : '集') : '-';
};

var processData = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(vmid, status, useWebp, showProgress, typeNum) {
    var page, list, bar, i, data;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return getDataPage(vmid, status, typeNum);

          case 2:
            page = _context3.sent;

            if (!(page !== null && page !== void 0 && page.success)) {
              _context3.next = 18;
              break;
            }

            list = [];
            bar = null;

            if (showProgress) {
              // eslint-disable-next-line no-nested-ternary
              bar = new ProgressBar("\u6B63\u5728\u83B7\u53D6 ".concat(status === 1 ? '[想看]' : status === 2 ? '[在看]' : '[已看]', " ").concat(typeNum === 1 ? '番剧' : '追剧', " [:bar] :percent :elapseds"), {
                total: page.data - 1,
                complete: '█'
              });
            } // eslint-disable-next-line no-plusplus


            i = 1;

          case 8:
            if (!(i < page.data)) {
              _context3.next = 17;
              break;
            }

            if (showProgress) bar.tick();
            _context3.next = 12;
            return getData(vmid, status, useWebp, typeNum, i);

          case 12:
            data = _context3.sent;
            list.push.apply(list, (0, _toConsumableArray2["default"])(data));

          case 14:
            i++;
            _context3.next = 8;
            break;

          case 17:
            return _context3.abrupt("return", list);

          case 18:
            console.log("Get ".concat(typeNum === 1 ? 'bangumi' : 'cinema', " data error:"), page === null || page === void 0 ? void 0 : page.data);
            return _context3.abrupt("return", []);

          case 20:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function processData(_x9, _x10, _x11, _x12, _x13) {
    return _ref3.apply(this, arguments);
  };
}();

module.exports.getBiliData = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(vmid, type, showProgress, sourceDir) {
    var useWebp,
        typeNum,
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
            useWebp = _args4.length > 4 && _args4[4] !== undefined ? _args4[4] : true;
            typeNum = type === 'cinema' ? 2 : 1;
            log.info("Getting bilibili ".concat(type, ", please wait..."));
            startTime = new Date().getTime();
            _context4.next = 6;
            return processData(vmid, 1, useWebp, showProgress, typeNum);

          case 6:
            wantWatch = _context4.sent;
            _context4.next = 9;
            return processData(vmid, 2, useWebp, showProgress, typeNum);

          case 9:
            watching = _context4.sent;
            _context4.next = 12;
            return processData(vmid, 3, useWebp, showProgress, typeNum);

          case 12:
            watched = _context4.sent;
            endTime = new Date().getTime();
            log.info("".concat(wantWatch.length + watching.length + watched.length, " ").concat(type, "s have been loaded in ").concat(endTime - startTime, " ms"));
            bangumis = {
              wantWatch: wantWatch,
              watching: watching,
              watched: watched
            };

            if (!fs.existsSync(path.join(sourceDir, '/_data/'))) {
              fs.mkdirsSync(path.join(sourceDir, '/_data/'));
            }

            fs.writeFile(path.join(sourceDir, "/_data/".concat(type, "s.json")), JSON.stringify(bangumis), function (err) {
              if (err) {
                log.info("Failed to write data to ".concat(type, "s.json"));
                console.error(err);
              } else {
                log.info("Bilibili ".concat(type, "s data has been saved"));
              }
            });

          case 18:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x14, _x15, _x16, _x17) {
    return _ref4.apply(this, arguments);
  };
}();
