/*
 * @Author       : HCLonely
 * @Date         : 2025-07-10 12:31:47
 * @LastEditTime : 2025-07-10 15:05:14
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/src/lib/get-simkl-data.js
 * @Description  : SIMKL数据获取模块，通过REST API获取用户的动画收藏数据。
 *                 支持获取观看中、计划观看、已完成三种状态的动画数据，
 *                 包含标题、封面、进度等信息。
 */

const fs = require('hexo-fs');
const path = require('path');
const axios = require('axios');
const hexoLog = require('hexo-log');

// 常量定义
const SIMKL_API = 'https://api.simkl.com';
const CACHE_DIR = '_data';
const CACHE_FILE = 'bangumis.json';
const EXTRA_CACHE_FILE = 'extra_bangumis.json';
const USER_AGENT = 'HCLonely/hexo-bilibili-bangumi';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// 状态映射
const STATUS_MAP = {
  plantowatch: 'wantWatch',
  watching: 'watching',
  completed: 'watched'
};

// 日志实例
const log = typeof hexoLog.default === 'function'
  ? hexoLog.default({ debug: false, silent: false })
  : hexoLog({ debug: false, silent: false });

/**
 * 延迟函数
 * @param {number} ms 延迟时间(毫秒)
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 带重试的API请求
 * @param {string} status 观看状态
 * @param {Object} config 配置信息
 * @param {number} retries 重试次数
 * @returns {Promise<Object>}
 */
const fetchWithRetry = async (status, config, type, retries = MAX_RETRIES) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `${SIMKL_API}/sync/all-items/${type}/${status}?memos=yes`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.token}`,
        'simkl-api-key': config.clientId,
        'User-Agent': USER_AGENT
      }
    });
    return response;
  } catch (error) {
    if (retries > 0) {
      await delay(RETRY_DELAY);
      return fetchWithRetry(status, config, type, retries - 1);
    }
    throw error;
  }
};

/**
 * 格式化番剧数据
 * @param {Object} bangumi 原始数据
 * @param {string} coverMirror 图片镜像
 * @returns {Object}
 */
const formatBangumiData = (bangumi, coverMirror) => ({
  title: bangumi.show?.title,
  type: bangumi.anime_type,
  cover: `${coverMirror}https://simkl.in/posters/${bangumi.show?.poster}_m.jpg`,
  totalCount: bangumi.total_episodes_count,
  id: bangumi.show?.ids?.simkl,
  des: bangumi.show?.ids?.wikien?.replaceAll('_', ' ') || bangumi.show?.ids?.wikijp || '-',
  year: bangumi.show?.year || '-',
  myStars: bangumi.user_rating,
  myComment: bangumi.memo?.text || '-',
  progress: Math.round((bangumi.watched_episodes_count / (bangumi.total_episodes_count || 1)) * 100),
  ep_status: bangumi.watched_episodes_count,
  new_ep: bangumi.total_episodes_count
});

/**
 * 获取SIMKL数据
 * @param {Object} config 配置信息
 * @param {string} coverMirror 图片镜像
 * @returns {Promise<Object>}
 */
const getData = async (config, coverMirror, type) => {
  const $data = {
    wantWatch: [],
    watching: [],
    watched: []
  };

  for (const status of ['plantowatch', 'watching', 'completed']) {
    try {
      const response = await fetchWithRetry(status, config, type);

      if (response?.status !== 200) {
        throw new Error(`API请求失败: ${response?.status}`);
      }

      const animeList = response?.data?.anime || [];
      const mappedStatus = STATUS_MAP[status];

      animeList.forEach((bangumi) => {
        $data[mappedStatus].push(formatBangumiData(bangumi, coverMirror));
      });
    } catch (error) {
      log.error(`获取SIMKL ${status}数据失败: ${error.message}`);
      throw error;
    }
  }

  return $data;
};

/**
 * 确保数据目录存在
 * @param {string} sourceDir 源目录
 * @param {string} dataDir 数据目录
 */
const ensureDataDir = (sourceDir, dataDir = CACHE_DIR) => {
  const dir = path.join(sourceDir, dataDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return dir;
};

/**
 * 写入数据到文件
 * @param {string} filePath 文件路径
 * @param {Object} data 数据
 * @param {string} errorMsg 错误信息
 * @param {string} successMsg 成功信息
 */
const writeDataToFile = (filePath, data, errorMsg, successMsg) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
    log.info(successMsg);
  } catch (err) {
    log.error(errorMsg);
    console.error(err);
  }
};

/**
 * 合并额外数据
 * @param {Object} bangumis 原数据
 * @param {Object} extras 额外数据
 * @param {number} order 顺序
 * @returns {Object}
 */
const mergeExtraData = (bangumis, extras, order) => {
  const result = { ...bangumis };
  const { wantWatchExtra, watchingExtra, watchedExtra } = extras;

  ['wantWatch', 'watching', 'watched'].forEach((key) => {
    const extra = {
      wantWatch: wantWatchExtra,
      watching: watchingExtra,
      watched: watchedExtra
    }[key];

    if (extra) {
      result[key] = order === 1
        ? [...extra, ...result[key]]
        : [...result[key], ...extra];
    }
  });

  return result;
};

/**
 * 获取SIMKL番剧数据
 * @param {Object} options 配置选项
 * @returns {Promise<void>}
 */
module.exports.getSimklData = async ({
  vmid,
  type,
  sourceDir,
  extraOrder,
  pagination,
  coverMirror
}) => {
  try {
    log.info('Getting SIMKL bangumi data, please wait...');
    const startTime = new Date().getTime();
    const [clientId, token] = vmid.split('-');

    // 获取数据
    const bangumis = await getData({ token, clientId }, coverMirror, type);
    const totalCount = Object.values(bangumis).reduce((sum, arr) => sum + arr.length, 0);

    const endTime = new Date().getTime();
    log.info(`${totalCount} bangumis have been loaded in ${endTime - startTime} ms`);

    // 确保数据目录存在
    ensureDataDir(sourceDir);

    // 写入主数据文件
    const mainDataPath = path.join(sourceDir, `/${CACHE_DIR}/${CACHE_FILE}`);
    writeDataToFile(
      mainDataPath,
      bangumis,
      'Failed to write data to _data/bangumis.json',
      'SIMKL bangumis data has been saved'
    );

    // 处理分页数据
    if (pagination) {
      let allBangumis = { ...bangumis };

      // 合并额外数据
      const extraDataPath = path.join(sourceDir, `/${CACHE_DIR}/${EXTRA_CACHE_FILE}`);
      if (fs.existsSync(extraDataPath)) {
        const extraData = JSON.parse(fs.readFileSync(extraDataPath));
        allBangumis = mergeExtraData(allBangumis, extraData, extraOrder);
      }

      // 写入分页数据
      const paginationPath = path.join(sourceDir, '/bangumis.json');
      writeDataToFile(
        paginationPath,
        allBangumis,
        'Failed to write data to bangumis.json',
        'SIMKL bangumis data (with extras) has been saved'
      );
    }
  } catch (error) {
    log.error(`获取SIMKL数据失败: ${error.message}`);
    throw error;
  }
};
