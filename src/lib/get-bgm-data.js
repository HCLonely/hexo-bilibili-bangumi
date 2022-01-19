const fs = require('hexo-fs');
const path = require('path');
const axios = require('axios');
const log = require('hexo-log')({
  debug: false,
  silent: false
});
const ProgressBar = require('progress');
const cheerio = require('cheerio');
const bangumiData = require('bangumi-data');

const getItemsId = async (vmid, status, showProgress) => {
  let items = [];
  const response = await axios.get(`https://bangumi.tv/anime/list/${vmid}/${status}?page=1`);
  if (response?.data) {
    const $ = cheerio.load(response.data);
    const pageNum = $('#multipage').find('a').length;
    items = $('#browserItemList>li').map((index, el) => ({
      id: $(el).attr('id')
        .replace('item_', ''),
      cover: $(el).find('img')
        .attr('src'),
      name: $(el).find('h3>a')
        .text()
    }))
      .get();

    if (pageNum < 2) {
      return items;
    }

    let bar;
    // eslint-disable-next-line no-plusplus
    for (let i = 2; i <= pageNum; i++) {
      if (showProgress) {
        // eslint-disable-next-line no-nested-ternary
        bar = new ProgressBar(`正在获取 ${status === 'wish' ? '[想看]' : (status === 'do' ? '[在看]' : '[已看]')} 番剧 [:bar] :percent :elapseds`,
          { total: pageNum, complete: '█' });
      }
      const response = await axios.get(`https://bangumi.tv/anime/list/${vmid}/${status}?page=${i}`);
      const $ = cheerio.load(response.data);
      items = [...items, ...$('#browserItemList>li').map((index, el) => ({
        id: $(el).attr('id')
          .replace('item_', ''),
        cover: $(el).find('img')
          .attr('src'),
        name: $(el).find('h3>a')
          .text()
      }))
        .get()];
    }
  }
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
const getBangumiData = async (items) => (await axios.all(
  items.map(
    (item) => axios.get(`https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Subject@master/data/${
      parseInt(parseInt(item.id, 10) / 100, 10)}/${item.id}.json`, { itemData: item, responseType: 'json' })
  )
)).map(({ config, data }) => {
  if (typeof data === 'string') {
    try {
      // eslint-disable-next-line no-param-reassign
      data = JSON.parse(data.replace(/(?<!":|\/|\\)("[^":,\]}][^"]*?[^":])"(?!,|]|}|:)/g, '\\$1\\"'));
    } catch (e) {
      console.log(`Error Id: ${config.itemData.id}`);
      console.error(e);
    }
  }
  return ({
    id: data?.id || config.itemData.id,
    title: jp2cnName(data?.name || config.itemData.name),
    type: TYPE[data?.type] || '未知',
    cover: data?.image || config.itemData.cover,
    score: data?.rating?.score || '-',
    des: data?.summary?.replace(/\r?\n/g, '').trim() || '-',
    wish: data?.collection?.wish || '-',
    doing: data?.collection?.doing || '-',
    collect: data?.collection?.collect || '-',
    totalCount: data?.eps?.length ? `全${data?.eps?.length}话` : '-'
  });
});
/*
(async () => {
  console.log(await getBangumiData([{ id: '975' }]));
})();
function count(e) {
  return e ? (e > 10000 && e < 100000000 ? `${(e / 10000).toFixed(1)} 万` : e > 100000000 ? `${(e / 100000000).toFixed(1)} 亿` : e) : '-';
}
function total(e, typeNum) {
  return e ? (e === -1 ? '未完结' : `全${e}${typeNum === 1 ? '话' : '集'}`) : '-';
}
*/
module.exports.getBgmData = async function getBgmData(vmid, showProgress, sourceDir) {
  log.info('Getting bangumis, please wait...');
  const startTime = new Date().getTime();
  const wantWatch = await getBangumiData(await getItemsId(vmid, 'wish', showProgress));
  const watching = await getBangumiData(await getItemsId(vmid, 'do', showProgress));
  const watched = await getBangumiData(await getItemsId(vmid, 'collect', showProgress));
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
      log.info('Bilibili bangumis data has been saved');
    }
  });
};
