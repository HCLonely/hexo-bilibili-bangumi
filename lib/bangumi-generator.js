'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var ejs = require('ejs');

var path = require('path');

var _require = require('./util'),
    i18n = _require.i18n;

var fs = require('hexo-fs');

var log = require('hexo-log')({
  debug: false,
  silent: false
});

module.exports = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(locals) {
    var _config$type, _config$type$lazyload, _config$type$source, _config$type2;

    var type,
        config,
        root,
        wantWatch,
        watching,
        watched,
        _JSON$parse,
        wantWatchExtra,
        watchingExtra,
        watchedExtra,
        _JSON$parse2,
        __,
        contents,
        customPath,
        _args = arguments;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            type = _args.length > 1 && _args[1] !== undefined ? _args[1] : 'bangumi';
            config = this.config;

            if (config !== null && config !== void 0 && (_config$type = config[type]) !== null && _config$type !== void 0 && _config$type.enable) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return");

          case 4:
            root = config.root;

            if (root.endsWith('/')) {
              root = root.slice(0, root.length - 1);
            }

            wantWatch = [];
            watching = [];
            watched = []; // console.log(path.join(this.source_dir, '/_data/bangumis.json'))

            if (!fs.existsSync(path.join(this.source_dir, "/_data/".concat(type, "s.json")))) {
              log.info("Can't find bilibili ".concat(type, " data, please use 'hexo ").concat(type, " -u' command to get data"));
            } else {
              _JSON$parse = JSON.parse(fs.readFileSync(path.join(this.source_dir, "/_data/".concat(type, "s.json"))));
              wantWatch = _JSON$parse.wantWatch;
              watching = _JSON$parse.watching;
              watched = _JSON$parse.watched;

              // extra bangumis
              // console.log(path.join(this.source_dir, '/_data/extra_' + type + 's.json'))
              if (fs.existsSync(path.join(this.source_dir, "/_data/extra_".concat(type, "s.json")))) {
                log.info("Found extra ".concat(type, "s data"));
                wantWatchExtra = [];
                watchingExtra = [];
                watchedExtra = [];
                _JSON$parse2 = JSON.parse(fs.readFileSync(path.join(this.source_dir, "/_data/extra_".concat(type, "s.json"))));
                wantWatchExtra = _JSON$parse2.wantWatchExtra;
                watchingExtra = _JSON$parse2.watchingExtra;
                watchedExtra = _JSON$parse2.watchedExtra;

                if (wantWatchExtra) {
                  wantWatch = wantWatch.concat(wantWatchExtra);
                }

                if (watchingExtra) {
                  watching = watching.concat(watchingExtra);
                }

                if (watchedExtra) {
                  watched = watched.concat(watchedExtra);
                }
              }

              log.info("".concat(wantWatch.length + watching.length + watched.length, " ").concat(type, "s have been loaded"));
            } // eslint-disable-next-line no-underscore-dangle


            __ = i18n.__(config.language);
            _context.next = 13;
            return ejs.renderFile(path.join(__dirname, 'templates/bangumi.ejs'), {
              quote: config[type].quote,
              show: config[type].show || 1,
              loading: config[type].loading,
              metaColor: config[type].metaColor ? "style=\"color:".concat(config[type].metaColor, "\"") : '',
              color: config[type].color ? "style=\"color:".concat(config[type].color, "\"") : '',
              lazyload: (_config$type$lazyload = config[type].lazyload) !== null && _config$type$lazyload !== void 0 ? _config$type$lazyload : true,
              source: (_config$type$source = config[type].source) !== null && _config$type$source !== void 0 ? _config$type$source : 'bili',
              wantWatch: wantWatch,
              watched: watched,
              watching: watching,
              type: type,
              __: __,
              root: root
            }, {
              async: false
            });

          case 13:
            contents = _context.sent;
            customPath = config[type].path;
            return _context.abrupt("return", {
              path: customPath || "".concat(type, "s/index.html"),
              data: _objectSpread({
                title: config[type].title,
                content: contents
              }, config === null || config === void 0 ? void 0 : (_config$type2 = config[type]) === null || _config$type2 === void 0 ? void 0 : _config$type2.extra_options),
              layout: ['page', 'post']
            });

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
