const fs = require('hexo-fs');
const path = require('path');
const axios = require('axios');
const hexoLog = require('hexo-log');
const log = typeof hexoLog.default === 'function' ? hexoLog.default({
  debug: false,
  silent: false
}) : hexoLog({
  debug: false,
  silent: false
});
const ProgressBar = require('progress');

const TYPE = {
  1: '书籍',
  2: '动画',
  3: '音乐',
  4: '游戏',
  6: '三次元'
};
const getDataPage = async (vmid, status, typeNum) => {
  const response = await axios.get(`http://api.bgm.tv/v0/users/${vmid}/collections?subject_type=${typeNum}&type=${status}&limit=1&offset=0`, {headers: {
    'User-Agent': 'HCLonely/hexo-bilibili-bangumi'
  }});
  if (typeof response?.data?.total !== 'undefined') {
    return { success: true, data: Math.ceil(response.data.total / 30) + 1 };
  } else if (response && response.data) {
    return { success: false, data: response.data };
  }
  return { success: false, data: response };
};
const getData = async (vmid, status, typeNum, pn, coverMirror) => {
  const response = await axios.get(`http://api.bgm.tv/v0/users/${vmid}/collections?subject_type=${typeNum}&type=${status}&limit=30&offset=${pn}`, {
    headers: {
      'User-Agent': 'HCLonely/hexo-bilibili-bangumi'
    }
  });
  const $data = [];
  if (response?.status === 200) {
    const list = response?.data?.data || [];
    for (const bangumi of list) {
      $data.push({
        title: bangumi?.subject?.name_cn || bangumi?.subject?.name,
        type: TYPE[bangumi?.subject_type || bangumi?.type] || '未知',
        cover: coverMirror + bangumi?.subject?.images?.common,
        totalCount: bangumi?.subject?.eps,
        id: bangumi?.subject_id || bangumi?.subject?.id,
        score: bangumi?.subject?.score ?? '-',
        des: `${bangumi?.subject?.short_summary?.trim()}...` || '-',
        collect: bangumi?.subject?.collection_total || '-',
        myStars: bangumi.rate || null,
        myComment: bangumi.comment || null,
        progress: Math.round(((bangumi?.ep_status || 0) / (bangumi?.subject?.eps || 1)) * 100),
        tags: bangumi?.subject?.tags?.[0]?.name || '-',
        ep_status: bangumi?.ep_status || 0
      });
    }
    return $data;
  }
};
const processData = async (vmid, status, showProgress, typeNum, coverMirror) => {
  const page = await getDataPage(vmid, status, typeNum);
  if (page?.success) {
    const list = [];
    let bar = null;
    if (showProgress) {
      // eslint-disable-next-line no-nested-ternary
      bar = new ProgressBar(`正在获取 ${status === 1 ? `${typeNum === 4 ? '[想玩]' : '[想看]'}` :
          status === 2 ? `${typeNum === 4 ? '[已玩]' : '[已看]'}` :
            `${typeNum === 4 ? '[在玩]' : '[在看]'}`} ${TYPE[typeNum]} [:bar] :percent :elapseds`, { total: page.data - 1, complete: '█' });
    }
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i < page.data; i++) {
      if (showProgress) bar.tick();
      const data = await getData(vmid, status, typeNum, (i-1)*30, coverMirror);
      list.push(...data);
    }
    return list;
  }
  console.log(`Get ${typeNum === 2 ? 'bangumi' : 'game'} data error:`, page?.data);
  return [];
};
module.exports.getBgmv0Data = async ({ vmid, type, showProgress, sourceDir, extraOrder, pagination, coverMirror }) => {
  log.info(`Getting bgm ${type === 2 ? 'bangumi' : 'game'} data, please wait...`);
  const startTime = new Date().getTime();
  const wantWatch = await processData(vmid, 1, showProgress, type, coverMirror);
  const watching = await processData(vmid, 3, showProgress, type, coverMirror);
  const watched = await processData(vmid, 2, showProgress, type, coverMirror);
  const endTime = new Date().getTime();
  log.info(`${wantWatch.length + watching.length + watched.length} ${type}s have been loaded in ${endTime - startTime} ms`);
  const bangumis = { wantWatch, watching, watched };
  if (!fs.existsSync(path.join(sourceDir, '/_data/'))) {
    fs.mkdirsSync(path.join(sourceDir, '/_data/'));
  }
  fs.writeFile(path.join(sourceDir, `/_data/${type === 2 ? 'bangumi' : 'game'}s.json`), JSON.stringify(bangumis), (err) => {
    if (err) {
      log.info(`Failed to write data to _data/${type === 2 ? 'bangumi' : 'game'}s.json`);
      console.error(err);
    } else {
      log.info(`Bgm ${type === 2 ? 'bangumi' : 'game'}s data has been saved`);
    }
  });

  if (pagination) {
    const allBangumis = { ...bangumis };
    // extra bangumis
    if (fs.existsSync(path.join(sourceDir, `/_data/extra_${type === 2 ? 'bangumi' : 'game'}s.json`))) {
      const { wantWatchExtra, watchingExtra, watchedExtra } = JSON.parse(fs.readFileSync(path.join(this.source_dir, `/_data/extra_${type === 2 ? 'bangumi' : 'game'}s.json`)));
      if (wantWatchExtra) {
        if (extraOrder === 1) {
          allBangumis.wantWatch = [...wantWatchExtra, ...allBangumis.wantWatch];
        } else {
          allBangumis.wantWatch = [...allBangumis.wantWatch, ...wantWatchExtra];
        }
      }
      if (watchingExtra) {
        if (extraOrder === 1) {
          allBangumis.watching = [...watchingExtra, ...allBangumis.watching];
        } else {
          allBangumis.watching = [...allBangumis.watching, ...watchingExtra];
        }
      }
      if (watchedExtra) {
        if (extraOrder === 1) {
          allBangumis.watched = [...watchedExtra, ...allBangumis.watched];
        } else {
          allBangumis.watched = [...allBangumis.watched, ...watchedExtra];
        }
      }
    }
    fs.writeFile(path.join(sourceDir, `/${type === 2 ? 'bangumi' : 'game'}s.json`), JSON.stringify(bangumis), (err) => {
      if (err) {
        log.info(`Failed to write data to ${type === 2 ? 'bangumi' : 'game'}s.json`);
        console.error(err);
      } else {
        log.info(`Bgm ${type === 2 ? 'bangumi' : 'game'}s data has been saved`);
      }
    });
  }
};
