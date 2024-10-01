"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _this = void 0;
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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
var getDataPage = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(vmid, status, typeNum) {
    var _response$data, _response$data2, _response$data3, _response$data4;
    var response;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return axios.get("https://api.bilibili.com/x/space/bangumi/follow/list?type=".concat(typeNum, "&follow_status=").concat(status, "&vmid=").concat(vmid, "&ps=1&pn=1"));
        case 2:
          response = _context.sent;
          if (!((response === null || response === void 0 || (_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.code) === 0 && (response === null || response === void 0 || (_response$data2 = response.data) === null || _response$data2 === void 0 ? void 0 : _response$data2.message) === '0' && response !== null && response !== void 0 && (_response$data3 = response.data) !== null && _response$data3 !== void 0 && _response$data3.data && typeof (response === null || response === void 0 || (_response$data4 = response.data) === null || _response$data4 === void 0 || (_response$data4 = _response$data4.data) === null || _response$data4 === void 0 ? void 0 : _response$data4.total) !== 'undefined')) {
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
    }, _callee);
  }));
  return function getDataPage(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var getData = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(vmid, status, useWebp, typeNum, pn, coverMirror, SESSDATA) {
    var _response$data5;
    var response, $data, _response$data6, data, list, _iterator, _step, _bangumi$areas, _bangumi$stat, _bangumi$stat2, _bangumi$stat3, _bangumi$rating$score, _bangumi$rating, _bangumi$progress$mat, _bangumi$new_ep, _bangumi$progress$mat2, _bangumi$new_ep2, bangumi, cover, href;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return axios.get("https://api.bilibili.com/x/space/bangumi/follow/list?type=".concat(typeNum, "&follow_status=").concat(status, "&vmid=").concat(vmid, "&ps=30&pn=").concat(pn), {
            headers: {
              cookie: "SESSDATA=".concat(SESSDATA, ";")
            }
          });
        case 2:
          response = _context2.sent;
          $data = [];
          if (!((response === null || response === void 0 || (_response$data5 = response.data) === null || _response$data5 === void 0 ? void 0 : _response$data5.code) === 0)) {
            _context2.next = 10;
            break;
          }
          data = response === null || response === void 0 || (_response$data6 = response.data) === null || _response$data6 === void 0 ? void 0 : _response$data6.data;
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
                cover = "".concat(coverMirror).concat(href.href);
              }
              $data.push({
                title: bangumi === null || bangumi === void 0 ? void 0 : bangumi.title,
                type: bangumi === null || bangumi === void 0 ? void 0 : bangumi.season_type_name,
                area: bangumi === null || bangumi === void 0 || (_bangumi$areas = bangumi.areas) === null || _bangumi$areas === void 0 || (_bangumi$areas = _bangumi$areas[0]) === null || _bangumi$areas === void 0 ? void 0 : _bangumi$areas.name,
                cover: cover,
                totalCount: total(bangumi === null || bangumi === void 0 ? void 0 : bangumi.total_count, typeNum),
                id: bangumi === null || bangumi === void 0 ? void 0 : bangumi.media_id,
                follow: count(bangumi === null || bangumi === void 0 || (_bangumi$stat = bangumi.stat) === null || _bangumi$stat === void 0 ? void 0 : _bangumi$stat.follow),
                view: count(bangumi === null || bangumi === void 0 || (_bangumi$stat2 = bangumi.stat) === null || _bangumi$stat2 === void 0 ? void 0 : _bangumi$stat2.view),
                danmaku: count(bangumi === null || bangumi === void 0 || (_bangumi$stat3 = bangumi.stat) === null || _bangumi$stat3 === void 0 ? void 0 : _bangumi$stat3.danmaku),
                coin: count(bangumi.stat.coin),
                score: (_bangumi$rating$score = bangumi === null || bangumi === void 0 || (_bangumi$rating = bangumi.rating) === null || _bangumi$rating === void 0 ? void 0 : _bangumi$rating.score) !== null && _bangumi$rating$score !== void 0 ? _bangumi$rating$score : '-',
                des: bangumi === null || bangumi === void 0 ? void 0 : bangumi.evaluate,
                progress: !SESSDATA ? false : Math.round((parseInt((bangumi === null || bangumi === void 0 || (_bangumi$progress$mat = bangumi.progress.match(/\d+/)) === null || _bangumi$progress$mat === void 0 ? void 0 : _bangumi$progress$mat[0]) || '0', 10) || 0) / ((bangumi === null || bangumi === void 0 ? void 0 : bangumi.total_count) > 0 ? bangumi.total_count : ((_bangumi$new_ep = bangumi.new_ep) === null || _bangumi$new_ep === void 0 ? void 0 : _bangumi$new_ep.title) || 1) * 100),
                ep_status: !SESSDATA ? false : parseInt((bangumi === null || bangumi === void 0 || (_bangumi$progress$mat2 = bangumi.progress.match(/\d+/)) === null || _bangumi$progress$mat2 === void 0 ? void 0 : _bangumi$progress$mat2[0]) || '0', 10) || 0,
                new_ep: (bangumi === null || bangumi === void 0 ? void 0 : bangumi.total_count) > 0 ? bangumi.total_count : ((_bangumi$new_ep2 = bangumi.new_ep) === null || _bangumi$new_ep2 === void 0 ? void 0 : _bangumi$new_ep2.title) || -1
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
    }, _callee2);
  }));
  return function getData(_x4, _x5, _x6, _x7, _x8, _x9, _x10) {
    return _ref2.apply(this, arguments);
  };
}();
// eslint-disable-next-line no-nested-ternary
var count = function count(e) {
  return e ? e > 10000 && e < 100000000 ? "".concat((e / 10000).toFixed(1), " \u4E07") : e > 100000000 ? "".concat((e / 100000000).toFixed(1), " \u4EBF") : e : '-';
};

