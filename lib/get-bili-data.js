const fs = require('hexo-fs');
const path = require('path');
const axios = require('axios');
const hexoLog = require('hexo-log');
const ProgressBar = require('progress');
const CONSTANTS = {
  STATUS_MAP: {
    1: '[想看]',
    2: '[在看]',
    3: '[已看]'
  },
  TYPE_MAP: {
    1: '番剧',
    2: '追剧'
  },
  NUMBERS: {
    TEN_THOUSAND: 10000,
    HUNDRED_MILLION: 100000000
  },
  API: {
    BASE_URL: 'https://api.bilibili.com/x/space/bangumi/follow/list',
    PAGE_SIZE: 24
  },
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};
const log = typeof hexoLog.default === 'function' ? hexoLog.default({
  debug: false,
  silent: false
}) : hexoLog({
  debug: false,
  silent: false
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function withRetry(apiCall, retries = CONSTANTS.MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(CONSTANTS.RETRY_DELAY);
      log.warn(`请求失败，正在进行第${i + 1}次重试...`);
    }
  }
}
const getDataPage = async (vmid, status, typeNum) => {
  const response = await withRetry(() => axios.get(`${CONSTANTS.API.BASE_URL}?playform=web&type=${typeNum}&follow_status=${status}&vmid=${vmid}&ps=1&pn=1`));
  if (response?.data?.code === 0 && response?.data?.message === 'OK' && response?.data?.data?.total !== undefined) {
    return {
      success: true,
      data: Math.ceil(response.data.data.total / CONSTANTS.API.PAGE_SIZE) + 1
    };
  }
  return {
    success: false,
    data: response?.data?.message || '获取数据失败'
  };
};
const formatNumber = num => {
  if (!num) return '-';
  if (num > CONSTANTS.NUMBERS.HUNDRED_MILLION) {
    return `${(num / CONSTANTS.NUMBERS.HUNDRED_MILLION).toFixed(1)} 亿`;
  }
  if (num > CONSTANTS.NUMBERS.TEN_THOUSAND) {
    return `${(num / CONSTANTS.NUMBERS.TEN_THOUSAND).toFixed(1)} 万`;
  }
  return num.toString();
};
const formatTotal = (count, typeNum) => {
  if (!count) return '-';
  if (count === -1) return '未完结';
  const unit = typeNum === 1 ? '话' : '集';
  return `全${count}${unit}`;
};
const getData = async (vmid, status, useWebp, typeNum, pn, coverMirror, SESSDATA) => {
  const response = await withRetry(() => axios({
    method: 'GET',
    url: `${CONSTANTS.API.BASE_URL}?playform=web&type=${typeNum}&follow_status=${status}&vmid=${vmid}&ps=${CONSTANTS.API.PAGE_SIZE}&pn=${pn}`,
    headers: {
      Cookie: SESSDATA ? `SESSDATA=${SESSDATA};` : null
    }
  }));
  if (response?.data?.code !== 0) {
    throw new Error(`获取数据失败: ${response?.data?.message || '未知错误'}`);
  }
  return (response?.data?.data?.list || []).map(bangumi => {
    let cover = bangumi?.cover;
    if (cover) {
      const href = new URL(cover);
      href.protocol = 'https';
      if (useWebp) href.pathname += '@220w_280h.webp';
      cover = `${coverMirror}${href.href}`;
    }
    return {
      title: bangumi?.title,
      type: bangumi?.season_type_name,
      area: bangumi?.areas?.[0]?.name,
      cover,
      totalCount: formatTotal(bangumi?.total_count, typeNum),
      id: bangumi?.media_id,
      follow: formatNumber(bangumi?.stat?.follow),
      view: formatNumber(bangumi?.stat?.view),
      danmaku: formatNumber(bangumi?.stat?.danmaku),
      coin: formatNumber(bangumi?.stat?.coin),
      score: bangumi?.rating?.score ?? '-',
      des: bangumi?.evaluate,
      progress: !SESSDATA ? false : Math.round((parseInt(bangumi?.progress.match(/\d+/)?.[0] || '0', 10) || 0) / (bangumi?.total_count > 0 ? bangumi.total_count : bangumi.new_ep?.title || 1) * 100),
      ep_status: !SESSDATA ? false : parseInt(bangumi?.progress.match(/\d+/)?.[0] || '0', 10) || 0,
      new_ep: bangumi?.total_count > 0 ? bangumi.total_count : bangumi.new_ep?.title || -1
    };
  });
};
const processData = async (vmid, status, useWebp, showProgress, typeNum, coverMirror, SESSDATA) => {
  const page = await getDataPage(vmid, status, typeNum);
  if (page?.success) {
    const list = [];
    let bar = null;
    if (showProgress) {
      const statusText = CONSTANTS.STATUS_MAP[status] || '[未知]';
      const typeText = CONSTANTS.TYPE_MAP[typeNum] || '未知';
      bar = new ProgressBar(`正在获取 ${statusText} ${typeText} [:bar] :percent :elapseds`, {
        total: page.data - 1,
        complete: '█'
      });
    }
    for (let i = 1; i < page.data; i++) {
      if (showProgress) bar.tick();
      const data = await getData(vmid, status, useWebp, typeNum, i, coverMirror, SESSDATA);
      list.push(...data);
    }
    return list;
  }
  log.error(`Get ${typeNum === 1 ? 'bangumi' : 'cinema'} data error:`, page?.data);
  return [];
};
const saveDataToFile = (filePath, data, type) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
    log.info(`Bilibili ${type} data has been saved to ${filePath}`);
  } catch (err) {
    log.error(`Failed to write data to ${filePath}`);
    console.error(err);
    throw err;
  }
};
const mergeExtraData = (original, extra, extraOrder) => {
  const result = {
    ...original
  };
  const categories = ['wantWatch', 'watching', 'watched'];
  categories.forEach(category => {
    const extraData = extra[`${category}Extra`];
    if (extraData) {
      result[category] = extraOrder === 1 ? [...extraData, ...result[category]] : [...result[category], ...extraData];
    }
  });
  return result;
};
module.exports.getBiliData = async ({
  vmid,
  type,
  showProgress,
  sourceDir,
  extraOrder,
  pagination,
  useWebp = true,
  coverMirror,
  SESSDATA
}) => {
  try {
    const typeNum = type === 'cinema' ? 2 : 1;
    log.info(`Getting bilibili ${type}, please wait...`);
    const startTime = new Date().getTime();
    const wantWatch = await processData(vmid, 1, useWebp, showProgress, typeNum, coverMirror, SESSDATA);
    const watching = await processData(vmid, 2, useWebp, showProgress, typeNum, coverMirror, SESSDATA);
    const watched = await processData(vmid, 3, useWebp, showProgress, typeNum, coverMirror, SESSDATA);
    const endTime = new Date().getTime();
    log.info(`${wantWatch.length + watching.length + watched.length} ${type}s have been loaded in ${endTime - startTime} ms`);
    const bangumis = {
      wantWatch,
      watching,
      watched
    };
    const dataDir = path.join(sourceDir, '/_data/');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, {
        recursive: true
      });
    }
    saveDataToFile(path.join(dataDir, `${type}s.json`), bangumis, type);
    if (pagination) {
      let allBangumis = {
        ...bangumis
      };
      const extraPath = path.join(dataDir, `extra_${type}s.json`);
      if (fs.existsSync(extraPath)) {
        try {
          const extraData = JSON.parse(fs.readFileSync(extraPath, 'utf8'));
          allBangumis = mergeExtraData(allBangumis, extraData, extraOrder);
        } catch (error) {
          log.error(`Failed to parse extra data from ${extraPath}`);
          console.error(error);
        }
      }
      saveDataToFile(path.join(sourceDir, `${type}s.json`), allBangumis, `${type} (with extras)`);
    }
  } catch (error) {
    log.error(`Failed to get bilibili ${type} data`);
    console.error(error);
    throw error;
  }
};