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
var TYPE = {
  1: '书籍',
  2: '动画',
  3: '音乐',
  4: '游戏',
  6: '三次元'
};
var getDataPage = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(vmid, status, typeNum) {
    var _response$data;
    var response;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return axios.get("http://api.bgm.tv/v0/users/".concat(vmid, "/collections?subject_type=").concat(typeNum, "&type=").concat(status, "&limit=1&offset=0"), {
            headers: {
              'User-Agent': 'HCLonely/hexo-bilibili-bangumi'
            }
          });
        case 2:
          response = _context.sent;
          if (!(typeof (response === null || response === void 0 || (_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.total) !== 'undefined')) {
            _context.next = 7;
            break;
          }
          return _context.abrupt("return", {
            success: true,
            data: Math.ceil(response.data.total / 30) + 1
          });
        case 7:
          if (!(response && response.data)) {
            _context.next = 9;
            break;
          }
          return _context.abrupt("return", {
            success: false,
            data: response.data
          });
        case 9:
          return _context.abrupt("return", {
            success: false,
            data: response
          });
        case 10:
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
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(vmid, status, typeNum, pn, coverMirror) {
    var response, $data, _response$data2, list, _iterator, _step, _bangumi$subject, _bangumi$subject2, _bangumi$subject3, _bangumi$subject4, _bangumi$subject5, _bangumi$subject$scor, _bangumi$subject6, _bangumi$subject7, _bangumi$subject8, _bangumi$subject9, _bangumi$subject10, bangumi;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return axios.get("http://api.bgm.tv/v0/users/".concat(vmid, "/collections?subject_type=").concat(typeNum, "&type=").concat(status, "&limit=30&offset=").concat(pn), {
            headers: {
              'User-Agent': 'HCLonely/hexo-bilibili-bangumi'
            }
          });
        case 2:
          response = _context2.sent;
          $data = [];
          if (!((response === null || response === void 0 ? void 0 : response.status) === 200)) {
            _context2.next = 9;
            break;
          }
          list = (response === null || response === void 0 || (_response$data2 = response.data) === null || _response$data2 === void 0 ? void 0 : _response$data2.data) || [];
          _iterator = _createForOfIteratorHelper(list);
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              bangumi = _step.value;
              $data.push({
                title: (bangumi === null || bangumi === void 0 || (_bangumi$subject = bangumi.subject) === null || _bangumi$subject === void 0 ? void 0 : _bangumi$subject.name_cn) || (bangumi === null || bangumi === void 0 || (_bangumi$subject2 = bangumi.subject) === null || _bangumi$subject2 === void 0 ? void 0 : _bangumi$subject2.name),
                type: TYPE[(bangumi === null || bangumi === void 0 ? void 0 : bangumi.subject_type) || (bangumi === null || bangumi === void 0 ? void 0 : bangumi.type)] || '未知',
                cover: coverMirror + (bangumi === null || bangumi === void 0 || (_bangumi$subject3 = bangumi.subject) === null || _bangumi$subject3 === void 0 || (_bangumi$subject3 = _bangumi$subject3.images) === null || _bangumi$subject3 === void 0 ? void 0 : _bangumi$subject3.common),
                totalCount: bangumi === null || bangumi === void 0 || (_bangumi$subject4 = bangumi.subject) === null || _bangumi$subject4 === void 0 ? void 0 : _bangumi$subject4.eps,
                id: (bangumi === null || bangumi === void 0 ? void 0 : bangumi.subject_id) || (bangumi === null || bangumi === void 0 || (_bangumi$subject5 = bangumi.subject) === null || _bangumi$subject5 === void 0 ? void 0 : _bangumi$subject5.id),
                score: (_bangumi$subject$scor = bangumi === null || bangumi === void 0 || (_bangumi$subject6 = bangumi.subject) === null || _bangumi$subject6 === void 0 ? void 0 : _bangumi$subject6.score) !== null && _bangumi$subject$scor !== void 0 ? _bangumi$subject$scor : '-',
                des: "".concat(bangumi === null || bangumi === void 0 || (_bangumi$subject7 = bangumi.subject) === null || _bangumi$subject7 === void 0 || (_bangumi$subject7 = _bangumi$subject7.short_summary) === null || _bangumi$subject7 === void 0 ? void 0 : _bangumi$subject7.trim(), "...") || '-',
                collect: (bangumi === null || bangumi === void 0 || (_bangumi$subject8 = bangumi.subject) === null || _bangumi$subject8 === void 0 ? void 0 : _bangumi$subject8.collection_total) || '-',
                myStars: bangumi.rate || null,
                myComment: bangumi.comment || null,
                progress: Math.round(((bangumi === null || bangumi === void 0 ? void 0 : bangumi.ep_status) || 0) / ((bangumi === null || bangumi === void 0 || (_bangumi$subject9 = bangumi.subject) === null || _bangumi$subject9 === void 0 ? void 0 : _bangumi$subject9.eps) || 1) * 100),
                tags: (bangumi === null || bangumi === void 0 || (_bangumi$subject10 = bangumi.subject) === null || _bangumi$subject10 === void 0 || (_bangumi$subject10 = _bangumi$subject10.tags) === null || _bangumi$subject10 === void 0 || (_bangumi$subject10 = _bangumi$subject10[0]) === null || _bangumi$subject10 === void 0 ? void 0 : _bangumi$subject10.name) || '-',
                ep_status: (bangumi === null || bangumi === void 0 ? void 0 : bangumi.ep_status) || 0
              });
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
          return _context2.abrupt("return", $data);
        case 9:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function getData(_x4, _x5, _x6, _x7, _x8) {
    return _ref2.apply(this, arguments);
  };
}();
var processData = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(vmid, status, showProgress, typeNum, coverMirror) {
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
            bar = new ProgressBar("\u6B63\u5728\u83B7\u53D6 ".concat(status === 1 ? "".concat(typeNum === 4 ? '[想玩]' : '[想看]') : status === 2 ? "".concat(typeNum === 4 ? '[已玩]' : '[已看]') : "".concat(typeNum === 4 ? '[在玩]' : '[在看]'), " ").concat(TYPE[typeNum], " [:bar] :percent :elapseds"), {
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
          return getData(vmid, status, typeNum, (i - 1) * 30, coverMirror);
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
          console.log("Get ".concat(typeNum === 2 ? 'bangumi' : 'game', " data error:"), page === null || page === void 0 ? void 0 : page.data);
          return _context3.abrupt("return", []);
        case 20:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return function processData(_x9, _x10, _x11, _x12, _x13) {
    return _ref3.apply(this, arguments);
  };
}();
module.exports.getBgmv0Data = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(_ref4) {
    var vmid, type, showProgress, sourceDir, extraOrder, pagination, coverMirror, startTime, wantWatch, watching, watched, endTime, bangumis, allBangumis, _JSON$parse, wantWatchExtra, watchingExtra, watchedExtra;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          vmid = _ref4.vmid, type = _ref4.type, showProgress = _ref4.showProgress, sourceDir = _ref4.sourceDir, extraOrder = _ref4.extraOrder, pagination = _ref4.pagination, coverMirror = _ref4.coverMirror;
          log.info("Getting bgm ".concat(type === 2 ? 'bangumi' : 'game', " data, please wait..."));
          startTime = new Date().getTime();
          _context4.next = 5;
          return processData(vmid, 1, showProgress, type, coverMirror);
        case 5:
          wantWatch = _context4.sent;
          _context4.next = 8;
          return processData(vmid, 3, showProgress, type, coverMirror);
        case 8:
          watching = _context4.sent;
          _context4.next = 11;
          return processData(vmid, 2, showProgress, type, coverMirror);
        case 11:
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
          fs.writeFile(path.join(sourceDir, "/_data/".concat(type === 2 ? 'bangumi' : 'game', "s.json")), JSON.stringify(bangumis), function (err) {
            if (err) {
              log.info("Failed to write data to _data/".concat(type === 2 ? 'bangumi' : 'game', "s.json"));
              console.error(err);
            } else {
              log.info("Bgm ".concat(type === 2 ? 'bangumi' : 'game', "s data has been saved"));
            }
          });
          if (pagination) {
            allBangumis = _objectSpread({}, bangumis); // extra bangumis
            if (fs.existsSync(path.join(sourceDir, "/_data/extra_".concat(type === 2 ? 'bangumi' : 'game', "s.json")))) {
              _JSON$parse = JSON.parse(fs.readFileSync(path.join(_this.source_dir, "/_data/extra_".concat(type === 2 ? 'bangumi' : 'game', "s.json")))), wantWatchExtra = _JSON$parse.wantWatchExtra, watchingExtra = _JSON$parse.watchingExtra, watchedExtra = _JSON$parse.watchedExtra;
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
            fs.writeFile(path.join(sourceDir, "/".concat(type === 2 ? 'bangumi' : 'game', "s.json")), JSON.stringify(bangumis), function (err) {
              if (err) {
                log.info("Failed to write data to ".concat(type === 2 ? 'bangumi' : 'game', "s.json"));
                console.error(err);
              } else {
                log.info("Bgm ".concat(type === 2 ? 'bangumi' : 'game', "s data has been saved"));
              }
            });
          }
        case 18:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return function (_x14) {
    return _ref5.apply(this, arguments);
  };
}();