// eslint-disable-next-line no-nested-ternary
var total = function total(e, typeNum) {
  return e ? e === -1 ? '未完结' : "\u5168".concat(e).concat(typeNum === 1 ? '话' : '集') : '-';
};
var processData = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(vmid, status, useWebp, showProgress, typeNum, coverMirror, SESSDATA) {
    var page, list, bar, i, data;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
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
          }
          // eslint-disable-next-line no-plusplus
          i = 1;
        case 8:
          if (!(i < page.data)) {
            _context3.next = 17;
            break;
          }
          if (showProgress) bar.tick();
          _context3.next = 12;
          return getData(vmid, status, useWebp, typeNum, i, coverMirror, SESSDATA);
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
    }, _callee3);
  }));
  return function processData(_x11, _x12, _x13, _x14, _x15, _x16, _x17) {
    return _ref3.apply(this, arguments);
  };
}();
module.exports.getBiliData = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(_ref4) {
    var vmid, type, showProgress, sourceDir, extraOrder, pagination, _ref4$useWebp, useWebp, coverMirror, SESSDATA, typeNum, startTime, wantWatch, watching, watched, endTime, bangumis, allBangumis, _JSON$parse, wantWatchExtra, watchingExtra, watchedExtra;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          vmid = _ref4.vmid, type = _ref4.type, showProgress = _ref4.showProgress, sourceDir = _ref4.sourceDir, extraOrder = _ref4.extraOrder, pagination = _ref4.pagination, _ref4$useWebp = _ref4.useWebp, useWebp = _ref4$useWebp === void 0 ? true : _ref4$useWebp, coverMirror = _ref4.coverMirror, SESSDATA = _ref4.SESSDATA;
          typeNum = type === 'cinema' ? 2 : 1;
          log.info("Getting bilibili ".concat(type, ", please wait..."));
          startTime = new Date().getTime();
          _context4.next = 6;
          return processData(vmid, 1, useWebp, showProgress, typeNum, coverMirror, SESSDATA);
        case 6:
          wantWatch = _context4.sent;
          _context4.next = 9;
          return processData(vmid, 2, useWebp, showProgress, typeNum, coverMirror, SESSDATA);
        case 9:
          watching = _context4.sent;
          _context4.next = 12;
          return processData(vmid, 3, useWebp, showProgress, typeNum, coverMirror, SESSDATA);
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
              log.info("Failed to write data to _data/".concat(type, "s.json"));
              console.error(err);
            } else {
              log.info("Bilibili ".concat(type, "s data has been saved"));
            }
          });
          if (pagination) {
            allBangumis = _objectSpread({}, bangumis); // extra bangumis
            if (fs.existsSync(path.join(sourceDir, "/_data/extra_".concat(type, "s.json")))) {
              _JSON$parse = JSON.parse(fs.readFileSync(path.join(_this.source_dir, "/_data/extra_".concat(type, "s.json")))), wantWatchExtra = _JSON$parse.wantWatchExtra, watchingExtra = _JSON$parse.watchingExtra, watchedExtra = _JSON$parse.watchedExtra;
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
            fs.writeFile(path.join(sourceDir, "/".concat(type, "s.json")), JSON.stringify(bangumis), function (err) {
              if (err) {
                log.info("Failed to write data to ".concat(type, "s.json"));
                console.error(err);
              } else {
                log.info("Bilibili ".concat(type, "s data has been saved"));
              }
            });
          }
        case 19:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return function (_x18) {
    return _ref5.apply(this, arguments);
  };
}();
