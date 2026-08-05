const fs = require('hexo-fs');
const path = require('path');
const axios = require('axios');
const hexoLog = require('hexo-log');
const SIMKL_API = 'https://api.simkl.com';
const CACHE_DIR = '_data';
const CACHE_FILE = 'bangumis.json';
const EXTRA_CACHE_FILE = 'extra_bangumis.json';
const USER_AGENT = 'HCLonely/hexo-bilibili-bangumi';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const STATUS_MAP = {
  plantowatch: 'wantWatch',
  watching: 'watching',
  completed: 'watched'
};
const log = typeof hexoLog.default === 'function' ? hexoLog.default({
  debug: false,
  silent: false
}) : hexoLog({
  debug: false,
  silent: false
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
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
  progress: Math.round(bangumi.watched_episodes_count / (bangumi.total_episodes_count || 1) * 100),
  ep_status: bangumi.watched_episodes_count,
  new_ep: bangumi.total_episodes_count
});
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
      animeList.forEach(bangumi => {
        $data[mappedStatus].push(formatBangumiData(bangumi, coverMirror));
      });
    } catch (error) {
      log.error(`获取SIMKL ${status}数据失败: ${error.message}`);
      throw error;
    }
  }
  return $data;
};
const ensureDataDir = (sourceDir, dataDir = CACHE_DIR) => {
  const dir = path.join(sourceDir, dataDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return dir;
};
const writeDataToFile = (filePath, data, errorMsg, successMsg) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
    log.info(successMsg);
  } catch (err) {
    log.error(errorMsg);
    console.error(err);
  }
};
const mergeExtraData = (bangumis, extras, order) => {
  const result = {
    ...bangumis
  };
  const {
    wantWatchExtra,
    watchingExtra,
    watchedExtra
  } = extras;
  ['wantWatch', 'watching', 'watched'].forEach(key => {
    const extra = {
      wantWatch: wantWatchExtra,
      watching: watchingExtra,
      watched: watchedExtra
    }[key];
    if (extra) {
      result[key] = order === 1 ? [...extra, ...result[key]] : [...result[key], ...extra];
    }
  });
  return result;
};
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
    const bangumis = await getData({
      token,
      clientId
    }, coverMirror, type);
    const totalCount = Object.values(bangumis).reduce((sum, arr) => sum + arr.length, 0);
    const endTime = new Date().getTime();
    log.info(`${totalCount} bangumis have been loaded in ${endTime - startTime} ms`);
    ensureDataDir(sourceDir);
    const mainDataPath = path.join(sourceDir, `/${CACHE_DIR}/${CACHE_FILE}`);
    writeDataToFile(mainDataPath, bangumis, 'Failed to write data to _data/bangumis.json', 'SIMKL bangumis data has been saved');
    if (pagination) {
      let allBangumis = {
        ...bangumis
      };
      const extraDataPath = path.join(sourceDir, `/${CACHE_DIR}/${EXTRA_CACHE_FILE}`);
      if (fs.existsSync(extraDataPath)) {
        const extraData = JSON.parse(fs.readFileSync(extraDataPath));
        allBangumis = mergeExtraData(allBangumis, extraData, extraOrder);
      }
      const paginationPath = path.join(sourceDir, '/bangumis.json');
      writeDataToFile(paginationPath, allBangumis, 'Failed to write data to bangumis.json', 'SIMKL bangumis data (with extras) has been saved');
    }
  } catch (error) {
    log.error(`获取SIMKL数据失败: ${error.message}`);
    throw error;
  }
};