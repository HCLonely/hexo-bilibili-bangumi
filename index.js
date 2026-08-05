const fs = require('hexo-fs');
const path = require('path');
const hexoLog = require('hexo-log');
const log = (typeof hexoLog.default === 'function' ? hexoLog.default : hexoLog)({
  debug: false,
  silent: false
});
const {
  getBiliData
} = require('./lib/get-bili-data');
const {
  getBgmData
} = require('./lib/get-bgm-data');
const {
  getBgmv0Data
} = require('./lib/get-bgmv0-data');
const {
  getAnilistData
} = require('./lib/get-anilist-data');
const {
  getSimklData
} = require('./lib/get-simkl-data');
const {
  hoistBangumiAssets
} = require('./lib/asset-hoist');
if (typeof URL !== 'function') {
  const {
    URL
  } = require('url');
  global.URL = URL;
}
const COMMAND_OPTIONS = {
  options: [{
    name: '-u, --update',
    desc: 'Update data'
  }, {
    name: '-d, --delete',
    desc: 'Delete data'
  }]
};
const DATA_TYPES = {
  bangumi: {
    jsonFile: 'bangumis.json',
    configKey: 'bangumi',
    alias: 'bgm'
  },
  cinema: {
    jsonFile: 'cinemas.json',
    configKey: 'cinema',
    alias: 'cnm'
  },
  game: {
    jsonFile: 'games.json',
    configKey: 'game',
    alias: 'gm'
  }
};
Object.entries(DATA_TYPES).forEach(([type, config]) => {
  hexo.extend.generator.register(`bangumis-${type}`, function (locals) {
    if (!this?.config?.[config.configKey]?.enable) {
      return;
    }
    return require('./lib/bangumi-generator').call(this, locals, type);
  });
});
hexo.extend.filter.register('after_render:html', html => hoistBangumiAssets(html));
hexo.extend.filter.register('after_post_render', data => {
  if (data.path.split('.').at(-1) === 'json') {
    data.content = data._content;
  }
  return data;
}, 11);
const validateConfig = config => {
  if (!config) {
    log.info('Please add config to _config.yml');
    return false;
  }
  if (!config.enable) {
    return false;
  }
  if (!config.vmid) {
    log.info('Please add vmid to _config.yml');
    return false;
  }
  return true;
};
const handleDataDelete = (sourceDir, type) => {
  const jsonPath = path.join(sourceDir, `/_data/${DATA_TYPES[type].jsonFile}`);
  if (fs.existsSync(jsonPath)) {
    fs.unlinkSync(jsonPath);
    log.info(`${type} data has been deleted`);
  }
};
const handleDataUpdate = async function (config, type, sourceDir, args) {
  const baseConfig = {
    vmid: config.vmid,
    showProgress: config.progress ?? true,
    sourceDir,
    extraOrder: config.extraOrder,
    pagination: config.pagination,
    coverMirror: config.coverMirror ?? ''
  };
  switch (config.source) {
    case 'bgm':
    case 'bangumi':
      return getBgmData({
        ...baseConfig,
        type,
        proxy: config.proxy,
        infoApi: config.bgmInfoApi,
        host: `${config.source}.tv`,
        skipNsfw: config.skipNsfw ?? false
      });
    case 'bgmv0':
      {
        const typeMapping = {
          bangumi: 2,
          cinema: 6,
          game: 4
        };
        return getBgmv0Data({
          ...baseConfig,
          type: typeMapping[type],
          proxy: config.proxy
        });
      }
    case 'anilist':
      if (type === 'bangumi') {
        return getAnilistData({
          ...baseConfig,
          type: 'ANIME'
        });
      }
      log.info(`${config.source} not support for ${type}`);
      return;
    case 'simkl':
      return getSimklData({
        ...baseConfig,
        type
      });
    default:
      return getBiliData({
        ...baseConfig,
        type,
        useWebp: config.webp,
        SESSDATA: typeof args.u === 'string' ? args.u : null
      });
  }
};
Object.entries(DATA_TYPES).forEach(([type, config]) => {
  const options = {
    alias: config.alias,
    ...COMMAND_OPTIONS
  };
  hexo.extend.console.register(type, `Generate pages of ${type} for Hexo`, options, function (args) {
    if (args.d) {
      handleDataDelete(this.source_dir, type);
    } else if (args.u) {
      const typeConfig = this.config[config.configKey];
      if (!validateConfig(typeConfig)) {
        return;
      }
      if (type === 'game' && typeConfig.source !== 'bgmv0') {
        log.info(`${typeConfig.source} not support for game`);
        return;
      }
      handleDataUpdate(typeConfig, type, this.source_dir, args);
    } else {
      log.info(`Unknown command, please use "hexo ${type} -h" to see the available commands`);
    }
  });
});