"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/*
 * @Author       : HCLonely
 * @Date         : 2024-09-11 15:40:57
 * @LastEditTime : 2025-08-15 09:58:47
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/src/lib/bangumi-generator.js
 * @Description  : Hexo页面生成器模块，负责生成番剧、影视和游戏的展示页面。
 *                 支持多种数据源模板（B站、Bangumi、AniList），可配置主题样式、
 *                 分页、排序、懒加载等功能，并支持额外数据的混合展示。
 */

var pug = require('pug');
var path = require('path');
var _require = require('./util'),
  i18n = _require.i18n;
var fs = require('hexo-fs');
var hexoLog = require('hexo-log');
var log = typeof hexoLog["default"] === 'function' ? hexoLog["default"]({
  debug: false,
  silent: false
}) : hexoLog({
  debug: false,
  silent: false
});
module.exports = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(locals) {
    var _config$type, _config$type$lazyload, _config$type$source, _config$type$showMyCo, _config$type$paginati, _config$type$progress, _config$type2;
    var type,
      config,
      full_url_for,
      root,
      wantWatch,
      watching,
      watched,
      _JSON$parse,
      _JSON$parse2,
      wantWatchExtra,
      watchingExtra,
      watchedExtra,
      __,
      TEMPLATE_MAP,
      contents,
      customPath,
      _args = arguments;
    return _regenerator["default"].wrap(function (_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          type = _args.length > 1 && _args[1] !== undefined ? _args[1] : 'bangumi';
          config = this.config;
          if (config !== null && config !== void 0 && (_config$type = config[type]) !== null && _config$type !== void 0 && _config$type.enable) {
            _context.next = 1;
            break;
          }
          return _context.abrupt("return");
        case 1:
          full_url_for = this.extend.helper.get('full_url_for').bind(this);
          root = config.root;
          if (root.endsWith('/')) {
            root = root.slice(0, root.length - 1);
          }
          wantWatch = [];
          watching = [];
          watched = [];
          if (!fs.existsSync(path.join(this.source_dir, "/_data/".concat(type, "s.json")))) {
            log.info("Can't find bilibili ".concat(type, " data, please use 'hexo ").concat(type, " -u' command to get data"));
          } else {
            // extra bangumis
            _JSON$parse = JSON.parse(fs.readFileSync(path.join(this.source_dir, "/_data/".concat(type, "s.json"))));
            wantWatch = _JSON$parse.wantWatch;
            watching = _JSON$parse.watching;
            watched = _JSON$parse.watched;
            if (fs.existsSync(path.join(this.source_dir, "/_data/extra_".concat(type, "s.json")))) {
              log.info("Found extra ".concat(type, "s data"));
              _JSON$parse2 = JSON.parse(fs.readFileSync(path.join(this.source_dir, "/_data/extra_".concat(type, "s.json")))), wantWatchExtra = _JSON$parse2.wantWatchExtra, watchingExtra = _JSON$parse2.watchingExtra, watchedExtra = _JSON$parse2.watchedExtra;
              if (wantWatchExtra) {
                if (config[type].extraOrder === 1) {
                  wantWatch = [].concat((0, _toConsumableArray2["default"])(wantWatchExtra), (0, _toConsumableArray2["default"])(wantWatch));
                } else {
                  wantWatch = [].concat((0, _toConsumableArray2["default"])(wantWatch), (0, _toConsumableArray2["default"])(wantWatchExtra));
                }
              }
              if (watchingExtra) {
                if (config[type].extraOrder === 1) {
                  watching = [].concat((0, _toConsumableArray2["default"])(watchingExtra), (0, _toConsumableArray2["default"])(watching));
                } else {
                  watching = [].concat((0, _toConsumableArray2["default"])(watching), (0, _toConsumableArray2["default"])(watchingExtra));
                }
              }
              if (watchedExtra) {
                if (config[type].extraOrder === 1) {
                  watched = [].concat((0, _toConsumableArray2["default"])(watchedExtra), (0, _toConsumableArray2["default"])(watched));
                } else {
                  watched = [].concat((0, _toConsumableArray2["default"])(watched), (0, _toConsumableArray2["default"])(watchedExtra));
                }
              }
            }
            log.info("".concat(wantWatch.length + watching.length + watched.length, " ").concat(type, "s have been loaded"));
          }

          // eslint-disable-next-line no-underscore-dangle
          __ = i18n.__(config.language);
          TEMPLATE_MAP = {
            bili: 'bili-template.pug',
            bgmv0: 'bgmv0-template.pug',
            bgm: 'bgm-template.pug',
            bangumi: 'bgm-template.pug',
            anilist: 'anilist-template.pug',
            simkl: 'simkl-template.pug'
          };
          _context.next = 2;
          return pug.renderFile(path.join(__dirname, 'templates/bangumi.pug'), {
            quote: config[type].quote,
            show: config[type].show || 1,
            // loading: config[type].loading,
            metaColor: config[type].metaColor,
            color: config[type].color,
            lazyload: (_config$type$lazyload = config[type].lazyload) !== null && _config$type$lazyload !== void 0 ? _config$type$lazyload : true,
            // lazyloadAttrName: config[type].lazyloadAttrName,
            srcValue: config[type].srcValue || '__image__',
            source: (_config$type$source = config[type].source) !== null && _config$type$source !== void 0 ? _config$type$source : 'bili',
            showMyComment: (_config$type$showMyCo = config[type].showMyComment) !== null && _config$type$showMyCo !== void 0 ? _config$type$showMyCo : false,
            pagination: (_config$type$paginati = config[type].pagination) !== null && _config$type$paginati !== void 0 ? _config$type$paginati : false,
            progressBar: (_config$type$progress = config[type].progressBar) !== null && _config$type$progress !== void 0 ? _config$type$progress : true,
            theme: fs.existsSync(path.join(__dirname, "templates/theme/".concat(config.theme, ".min.css"))) ? config.theme : null,
            pugTemplate: config[type].pagination ? fs.readFileSync(path.join(__dirname, "templates/".concat(TEMPLATE_MAP[config[type].source]))).toString().replace('.bangumi-item', '.bangumi-item.bangumi-hide')
            // .replace(/=\s*?__\('(.+?)'\)/g, (match, key) => ` ${__(key)}`)
            .replace(/__\('(.+?)'\)/g, function (match, key) {
              return "('".concat(__(key), "')");
            }) : '',
            wantWatch: ['score', '-score'].includes(config[type].order) ? wantWatch.sort(function (a, b) {
              return config[type].order === 'score' ? a.score - b.score : b.score - a.score;
            }) : wantWatch,
            watched: ['score', '-score'].includes(config[type].order) ? watched.sort(function (a, b) {
              return config[type].order === 'score' ? a.score - b.score : b.score - a.score;
            }) : watched,
            watching: ['score', '-score'].includes(config[type].order) ? watching.sort(function (a, b) {
              return config[type].order === 'score' ? a.score - b.score : b.score - a.score;
            }) : watching,
            type: type,
            __: __,
            root: root,
            basedir: process.cwd()
          }, {
            async: false
          });
        case 2:
          contents = _context.sent;
          customPath = config[type].path || "".concat(type, "s/index.html");
          return _context.abrupt("return", {
            path: customPath,
            data: _objectSpread({
              title: config[type].title,
              content: contents,
              type: 'page',
              permalink: full_url_for(customPath)
            }, config === null || config === void 0 || (_config$type2 = config[type]) === null || _config$type2 === void 0 ? void 0 : _config$type2.extra_options),
            layout: ['page', 'post']
          });
        case 3:
        case "end":
          return _context.stop();
      }
    }, _callee, this);
  }));
  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();