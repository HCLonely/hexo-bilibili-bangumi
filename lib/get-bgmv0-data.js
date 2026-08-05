const fs = require('hexo-fs');
const path = require('path');
const axios = require('axios');
const hexoLog = require('hexo-log');
const ProgressBar = require('progress');
const CONSTANTS = {
  TYPE: {
    1: '书籍',
    2: '动画',
    3: '音乐',
    4: '游戏',
    6: '三次元'
  },
  TYPE_EN: {
    1: 'book',
    2: 'bangumi',
    3: 'music',
    4: 'game',
    6: 'cinema'
  },
  TYPE_STATUS: {
    1: ['[想看]', '[已看]', '[在看]'],
    2: ['[想看]', '[已看]', '[在看]'],
    3: 'music',
    4: ['[想玩]', '[已玩]', '[在玩]'],
    6: ['[想看]', '[已看]', '[在看]']
  },
  API: {
    BASE_URL: 'http://api.bgm.tv/v0',
    PAGE_SIZE: 30,
    USER_AGENT: 'HCLonely/hexo-bilibili-bangumi'
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
  const response = await withRetry(() => axios.get(`${CONSTANTS.API.BASE_URL}/users/${vmid}/collections`, {
    params: {
      subject_type: typeNum,
      type: status,
      limit: 1,
      offset: 0
    },
    headers: {
      'User-Agent': CONSTANTS.API.USER_AGENT
    }
  }));
  if (typeof response?.data?.total !== 'undefined') {
    return {
      success: true,
      data: Math.ceil(response.data.total / CONSTANTS.API.PAGE_SIZE) + 1
    };
  }
  return {
    success: false,
    data: response?.data || '获取数据失败'
  };
};
const formatItemData = (bangumi, coverMirror) => ({
  title: bangumi?.subject?.name_cn || bangumi?.subject?.name,
  type: CONSTANTS.TYPE[bangumi?.subject_type || bangumi?.type] || '未知',
  cover: coverMirror + bangumi?.subject?.images?.common,
  totalCount: bangumi?.subject?.eps,
  id: bangumi?.subject_id || bangumi?.subject?.id,
  score: bangumi?.subject?.score ?? '-',
  des: bangumi?.subject?.short_summary ? `${bangumi.subject.short_summary.trim()}...` : '-',
  collect: bangumi?.subject?.collection_total ?? '-',
  myStars: bangumi?.rate || null,
  myComment: bangumi?.comment || null,
  progress: Math.round((bangumi?.ep_status || 0) / (bangumi?.subject?.eps || 1) * 100),
  tags: bangumi?.subject?.tags?.[0]?.name || '-',
  ep_status: bangumi?.ep_status || 0
});
const getData = async (vmid, status, typeNum, pn, coverMirror) => {
  const response = await withRetry(() => axios.get(`${CONSTANTS.API.BASE_URL}/users/${vmid}/collections`, {
    params: {
      subject_type: typeNum,
      type: status,
      limit: CONSTANTS.API.PAGE_SIZE,
      offset: pn
    },
    headers: {
      'User-Agent': CONSTANTS.API.USER_AGENT
    }
  }));
  if (response?.status !== 200) {
    throw new Error(`获取数据失败: HTTP ${response?.status}`);
  }
  return (response?.data?.data || []).map(item => formatItemData(item, coverMirror));
};
const saveDataToFile = (filePath, data, type) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
    log.info(`Bgm ${type} data has been saved to ${filePath}`);
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
const processData = async (vmid, status, showProgress, typeNum, coverMirror) => {
  const page = await getDataPage(vmid, status, typeNum);
  if (!page?.success) {
    log.error(`Get ${CONSTANTS.TYPE_EN[typeNum]} data error:`, page?.data);
    return [];
  }
  const list = [];
  let bar = null;
  if (showProgress) {
    const statusText = CONSTANTS.TYPE_STATUS[typeNum][status - 1];
    const typeText = CONSTANTS.TYPE[typeNum];
    bar = new ProgressBar(`正在获取 ${statusText} ${typeText} [:bar] :percent :elapseds`, {
      total: page.data - 1,
      complete: '█'
    });
  }
  try {
    for (let i = 1; i < page.data; i++) {
      if (showProgress) bar.tick();
      const data = await getData(vmid, status, typeNum, (i - 1) * CONSTANTS.API.PAGE_SIZE, coverMirror);
      list.push(...data);
    }
    return list;
  } catch (error) {
    log.error(`处理数据时发生错误: ${error.message}`);
    return [];
  }
};
module.exports.getBgmv0Data = async ({
  vmid,
  type,
  showProgress,
  sourceDir,
  extraOrder,
  pagination,
  coverMirror
}) => {
  try {
    log.info(`Getting bgm ${CONSTANTS.TYPE_EN[type]} data, please wait...`);
    const startTime = new Date().getTime();
    const wantWatch = await processData(vmid, 1, showProgress, type, coverMirror);
    const watching = await processData(vmid, 3, showProgress, type, coverMirror);
    const watched = await processData(vmid, 2, showProgress, type, coverMirror);
    const endTime = new Date().getTime();
    log.info(`${wantWatch.length + watching.length + watched.length} ${CONSTANTS.TYPE_EN[type]}s have been loaded in ${endTime - startTime} ms`);
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
    saveDataToFile(path.join(dataDir, `${CONSTANTS.TYPE_EN[type]}s.json`), bangumis, CONSTANTS.TYPE_EN[type]);
    if (pagination) {
      let allBangumis = {
        ...bangumis
      };
      const extraPath = path.join(dataDir, `extra_${CONSTANTS.TYPE_EN[type]}s.json`);
      if (fs.existsSync(extraPath)) {
        try {
          const extraData = JSON.parse(fs.readFileSync(extraPath, 'utf8'));
          allBangumis = mergeExtraData(allBangumis, extraData, extraOrder);
        } catch (error) {
          log.error(`Failed to parse extra data from ${extraPath}`);
          console.error(error);
        }
      }
      saveDataToFile(path.join(sourceDir, `${CONSTANTS.TYPE_EN[type]}s.json`), allBangumis, `${CONSTANTS.TYPE_EN[type]} (with extras)`);
    }
  } catch (error) {
    log.error(`Failed to get bgm ${CONSTANTS.TYPE_EN[type]} data`);
    console.error(error);
    throw error;
  }
};