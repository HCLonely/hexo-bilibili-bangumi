'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var ejs = require('ejs');

var path = require('path');

var i18n = require('./util').i18n;

var fs = require('hexo-fs');

var log = require('hexo-log')({
  debug: false,
  silent: false
});

module.exports = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(locals) {
    var _config$bangumi;

    var config, root, wantWatch, watching, watched, _JSON$parse, __, contents;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            config = this.config;

            if (config === null || config === void 0 ? void 0 : (_config$bangumi = config.bangumi) === null || _config$bangumi === void 0 ? void 0 : _config$bangumi.enable) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return");

          case 3:
            root = config.root;

            if (root.endsWith('/')) {
              root = root.slice(0, root.length - 1);
            }

            wantWatch = [];
            watching = [];
            watched = [];
            console.log(path.join(this.source_dir, '/_data/bangumis.json'));

            if (!fs.existsSync(path.join(this.source_dir, '/_data/bangumis.json'))) {
              log.info('Can\'t find bilibili bangumi data, please use \'hexo bangumi -u\' command to get data');
            } else {
              _JSON$parse = JSON.parse(fs.readFileSync(path.join(this.source_dir, '/_data/bangumis.json')));
              wantWatch = _JSON$parse.wantWatch;
              watching = _JSON$parse.watching;
              watched = _JSON$parse.watched;
              log.info(wantWatch.length + watching.length + watched.length + ' bangumis have been loaded');
            }

            __ = i18n.__(config.language);
            contents = ejs.renderFile(path.join(__dirname, 'templates/bangumi.ejs'), {
              quote: config.bangumi.quote,
              show: config.bangumi.show || 1,
              loading: config.bangumi.loading,
              metaColor: config.bangumi.metaColor ? "style=\"color:".concat(config.bangumi.metaColor, "\"") : '',
              color: config.bangumi.color ? "style=\"color:".concat(config.bangumi.color, "\"") : '',
              wantWatch: wantWatch,
              watched: watched,
              watching: watching,
              __: __,
              root: root
            }, function (err, result) {
              if (err) console.log(err);
              return result;
            });
            return _context.abrupt("return", {
              path: config.bangumi.path || 'bangumis/index.html',
              data: {
                title: config.bangumi.title,
                content: contents
              },
              layout: ['page', 'post']
            });

          case 13:
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
