/*
 * @Author       : HCLonely
 * @Date         : 2024-09-11 15:40:57
 * @LastEditTime : 2025-07-10 14:01:12
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/src/index.js
 * @Description  : Hexo插件主入口文件，提供了bangumi、cinema和game三个命令，
 *                 用于生成和管理番剧、影视和游戏页面。支持从多个数据源获取数据，
 *                 包括bilibili、bangumi.tv和AniList等，并提供数据更新和删除功能。
 */

const fs = require('hexo-fs');
const path = require('path');
const hexoLog = require('hexo-log');

/**
 * @constant {Object} log - 统一的日志记录器实例
 * @description 配置了统一的日志输出工具
 */
const log = (typeof hexoLog.default === 'function' ? hexoLog.default : hexoLog)({
  debug: false,
  silent: false
});

const { getBiliData } = require('./lib/get-bili-data');
const { getBgmData } = require('./lib/get-bgm-data');
const { getBgmv0Data } = require('./lib/get-bgmv0-data');
const { getAnilistData } = require('./lib/get-anilist-data');
const { getSimklData } = require('./lib/get-simkl-data');

if (typeof URL !== 'function') {
  const { URL } = require('url');
  global.URL = URL;
}

/**
 * @constant {Object} COMMAND_OPTIONS - 命令行选项配置
 * @property {Array<Object>} options - 可用的命令行选项列表
 */
const COMMAND_OPTIONS = {
  options: [
    { name: '-u, --update', desc: 'Update data' },
    { name: '-d, --delete', desc: 'Delete data' }
  ]
};

/**
 * @constant {Object} DATA_TYPES - 数据类型配置对象
 * @property {Object} bangumi - 番剧相关配置
 * @property {Object} cinema - 影视相关配置
 * @property {Object} game - 游戏相关配置
 */
const DATA_TYPES = {
  bangumi: {
    jsonFile: 'bangumis.json',
    configKey: 'bangumi'
  },
  cinema: {
    jsonFile: 'cinemas.json',
    configKey: 'cinema'
  },
  game: {
    jsonFile: 'games.json',
    configKey: 'game'
  }
};

/**
 * @description 注册页面生成器
 * 为每种数据类型（bangumi、cinema、game）注册对应的页面生成器
 */
Object.entries(DATA_TYPES).forEach(([type, config]) => {
  hexo.extend.generator.register(`bangumis-${type}`, function (locals) {
    if (!this?.config?.[config.configKey]?.enable) {
      return;
    }
    return require('./lib/bangumi-generator').call(this, locals, type);
  });
});

/**
 * @function validateConfig
 * @param {Object} config - 配置对象
 * @returns {boolean} 配置是否有效
 * @description 验证配置对象是否包含必要的字段和值
 */
const validateConfig = (config) => {
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

/**
 * @function handleDataDelete
 * @param {string} sourceDir - 源目录路径
 * @param {string} type - 数据类型（bangumi/cinema/game）
 * @description 处理数据删除操作，删除指定类型的JSON数据文件
 */
const handleDataDelete = (sourceDir, type) => {
  const jsonPath = path.join(sourceDir, `/_data/${DATA_TYPES[type].jsonFile}`);
  if (fs.existsSync(jsonPath)) {
    fs.unlinkSync(jsonPath);
    log.info(`${type} data has been deleted`);
  }
};

/**
 * @function handleDataUpdate
 * @async
 * @param {Object} config - 更新配置
 * @param {string} type - 数据类型
 * @param {string} sourceDir - 源目录路径
 * @param {Object} args - 命令行参数
 * @returns {Promise} 更新操作的Promise
 * @description 根据不同的数据源处理数据更新操作
 */
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
        host: `${config.source}.tv`
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

/**
 * @description 注册命令
 * 为每种数据类型注册对应的命令，支持更新(-u)和删除(-d)操作
 */
Object.entries(DATA_TYPES).forEach(([type, config]) => {
  hexo.extend.console.register(type, `Generate pages of ${type} for Hexo`, COMMAND_OPTIONS, function (args) {
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
