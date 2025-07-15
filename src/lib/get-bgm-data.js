/*
 * @Author       : HCLonely
 * @Date         : 2025-04-02 16:02:58
 * @LastEditTime : 2025-07-10 10:02:16
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/src/lib/get-bgm-data.js
 * @Description  : Bangumi.tv数据获取模块，通过网页爬虫和API双重方式获取用户收藏数据。
 *                 支持从bangumi-data获取中文标题，可从CDN或API获取详细信息，
 *                 包含评分、收藏数、简介等，并提供数据缓存功能以提高性能。
 */

const fs = require('hexo-fs');
const path = require('path');
const axios = require('axios');
const hexoLog = require('hexo-log');
const ProgressBar = require('progress');
const cheerio = require('cheerio');
const tunnel = require('tunnel');
const bangumiData = require('bangumi-data');

// 常量定义
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

// 初始化日志
const log = typeof hexoLog.default === 'function'
  ? hexoLog.default({ debug: false, silent: false })
  : hexoLog({ debug: false, silent: false });

/**
 * 从bangumi-data获取中文标题
 * @param {string} name 原始标题
 * @returns {string} 中文标题
 */
const jp2cnName = (name) => bangumiData.items.find((item) => item.title === name)?.titleTranslate?.['zh-Hans']?.[0] || name;

/**
 * 创建HTTP请求配置
 * @param {Object} proxy 代理配置
 * @param {Object} itemData 项目数据
 * @returns {Object} 请求配置
 */
const createRequestConfig = (proxy, itemData = null) => {
  const config = {
    itemData,
    responseType: 'json',
    validateStatus: (status) => (status >= 200 && status < 300) || status === 403,
    proxy: false,
    timeout: CONSTANTS.REQUEST_TIMEOUT
  };

  if (proxy?.host && proxy?.port) {
    config.httpsAgent = tunnel.httpsOverHttp({
      proxy,
      options: { rejectUnauthorized: false }
    });
  }

  return config;
};

/**
 * 确保缓存目录存在
 * @param {string} sourceDir 源目录
 * @param {string} cacheDir 缓存目录名
 * @returns {string} 缓存目录路径
 */
const ensureCacheDir = (sourceDir, cacheDir) => {
  const cachePath = path.join(sourceDir, '/_data/', cacheDir);
  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
  }
  return cachePath;
};

/**
 * 处理API错误
 * @param {Error} error 错误对象
 */
const handleApiError = (error) => {
  if (error.response) {
    log.error('API Error:', error.response.status);
  } else {
    log.error('Error:', error.stack);
  }
};

/**
 * 格式化条目数据（CDN数据源）
 * @param {Object} data 原始数据
 * @param {Object} config 配置信息
 * @param {string} coverMirror 图片镜像源
 * @returns {Object} 格式化后的数据
 */
const formatSubjectData = (data, config, coverMirror) => {
  const { id, name, type, image, rating = {}, summary, collection = {}, eps, epsLength } = data;
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
    myComment: config.itemData.myComment
  };
};

/**
 * 格式化条目数据（API数据源）
 * @param {Object} data API返回的数据
 * @param {Object} config 配置信息
 * @param {string} coverMirror 图片镜像源
 * @returns {Object} 格式化后的数据
 */
const formatApiData = (data, config, coverMirror) => {
  const {
    id, name, name_cn, type,
    images: { common: image } = {},
    rating = {}, summary,
    collection = {}, eps, total_episodes
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
    myComment: config.itemData.myComment
  };
};

/**
 * 从CDN获取Bangumi数据
 * @param {Array} items 项目列表
 * @param {string} sourceDir 源目录
 * @param {Object} proxy 代理配置
 * @param {string} coverMirror 图片镜像源
 * @returns {Promise<Array>} 处理后的数据
 */
