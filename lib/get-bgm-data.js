const fs = require('hexo-fs');
const path = require('path');
const axios = require('axios');
const hexoLog = require('hexo-log');
const ProgressBar = require('progress');
const cheerio = require('cheerio');
const tunnel = require('tunnel');
const bangumiData = require('bangumi-data');
const CONSTANTS = {
  TYPE: {
    1: '书籍',
    2: '动画',
    3: '音乐',
    4: '游戏',
    6: '三次元'
  },
  TYPE_PATH_MAP: {
    bangumi: 'anime',
    game: 'game',
    cinema: 'real'
  },
  STATUS_TEXT: {
    wish: '[想看]',
    do: '[在看]',
    collect: '[已看]'
  },
  TYPE_TEXT: {
    game: '游戏',
    real: '追剧',
    anime: '番剧',
    bangumi: '番剧'
  },
  API: {
    CDN_URL: 'https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Subject@master/data',
    BGM_API_URL: 'https://api.bgm.tv/v0/subjects',
    USER_AGENT: 'HCLonely/hexo-bilibili-bangumi (https://github.com/HCLonely/hexo-bilibili-bangumi)',
    BROWSER_USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36 Edg/97.0.1072.69'
  },
  CACHE: {
    SUBJECT_DIR: 'Bangumi-Subject-Cache',
    API_DIR: 'Bangumi-Api-Cache'
  },
  REQUEST_TIMEOUT: 30 * 1000
};
const log = typeof hexoLog.default === 'function' ? hexoLog.default({
  debug: false,
  silent: false
}) : hexoLog({
  debug: false,
  silent: false
});
const jp2cnName = name => bangumiData.items.find(item => item.title === name)?.titleTranslate?.['zh-Hans']?.[0] || name;
const createRequestConfig = (proxy, itemData = null) => {
  const config = {
    itemData,
    responseType: 'json',
    validateStatus: status => status >= 200 && status < 300 || status === 403,
    proxy: false,
    timeout: CONSTANTS.REQUEST_TIMEOUT
  };
  if (proxy?.host && proxy?.port) {
    config.httpsAgent = tunnel.httpsOverHttp({
      proxy,
      options: {
        rejectUnauthorized: false
      }
    });
  }
  return config;
};
const ensureCacheDir = (sourceDir, cacheDir) => {
  const cachePath = path.join(sourceDir, '/_data/', cacheDir);
  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, {
      recursive: true
    });
  }
  return cachePath;
};
const handleApiError = error => {
  if (error.response) {
    log.error('API Error:', error.response.status);
  } else {
    log.error('Error:', error.stack);
  }
};
const formatSubjectData = (data, config, coverMirror) => {
  const {
    id,
    name,
    type,
    image,
    rating = {},
    summary,
    collection = {},
    eps,
    epsLength,
    nsfw
  } = data;
  const totalCount = epsLength || eps?.length;
  return {
    id: id || config.itemData.id,
    title: jp2cnName(name || config.itemData.name),
    type: CONSTANTS.TYPE[type] || '未知',
    cover: coverMirror + image || config.itemData.cover,
    score: rating.score || '-',
    des: summary?.replace(/\r?\n/g, '').trim() || '-',
    wish: collection.wish || '-',
    doing: collection.doing || '-',
    collect: collection.collect || '-',
    totalCount: totalCount ? `全${totalCount}${type === 6 ? '集' : '话'}` : '-',
    myStars: config.itemData.myStars,
    myComment: config.itemData.myComment,
    nsfw
  };
};
const formatApiData = (data, config, coverMirror) => {
  const {
    id,
    name,
    name_cn,
    type,
    images: {
      common: image
    } = {},
    rating = {},
    summary,
    collection = {},
    eps,
    total_episodes,
    nsfw
  } = data;
  const totalCount = total_episodes || eps;
  return {
    id: id || config.itemData.id,
    title: name_cn || jp2cnName(name || config.itemData.name),
    type: CONSTANTS.TYPE[type] || '未知',
    cover: coverMirror + image || config.itemData.cover,
    score: rating.score || '-',
    des: summary?.replace(/\r?\n/g, '').trim() || '-',
    wish: collection.wish || '-',
    doing: collection.doing || '-',
    collect: collection.collect || '-',
    totalCount: totalCount ? `全${totalCount}${type === 6 ? '集' : '话'}` : '-',
    myStars: config.itemData.myStars,
    myComment: config.itemData.myComment,
    nsfw
  };
};
const getBangumiDataFromBangumiSubject = async (items, sourceDir, proxy, coverMirror) => {
  const cachePath = ensureCacheDir(sourceDir, CONSTANTS.CACHE.SUBJECT_DIR);
  const processItem = async item => {
    const subjectPath = path.join(cachePath, `${item.id}.json`);
    if (fs.existsSync(subjectPath)) {
      try {
        const cachedData = fs.readFileSync(subjectPath).toString();
        return {
          config: {
            itemData: item
          },
          data: cachedData,
          status: 200
        };
      } catch (error) {
        log.error(`Failed to read cache for item ${item.id}:`, error);
      }
    }
    try {
      const config = createRequestConfig(proxy, item);
      const folderNum = parseInt(parseInt(item.id, 10) / 100, 10);
      const response = await axios.get(`${CONSTANTS.API.CDN_URL}/${folderNum}/${item.id}.json`, config);
      return response;
    } catch (error) {
      handleApiError(error);
      return {
        config: {
          itemData: item
        },
        error
      };
    }
  };
  const results = await Promise.allSettled(items.map(processItem));
  return results.map(({
    value,
    reason
  }) => {
    const {
      config,
      data,
      status
    } = value || reason;
    if (reason || status === 403 || !data) {
      return {
        id: config?.itemData.id,
        title: jp2cnName(config.itemData.name),
        type: '未知',
        cover: config.itemData.cover,
        score: '-',
        des: '-',
        wish: '-',
        doing: '-',
        collect: '-',
        totalCount: '-'
      };
    }
    let bangumiData = data;
    if (typeof data === 'string') {
      try {
        bangumiData = JSON.parse(data.replace(/(?<!":|\/|\\)("[^":,\]}][^"]*?[^":])"(?!,|]|}|:)/g, '\\$1\\"'));
      } catch (e) {
        log.error(`Error parsing data for ID: ${config.itemData.id}:`, e);
        return null;
      }
    }
    const subjectPath = path.join(cachePath, `${config.itemData.id}.json`);
    if (!fs.existsSync(subjectPath) && bangumiData.id) {
      const cacheData = {
        id: bangumiData.id,
        name: bangumiData.name,
        type: bangumiData.type,
        image: bangumiData.image,
        rating: {
          score: bangumiData.rating?.score
        },
        summary: bangumiData.summary,
        collection: {
          wish: bangumiData.collection?.wish,
          doing: bangumiData.collection?.doing,
          collect: bangumiData.collection?.collect
        },
        epsLength: bangumiData.eps?.length
      };
      fs.writeFileSync(subjectPath, JSON.stringify(cacheData));
    }
    return formatSubjectData(bangumiData, config, coverMirror);
  }).filter(Boolean);
};
const getBangumiDataFromBangumiApi = async (items, sourceDir, proxy, coverMirror) => {
  const cachePath = ensureCacheDir(sourceDir, CONSTANTS.CACHE.API_DIR);
  const processItem = async item => {
    const subjectPath = path.join(cachePath, `${item.id}.json`);
    if (fs.existsSync(subjectPath)) {
      try {
        const cachedData = JSON.parse(fs.readFileSync(subjectPath).toString());
        return {
          config: {
            itemData: item
          },
          data: cachedData,
          status: 200
        };
      } catch (error) {
        log.error(`Failed to read cache for item ${item.id}:`, error);
      }
    }
    try {
      const config = createRequestConfig(proxy, item);
      config.headers = {
        'user-agent': CONSTANTS.API.USER_AGENT
      };
      const response = await axios.get(`${CONSTANTS.API.BGM_API_URL}/${item.id}`, config);
      return response;
    } catch (error) {
      handleApiError(error);
      return {
        config: {
          itemData: item
        },
        error
      };
    }
  };
  const results = await Promise.allSettled(items.map(processItem));
  return results.map(({
    value,
    reason
  }) => {
    const {
      config,
      data,
      status
    } = value || reason;
    if (reason || status === 403 || !data) {
      return {
        id: config.itemData.id,
        title: jp2cnName(config.itemData.name),
        type: '未知',
        cover: config.itemData.cover,
        score: '-',
        des: '-',
        wish: '-',
        doing: '-',
        collect: '-',
        totalCount: '-'
      };
    }
    const subjectPath = path.join(cachePath, `${config.itemData.id}.json`);
    if (!fs.existsSync(subjectPath) && data.id) {
      fs.writeFileSync(subjectPath, JSON.stringify(data));
    }
    return formatApiData(data, config, coverMirror);
  }).filter(Boolean);
};
const getItemsId = async ({
  vmid,
  type,
  status,
  showProgress,
  sourceDir,
  proxy,
  infoApi,
  host,
  coverMirror,
  skipNsfw
}) => {
  const getBangumiData = infoApi === 'bgmSub' ? getBangumiDataFromBangumiSubject : getBangumiDataFromBangumiApi;
  const items = [];
  let bar;
  try {
    const options = createRequestConfig(proxy);
    const response = await axios.get(`https://${host}/${type}/list/${vmid}/${status}?page=1`, options);
    const username = response.request.path.match(/(anime|game|real)\/list\/(.*?)\//)?.[2];
    if (!username) {
      throw new Error('Failed to get "username"!');
    }
    if (!response?.data) {
      throw new Error('No data received from server');
    }
    const $ = cheerio.load(response.data);
    const pageNum = Math.max(...$('#multipage').find('a').map((index, el) => parseInt($(el).attr('href')?.match(/\?page=([\d]+)/)?.[1] || '0', 10)).get()) || $('#multipage').find('a').length;
    items.push(...(await getBangumiData(extractItemsFromPage($), sourceDir, proxy, coverMirror, skipNsfw)));
    if (showProgress) {
      bar = new ProgressBar(`正在获取 ${CONSTANTS.STATUS_TEXT[status]} ${CONSTANTS.TYPE_TEXT[type]} [:bar] :percent :elapseds`, {
        total: pageNum < 2 ? 1 : pageNum,
        complete: '█'
      });
      bar.tick();
    }
    if (pageNum < 2) {
      return items;
    }
    for (let i = 2; i <= pageNum; i++) {
      if (showProgress) bar.tick();
      const response = await axios.get(`https://${host}/${type}/list/${username}/${status}?page=${i}`, {
        ...options,
        headers: {
          'User-Agent': CONSTANTS.API.BROWSER_USER_AGENT
        }
      });
      const $ = cheerio.load(response.data);
      items.push(...(await getBangumiData(extractItemsFromPage($), sourceDir, proxy, coverMirror, skipNsfw)));
    }
    return items;
  } catch (error) {
    log.error('Error fetching items:', error);
    return [];
  }
};
const extractItemsFromPage = $ => $('#browserItemList>li').map((index, el) => ({
  id: $(el).attr('id').replace('item_', ''),
  cover: $(el).find('img').attr('src'),
  name: $(el).find('h3>a').text(),
  myStars: $(el).find('.starlight').attr('class')?.match(/stars([\d]+)/)?.[1],
  myComment: $(el).find('#comment_box').text().trim()
})).get();
const saveDataToFile = (filePath, data, type) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
    log.info(`Bangumi ${type} data has been saved to ${filePath}`);
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
module.exports.getBgmData = async function getBgmData({
  vmid,
  type,
  showProgress,
  sourceDir,
  extraOrder,
  pagination,
  proxy,
  infoApi,
  host,
  coverMirror,
  skipNsfw
}) {
  try {
    log.info('Getting bangumis, please wait...');
    const startTime = new Date().getTime();
    const options = {
      vmid,
      type: CONSTANTS.TYPE_PATH_MAP[type],
      showProgress,
      sourceDir,
      proxy,
      infoApi,
      host,
      coverMirror,
      skipNsfw
    };
    const wantWatch = (await getItemsId({
      ...options,
      status: 'wish'
    })).filter(item => !(skipNsfw && item.nsfw));
    const watching = (await getItemsId({
      ...options,
      status: 'do'
    })).filter(item => !(skipNsfw && item.nsfw));
    const watched = (await getItemsId({
      ...options,
      status: 'collect'
    })).filter(item => !(skipNsfw && item.nsfw));
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
    log.error('Failed to get bangumi data:', error);
    throw error;
  }
};