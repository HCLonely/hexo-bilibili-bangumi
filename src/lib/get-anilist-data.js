/*
 * @Author       : HCLonely
 * @Date         : 2024-09-11 15:40:57
 * @LastEditTime : 2025-07-10 10:00:40
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/src/lib/get-anilist-data.js
 * @Description  : AniList数据获取模块，通过GraphQL API获取用户的动画收藏数据。
 *                 支持通过用户ID或用户名获取数据，包含标题、封面、评分、进度等信息，
 *                 并支持多语言标题显示和数据分页功能。
 */

const fs = require('hexo-fs');
const path = require('path');
const axios = require('axios');
const hexoLog = require('hexo-log');

// 常量定义
const ANILIST_API = 'https://graphql.anilist.co';
const CACHE_DIR = '_data';
const CACHE_FILE = 'bangumis.json';
const EXTRA_CACHE_FILE = 'extra_bangumis.json';
const USER_AGENT = 'HCLonely/hexo-bilibili-bangumi';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// 状态映射
const STATUS_MAP = {
  PLANNING: 'wantWatch',
  CURRENT: 'watching',
  REPEATING: 'watching',
  COMPLETED: 'watched'
};

// 日志实例
const log = typeof hexoLog.default === 'function'
  ? hexoLog.default({ debug: false, silent: false })
  : hexoLog({ debug: false, silent: false });

// GraphQL查询
const MEDIA_LIST_QUERY = `
  query($userId:Int,$userName:String,$type:MediaType){
    MediaListCollection(userId:$userId,userName:$userName,type:$type){
      lists{
        entries{
          ...mediaListEntry
        }
      }
    }
  }
  fragment mediaListEntry on MediaList{
    id
    mediaId
    status
    score
    progress
    notes
    media{
      id
      title{
        userPreferred
        romaji
        english
        native
      }
      coverImage{
        large
      }
      status(version:2)
      episodes
      averageScore
      popularity
      countryOfOrigin
      genres
      description(asHtml: false)
    }
  }
`;

/**
 * 延迟函数
 * @param {number} ms 延迟时间(毫秒)
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 带重试的API请求
 * @param {Object} postData 请求数据
 * @param {number} retries 重试次数
 * @returns {Promise<Object>}
 */
const fetchWithRetry = async (postData, retries = MAX_RETRIES) => {
  try {
    const response = await axios.post(ANILIST_API, postData, {
      headers: { 'User-Agent': USER_AGENT }
    });
    return response;
  } catch (error) {
    if (retries > 0) {
      await delay(RETRY_DELAY);
      return fetchWithRetry(postData, retries - 1);
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
  title: bangumi?.media?.title?.userPreferred ||
         bangumi?.media?.title?.native ||
         bangumi?.media?.title?.english ||
         bangumi?.media?.title?.romaji,
  type: bangumi?.media?.genres?.[0] || '-',
  cover: coverMirror + bangumi?.media?.coverImage?.large,
  totalCount: bangumi?.media?.episodes,
  id: bangumi?.media?.id,
  score: bangumi?.media?.averageScore ?? '-',
  des: bangumi?.media?.description?.trim()?.split('\n')?.[0]?.replace(/<[^>]*>?/g, '') || '-',
  collect: bangumi?.media?.popularity || '-',
  area: bangumi?.media?.countryOfOrigin || '-',
  myStars: bangumi.score || null,
  myComment: bangumi.notes || null,
  progress: Math.round(((bangumi?.progress || 0) / (bangumi?.media?.episodes || 1)) * 100),
  ep_status: bangumi?.progress || 0
});

/**
 * 获取AniList数据
 * @param {string|number} vmid 用户ID或用户名
 * @param {string} coverMirror 图片镜像
 * @param {string} type 媒体类型
 * @returns {Promise<Object>}
 */
const getData = async (vmid, coverMirror, type = 'ANIME') => {
  const variables = {
    type,
    ...(typeof vmid === 'number' ? { userId: vmid } : { userName: vmid })
  };

  const postData = { query: MEDIA_LIST_QUERY, variables };

  try {
    const response = await fetchWithRetry(postData);

    if (response?.status !== 200) {
      throw new Error(`API请求失败: ${response?.status}`);
    }

    const $data = {
      wantWatch: [],
      watching: [],
      watched: []
    };

    const list = response?.data?.data?.MediaListCollection?.lists || [];

    list.forEach((list) => {
      list.entries.forEach((bangumi) => {
        const status = STATUS_MAP[bangumi?.status];
        if (status) {
          $data[status]?.push(formatBangumiData(bangumi, coverMirror));
        }
      });
    });

    return $data;
  } catch (error) {
    log.error(`获取AniList数据失败: ${error.message}`);
    throw error;
  }
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
 * 获取AniList番剧数据
 * @param {Object} options 配置选项
 * @returns {Promise<void>}
 */
module.exports.getAnilistData = async ({
  vmid,
  type,
  sourceDir,
  extraOrder,
  pagination,
  coverMirror
}) => {
  try {
    log.info('Getting anilist bangumi data, please wait...');
    const startTime = new Date().getTime();

    // 获取数据
    const bangumis = await getData(vmid, coverMirror, type);
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
      'Anilist bangumis data has been saved'
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
        'Anilist bangumis data has been saved'
      );
    }
  } catch (error) {
    log.error(`获取AniList数据失败: ${error.message}`);
    throw error;
  }
};