const getBangumiDataFromBangumiSubject = async (items, sourceDir, proxy, coverMirror) => {
  const cachePath = ensureCacheDir(sourceDir, CONSTANTS.CACHE.SUBJECT_DIR);

  const processItem = async (item) => {
    const subjectPath = path.join(cachePath, `${item.id}.json`);

    // 尝试从缓存获取数据
    if (fs.existsSync(subjectPath)) {
      try {
        const cachedData = fs.readFileSync(subjectPath).toString();
        return { config: { itemData: item }, data: cachedData, status: 200 };
      } catch (error) {
        log.error(`Failed to read cache for item ${item.id}:`, error);
      }
    }

    // 从CDN获取数据
    try {
      const config = createRequestConfig(proxy, item);
      const folderNum = parseInt(parseInt(item.id, 10) / 100, 10);
      const response = await axios.get(
        `${CONSTANTS.API.CDN_URL}/${folderNum}/${item.id}.json`,
        config
      );
      return response;
    } catch (error) {
      handleApiError(error);
      return { config: { itemData: item }, error };
    }
  };

  const results = await Promise.allSettled(items.map(processItem));

  return results.map(({ value, reason }) => {
    const { config, data, status } = value || reason;

    // 处理错误情况
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

    // 处理数据
    let bangumiData = data;
    if (typeof data === 'string') {
      try {
        bangumiData = JSON.parse(data.replace(/(?<!":|\/|\\)("[^":,\]}][^"]*?[^":])"(?!,|]|}|:)/g, '\\$1\\"'));
      } catch (e) {
        log.error(`Error parsing data for ID: ${config.itemData.id}:`, e);
        return null;
      }
    }

    // 缓存有效数据
    const subjectPath = path.join(cachePath, `${config.itemData.id}.json`);
    if (!fs.existsSync(subjectPath) && bangumiData.id) {
      const cacheData = {
        id: bangumiData.id,
        name: bangumiData.name,
        type: bangumiData.type,
        image: bangumiData.image,
        rating: { score: bangumiData.rating?.score },
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

/**
 * 从API获取Bangumi数据
 * @param {Array} items 项目列表
 * @param {string} sourceDir 源目录
 * @param {Object} proxy 代理配置
 * @param {string} coverMirror 图片镜像源
 * @returns {Promise<Array>} 处理后的数据
 */
const getBangumiDataFromBangumiApi = async (items, sourceDir, proxy, coverMirror) => {
  const cachePath = ensureCacheDir(sourceDir, CONSTANTS.CACHE.API_DIR);

  const processItem = async (item) => {
    const subjectPath = path.join(cachePath, `${item.id}.json`);

    // 尝试从缓存获取数据
    if (fs.existsSync(subjectPath)) {
      try {
        const cachedData = JSON.parse(fs.readFileSync(subjectPath).toString());
        return { config: { itemData: item }, data: cachedData, status: 200 };
      } catch (error) {
        log.error(`Failed to read cache for item ${item.id}:`, error);
      }
    }

    // 从API获取数据
    try {
      const config = createRequestConfig(proxy, item);
      config.headers = { 'user-agent': CONSTANTS.API.USER_AGENT };

      const response = await axios.get(
        `${CONSTANTS.API.BGM_API_URL}/${item.id}`,
        config
      );
      return response;
    } catch (error) {
      handleApiError(error);
      return { config: { itemData: item }, error };
    }
  };

  const results = await Promise.allSettled(items.map(processItem));

  return results.map(({ value, reason }) => {
    const { config, data, status } = value || reason;

    // 处理错误情况
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

    // 缓存有效数据
    const subjectPath = path.join(cachePath, `${config.itemData.id}.json`);
    if (!fs.existsSync(subjectPath) && data.id) {
      fs.writeFileSync(subjectPath, JSON.stringify(data));
    }

    return formatApiData(data, config, coverMirror);
  }).filter(Boolean);
};

/**
 * 从网页获取条目ID列表
 * @param {Object} params 参数对象
 * @returns {Promise<Array>} 条目列表
 */
const getItemsId = async ({
  vmid,
  type,
  status,
  showProgress,
  sourceDir,
  proxy,
  infoApi,
  host,
  coverMirror
}) => {
  const getBangumiData = infoApi === 'bgmSub'
    ? getBangumiDataFromBangumiSubject
    : getBangumiDataFromBangumiApi;

  const items = [];
  let bar;

  try {
    // 获取第一页数据
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

    // 获取总页数
    const pageNum = Math.max(
      ...$('#multipage').find('a')
        .map((index, el) => parseInt($(el).attr('href')?.match(/\?page=([\d]+)/)?.[1] || '0', 10))
        .get()
    ) || $('#multipage').find('a').length;

    // 处理第一页数据
    items.push(...await getBangumiData(
      extractItemsFromPage($),
      sourceDir,
      proxy,
      coverMirror
    ));

    // 显示进度条
    if (showProgress) {
      bar = new ProgressBar(
        `正在获取 ${CONSTANTS.STATUS_TEXT[status]} ${CONSTANTS.TYPE_TEXT[type]} [:bar] :percent :elapseds`,
        { total: pageNum < 2 ? 1 : pageNum, complete: '█' }
      );
      bar.tick();
    }

    if (pageNum < 2) {
      return items;
    }

    // 获取剩余页面数据
    for (let i = 2; i <= pageNum; i++) {
      if (showProgress) bar.tick();

      const response = await axios.get(
        `https://${host}/${type}/list/${username}/${status}?page=${i}`,
        {
          ...options,
          headers: { 'User-Agent': CONSTANTS.API.BROWSER_USER_AGENT }
        }
      );

      const $ = cheerio.load(response.data);
      items.push(...await getBangumiData(
        extractItemsFromPage($),
        sourceDir,
        proxy,
        coverMirror
      ));
    }

    return items;
  } catch (error) {
    log.error('Error fetching items:', error);
    return [];
  }
};

/**
 * 从页面提取条目数据
 * @param {Object} $ Cheerio对象
 * @returns {Array} 条目数据列表
 */
const extractItemsFromPage = ($) => $('#browserItemList>li').map((index, el) => ({
  id: $(el).attr('id').replace('item_', ''),
  cover: $(el).find('img').attr('src'),
  name: $(el).find('h3>a').text(),
  myStars: $(el).find('.starlight').attr('class')
    ?.match(/stars([\d]+)/)?.[1],
  myComment: $(el).find('#comment_box').text()
    .trim()
})).get();

/**
 * 保存数据到文件
 * @param {string} filePath 文件路径
 * @param {Object} data 要保存的数据
 * @param {string} type 数据类型
 */
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

/**
 * 合并额外数据
 * @param {Object} original 原始数据
 * @param {Object} extra 额外数据
 * @param {number} extraOrder 合并顺序
 * @returns {Object} 合并后的数据
 */
const mergeExtraData = (original, extra, extraOrder) => {
  const result = { ...original };
  const categories = ['wantWatch', 'watching', 'watched'];

  categories.forEach((category) => {
    const extraData = extra[`${category}Extra`];
    if (extraData) {
      result[category] = extraOrder === 1
        ? [...extraData, ...result[category]]
        : [...result[category], ...extraData];
    }
  });

  return result;
};

/**
 * 获取Bangumi数据
 * @param {Object} options 配置选项
 * @returns {Promise<void>}
 */
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
  coverMirror
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
      coverMirror
    };
    // 获取三种状态的数据
    const wantWatch = await getItemsId({
      ...options,
      status: 'wish'
    });
    const watching = await getItemsId({
      ...options,
      status: 'do'
    });
    const watched = await getItemsId({
      ...options,
      status: 'collect'
    });

    const endTime = new Date().getTime();
    log.info(`${wantWatch.length + watching.length + watched.length} ${type}s have been loaded in ${endTime - startTime} ms`);

    const bangumis = { wantWatch, watching, watched };

    // 确保目录存在
    const dataDir = path.join(sourceDir, '/_data/');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 保存原始数据
    saveDataToFile(
      path.join(dataDir, `${type}s.json`),
      bangumis,
      type
    );

    // 处理分页数据
    if (pagination) {
      let allBangumis = { ...bangumis };
      const extraPath = path.join(dataDir, `extra_${type}s.json`);

      // 合并额外数据
      if (fs.existsSync(extraPath)) {
        try {
          const extraData = JSON.parse(fs.readFileSync(extraPath, 'utf8'));
          allBangumis = mergeExtraData(allBangumis, extraData, extraOrder);
        } catch (error) {
          log.error(`Failed to parse extra data from ${extraPath}`);
          console.error(error);
        }
      }

      // 保存合并后的数据
      saveDataToFile(
        path.join(sourceDir, `${type}s.json`),
        allBangumis,
        `${type} (with extras)`
      );
    }
  } catch (error) {
    log.error('Failed to get bangumi data:', error);
    throw error;
  }
};
