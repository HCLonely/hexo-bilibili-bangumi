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

const getDataPage = async (vmid, status, typeNum) => {
  const response = await axios.get(`https://api.bilibili.com/x/space/bangumi/follow/list?type=${typeNum}&follow_status=${status}&vmid=${vmid}&ps=1&pn=1`);
  if (response?.data?.code === 0 && response?.data?.message === '0' && response?.data?.data && typeof response?.data?.data?.total !== 'undefined') {
    return { success: true, data: Math.ceil(response.data.data.total / 30) + 1 };
  } else if (response && response.data && response.data.message !== '0') {
    return { success: false, data: response.data.message };
  } else if (response && response.data) {
    return { success: false, data: response.data };
  }
  return { success: false, data: response };
};
const getData = async (vmid, status, useWebp, typeNum, pn) => {
  const response = await axios.get(`https://api.bilibili.com/x/space/bangumi/follow/list?type=${typeNum}&follow_status=${status}&vmid=${vmid}&ps=30&pn=${pn}`);
  const $data = [];
  if (response?.data?.code === 0) {
    const data = response?.data?.data;
    const list = data?.list || [];
    for (const bangumi of list) {
      let cover = bangumi?.cover;
      if (cover) {
        const href = new URL(cover);
        href.protocol = 'https';
        if (useWebp) href.pathname += '@220w_280h.webp';
        cover = href.href;
      }
      $data.push({
        title: bangumi?.title,
        type: bangumi?.season_type_name,
        area: bangumi?.areas?.[0]?.name,
        cover,
        totalCount: total(bangumi?.total_count, typeNum),
        id: bangumi?.media_id,
        follow: count(bangumi?.stat?.follow),
        view: count(bangumi?.stat?.view),
        danmaku: count(bangumi?.stat?.danmaku),
        coin: count(bangumi.stat.coin),
        score: bangumi?.rating?.score ?? '-',
        des: bangumi?.evaluate
      });
    }
    return $data;
  }
};
// eslint-disable-next-line no-nested-ternary
const count = (e) =>  (e ? (e > 10000 && e < 100000000 ? `${(e / 10000).toFixed(1)} 万` : e > 100000000 ? `${(e / 100000000).toFixed(1)} 亿` : e) : '-');

// eslint-disable-next-line no-nested-ternary
const total = (e, typeNum) => (e ? (e === -1 ? '未完结' : `全${e}${typeNum === 1 ? '话' : '集'}`) : '-');

const processData = async (vmid, status, useWebp, showProgress, typeNum) => {
  const page = await getDataPage(vmid, status, typeNum);
  if (page?.success) {
    const list = [];
    let bar = null;
    if (showProgress) {
      // eslint-disable-next-line no-nested-ternary
      bar = new ProgressBar(`正在获取 ${status === 1 ? '[想看]' : status === 2 ? '[在看]' : '[已看]'} ${typeNum === 1 ? '番剧' : '追剧'} [:bar] :percent :elapseds`, { total: page.data - 1, complete: '█' });
    }
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i < page.data; i++) {
      if (showProgress) bar.tick();
      const data = await getData(vmid, status, useWebp, typeNum, i);
      list.push(...data);
    }
    return list;
  }
  console.log(`Get ${typeNum === 1 ? 'bangumi' : 'cinema'} data error:`, page?.data);
  return [];
};
module.exports.getBiliData = async ({ vmid, type, showProgress, sourceDir, extraOrder, pagination, useWebp = true }) => {
  const typeNum = type === 'cinema' ? 2 : 1;
  log.info(`Getting bilibili ${type}, please wait...`);
  const startTime = new Date().getTime();
  const wantWatch = await processData(vmid, 1, useWebp, showProgress, typeNum);
  const watching = await processData(vmid, 2, useWebp, showProgress, typeNum);
  const watched = await processData(vmid, 3, useWebp, showProgress, typeNum);
  const endTime = new Date().getTime();
  log.info(`${wantWatch.length + watching.length + watched.length} ${type}s have been loaded in ${endTime - startTime} ms`);
  const bangumis = { wantWatch, watching, watched };
  if (!fs.existsSync(path.join(sourceDir, '/_data/'))) {
    fs.mkdirsSync(path.join(sourceDir, '/_data/'));
  }
  fs.writeFile(path.join(sourceDir, `/_data/${type}s.json`), JSON.stringify(bangumis), (err) => {
    if (err) {
      log.info(`Failed to write data to _data/${type}s.json`);
      console.error(err);
    } else {
      log.info(`Bilibili ${type}s data has been saved`);
    }
  });

  if (pagination) {
    const allBangumis = { ...bangumis };
    // extra bangumis
    if (fs.existsSync(path.join(sourceDir, `/_data/extra_${type}s.json`))) {
      const { wantWatchExtra, watchingExtra, watchedExtra } = JSON.parse(fs.readFileSync(path.join(this.source_dir, `/_data/extra_${type}s.json`)));
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
    fs.writeFile(path.join(sourceDir, `/${type}s.json`), JSON.stringify(bangumis), (err) => {
      if (err) {
        log.info(`Failed to write data to ${type}s.json`);
        console.error(err);
      } else {
        log.info(`Bilibili ${type}s data has been saved`);
      }
    });
  }
};
