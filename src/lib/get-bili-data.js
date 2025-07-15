/*
 * @Author       : HCLonely
 * @Date         : 2025-04-02 15:24:17
 * @LastEditTime : 2025-07-15 17:14:49
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/src/lib/get-bili-data.js
 * @Description  : 哔哩哔哩数据获取模块，负责从B站API获取用户的番剧和追剧数据。
 *                 支持获取想看、在看、已看三种状态的内容，包含封面、进度、评分等信息，
 *                 并支持数据分页、WebP图片格式和自定义镜像源等功能。
 */
const fs = require('hexo-fs');
const path = require('path');
const axios = require('axios');
const hexoLog = require('hexo-log');
const ProgressBar = require('progress');

// 常量定义
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
    PAGE_SIZE: 30
  },
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};

// 初始化日志
const log = typeof hexoLog.default === 'function'
  ? hexoLog.default({ debug: false, silent: false })
  : hexoLog({ debug: false, silent: false });

/**
 * 延迟函数
 * @param {number} ms 延迟时间（毫秒）
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 带重试机制的API请求
 * @param {Function} apiCall API调用函数
 * @param {number} retries 重试次数
 * @returns {Promise<any>}
 */
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

/**
 * 获取数据总页数
 * @param {string} vmid 用户ID
 * @param {number} status 状态
 * @param {number} typeNum 类型
 * @returns {Promise<{success: boolean, data: number|string}>}
 */
const getDataPage = async (vmid, status, typeNum) => {
  const response = await withRetry(() => (
    axios.get(`${CONSTANTS.API.BASE_URL}?type=${typeNum}&follow_status=${status}&vmid=${vmid}&ps=1&pn=1`)
  ));

  if (response?.data?.code === 0 && response?.data?.message === '0' && response?.data?.data?.total !== undefined) {
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

/**
 * 格式化数字
 * @param {number} num 要格式化的数字
 * @returns {string} 格式化后的字符串
 */
const formatNumber = (num) => {
  if (!num) return '-';

  if (num > CONSTANTS.NUMBERS.HUNDRED_MILLION) {
    return `${(num / CONSTANTS.NUMBERS.HUNDRED_MILLION).toFixed(1)} 亿`;
  }

  if (num > CONSTANTS.NUMBERS.TEN_THOUSAND) {
    return `${(num / CONSTANTS.NUMBERS.TEN_THOUSAND).toFixed(1)} 万`;
  }

  return num.toString();
};

/**
 * 格式化总集数
 * @param {number} count 总集数
 * @param {number} typeNum 类型
 * @returns {string}
 */
const formatTotal = (count, typeNum) => {
  if (!count) return '-';
  if (count === -1) return '未完结';

  const unit = typeNum === 1 ? '话' : '集';
  return `全${count}${unit}`;
};

const getData = async (vmid, status, useWebp, typeNum, pn, coverMirror, SESSDATA) => {
  const response = await withRetry(() => (
    axios.get(`${CONSTANTS.API.BASE_URL}?type=${typeNum}&follow_status=${status}&vmid=${vmid}&ps=${CONSTANTS.API.PAGE_SIZE}&pn=${pn}`, {
      headers: SESSDATA ? { cookie: `SESSDATA=${SESSDATA};` } : {}
    })
  ));

  if (response?.data?.code !== 0) {
    throw new Error(`获取数据失败: ${response?.data?.message || '未知错误'}`);
  }

  return (response?.data?.data?.list || []).map((bangumi) => {
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
      progress: !SESSDATA ? false : Math.round(
        ((parseInt(bangumi?.progress.match(/\d+/)?.[0] || '0', 10) || 0) /
        (bangumi?.total_count > 0 ? bangumi.total_count : (bangumi.new_ep?.title || 1))) * 100
      ),
      ep_status: !SESSDATA ? false : (parseInt(bangumi?.progress.match(/\d+/)?.[0] || '0', 10) || 0),
      new_ep: bangumi?.total_count > 0 ? bangumi.total_count : (bangumi.new_ep?.title || -1)
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

/**
 * 同步保存数据到文件
 * @param {string} filePath 文件路径
 * @param {Object} data 要保存的数据
 * @param {string} type 数据类型（用于日志）
 */
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

/**
 * 合并额外数据
 * @param {Object} original 原始数据
 * @param {Object} extra 额外数据
 * @param {number} extraOrder 合并顺序（1: 额外数据在前，其他: 额外数据在后）
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
 * 获取B站番剧数据
 * @param {Object} options 配置选项
 * @param {string} options.vmid 用户ID
 * @param {string} options.type 类型（bangumi/cinema）
 * @param {boolean} options.showProgress 是否显示进度条
 * @param {string} options.sourceDir 源目录
 * @param {number} options.extraOrder 额外数据顺序
 * @param {boolean} options.pagination 是否分页
 * @param {boolean} options.useWebp 是否使用WebP格式
 * @param {string} options.coverMirror 图片镜像源
 * @param {string} options.SESSDATA 会话数据
 * @returns {Promise<void>}
 */
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

    // 获取三种状态的数据
    const wantWatch = await processData(vmid, 1, useWebp, showProgress, typeNum, coverMirror, SESSDATA);
    const watching = await processData(vmid, 2, useWebp, showProgress, typeNum, coverMirror, SESSDATA);
    const watched = await processData(vmid, 3, useWebp, showProgress, typeNum, coverMirror, SESSDATA);

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
    log.error(`Failed to get bilibili ${type} data`);
    console.error(error);
    throw error;
  }
};
