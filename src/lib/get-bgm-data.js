/* eslint-disable no-underscore-dangle */
const fs = require('hexo-fs');
const path = require('path');
const axios = require('axios');
const log = require('hexo-log')({
  debug: false,
  silent: false
});
const ProgressBar = require('progress');
const cheerio = require('cheerio');
const tunnel = require('tunnel');
const bangumiData = require('bangumi-data');

const getItemsId = async (vmid, status, showProgress, sourceDir, proxy) => {
  const items = [];
  let bar;
  const response = await axios.get(`https://bangumi.tv/anime/list/${vmid}/${status}?page=1`);
  const username = response.request.path.match(/anime\/list\/(.*?)\//)?.[1];
  if (!username) {
    return console.error('Failed to get "username"!');
  }
  if (response?.data) {
    const $ = cheerio.load(response.data);
    const pageNum = Math.max(...$('#multipage').find('a')
      .map((index, el) => parseInt($(el).attr('href')
        ?.match(/\?page=([\d]+)/)?.[1] || '0', 10))
      .get()) || $('#multipage').find('a').length;
    items.push(...await getBangumiData($('#browserItemList>li').map((index, el) => ({
      id: $(el).attr('id')
        .replace('item_', ''),
      cover: $(el).find('img')
        .attr('src'),
      name: $(el).find('h3>a')
        .text()
    }))
      .get(), sourceDir, proxy));

    if (showProgress) {
      // eslint-disable-next-line no-nested-ternary
      bar = new ProgressBar(`正在获取 ${status === 'wish' ? '[想看]' : (status === 'do' ? '[在看]' : '[已看]')} 番剧 [:bar] :percent :elapseds`,
        { total: pageNum < 2 ? 1 : pageNum, complete: '█' });
      bar.tick();
    }
    if (pageNum < 2) {
      return items;
    }

    // eslint-disable-next-line no-plusplus
    for (let i = 2; i <= pageNum; i++) {
      if (showProgress) bar.tick();
      const response = await axios.get(`https://bangumi.tv/anime/list/${username}/${status}?page=${i}`, {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36 Edg/97.0.1072.69'
      });
      const $ = cheerio.load(response.data);
      items.push(...await getBangumiData($('#browserItemList>li').map((index, el) => ({
        id: $(el).attr('id')
          .replace('item_', ''),
        cover: $(el).find('img')
          .attr('src'),
        name: $(el).find('h3>a')
          .text()
      }))
        .get(), sourceDir, proxy));
    }
  }
  // log.info('正在获取番剧详细数据，耗时与追番数量成正比，请耐心等待...');
  return items;
};

const jp2cnName = (name) => bangumiData.items.find((item) => item.title === name)?.titleTranslate?.['zh-Hans']?.[0] || name;

const TYPE = {
  1: '书籍',
  2: '动画',
  3: '音乐',
  4: '游戏',
  6: '三次元'
};
const getBangumiData = async (items, sourceDir, proxy) => (await Promise.allSettled(
  items.map(
    async (item) => {
      const cachePath = path.join(sourceDir, '/_data/Bangumi-Subject-Cache');
      const subjectPath = path.join(cachePath, `${item.id}.json`);
      if (!fs.existsSync(cachePath)) {
        fs.mkdirsSync(cachePath);
      }
      if (fs.existsSync(subjectPath)) {
        return { config: { itemData: item }, data: fs.readFileSync(subjectPath).toString(), status: 200 };
      }
      const options = {
        itemData: item,
        responseType: 'json',
        validateStatus(status) {
          return (status >= 200 && status < 300) || status === 403;
        },
        proxy: false,
        timeout: 30 * 1000
      };
      if (proxy?.host && proxy?.port) {
        options.httpsAgent = tunnel.httpsOverHttp({
          proxy,
          options: {
            rejectUnauthorized: false
          }
        });
      }
      return await axios.get(`https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Subject@master/data/${
        parseInt(parseInt(item.id, 10) / 100, 10)}/${item.id}.json`, options)
        .then((response) => response)
        .catch((error) => {
          if (error.response) {
            console.error('Error', error.response.status);
          } else {
            console.error('Error', error.stack);
          }
          return {
            config: { itemData: item },
            error
          };
        });
    }
  )
)).map(({ value, reason }) => {
  const { config, data, status } = value || reason;
  let bangumiData = data;
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
  if (typeof data === 'string') {
    try {
      // eslint-disable-next-line no-param-reassign
      bangumiData = JSON.parse(data.replace(/(?<!":|\/|\\)("[^":,\]}][^"]*?[^":])"(?!,|]|}|:)/g, '\\$1\\"'));
    } catch (e) {
      console.log(`Error Id: ${config.itemData.id}`);
      console.error(e);
    }
  }
  const { id, name, type, image, rating: { score } = {}, summary, collection: { wish, doing, collect } = {}, eps, epsLength } = bangumiData;
  const totalCount = epsLength || eps?.length;
  const subjectPath = path.join(sourceDir, '/_data/Bangumi-Subject-Cache', `${config.itemData.id}.json`);
  if (!fs.existsSync(subjectPath)) {
    if (id && name && type && image && score && summary && wish && doing && collect && eps?.length > 0) {
      fs.writeFileSync(subjectPath, JSON.stringify({ id, name, type, image, rating: { score }, summary, collection: { wish, doing, collect }, epsLength: eps.length }));
    }
  }
  return {
    id: id || config.itemData.id,
    title: jp2cnName(name || config.itemData.name),
    type: TYPE[type] || '未知',
    cover: image || config.itemData.cover,
    score: score || '-',
    des: summary?.replace(/\r?\n/g, '').trim() || '-',
    wish: wish || '-',
    doing: doing || '-',
    collect: collect || '-',
    totalCount: totalCount ? `全${totalCount}话` : '-'
  };
});

module.exports.getBgmData = async function getBgmData(vmid, showProgress, sourceDir, proxy) {
  log.info('Getting bangumis, please wait...');
  const startTime = new Date().getTime();
  const wantWatch = await getItemsId(vmid, 'wish', showProgress, sourceDir, proxy);
  const watching = await getItemsId(vmid, 'do', showProgress, sourceDir, proxy);
  const watched = await getItemsId(vmid, 'collect', showProgress, sourceDir, proxy);
  const endTime = new Date().getTime();
  log.info(`${wantWatch.length + watching.length + watched.length} bangumis have been loaded in ${endTime - startTime} ms`);
  const bangumis = { wantWatch, watching, watched };
  if (!fs.existsSync(path.join(sourceDir, '/_data/'))) {
    fs.mkdirsSync(path.join(sourceDir, '/_data/'));
  }
  fs.writeFile(path.join(sourceDir, '/_data/bangumis.json'), JSON.stringify(bangumis), (err) => {
    if (err) {
      log.info('Failed to write data to bangumis.json');
      console.error(err);
    } else {
      log.info('Bangumi bangumis data has been saved');
    }
  });
};
