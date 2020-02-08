'use strict';

const ejs = require('ejs');
const path = require('path');
const i18n = require('./util').i18n;
const axios = require("axios");
const log = require('hexo-log')({
    debug: false,
    silent: false
});

module.exports = async function (locals) {

    let config = this.config;
    if (!config.bangumi || !config.bangumi.enable) {
        return;
    }

    let root = config.root;
    if (root.endsWith('/')) {
        root = root.slice(0, root.length - 1);
    }

    let startTime = new Date().getTime();
    let wantWatch = await biliBangumi(this.config.bangumi.vmid, 1);
    let watching = await biliBangumi(this.config.bangumi.vmid, 2);
    let watched = await biliBangumi(this.config.bangumi.vmid, 3);
    let endTime = new Date().getTime();
    log.info(wantWatch.length + watching.length + watched.length + ' bangumis have been loaded in ' + (endTime - startTime) + " ms");

    let __ = i18n.__(config.language);

    let contents = ejs.renderFile(path.join(__dirname, 'templates/bangumi.ejs'), {
        'quote': config.bangumi.quote,
        'loading': config.bangumi.loading,
        'wantWatch': wantWatch,
        'watched': watched,
        'watching': watching,
        '__': __,
        'root': root
    },
        function (err, result) {
            if (err) console.log(err);
            return result;
        });
        
    return {
        path: 'bangumis/index.html',
        data: {
            title: config.bangumi.title,
            content: contents,
            slug: 'bangumis'
        },
        layout: ['page', 'post']
    };
};
async function getBangumiPage(vmid, status) {
    let response = await axios.get(`https://api.bilibili.com/x/space/bangumi/follow/list?type=1&follow_status=${status}&vmid=${vmid}&ps=1&pn=1`)
    return Math.ceil(response.data.data.total / 50) + 1;
}
async function getBangumi(vmid, status, pn) {
    let response = await axios.get(`https://api.bilibili.com/x/space/bangumi/follow/list?type=1&follow_status=${status}&vmid=${vmid}&ps=50&pn=${pn}`)
    let $data = [];
    if (response.data.code === 0) {
        let data = response.data.data;
        let list = data.list;
        for (let bangumi of list) {
            $data.push({
                title: bangumi.title,
                type: bangumi.season_type_name,
                area: bangumi.areas[0].name,
                cover: bangumi.cover + "@220w_280h.webp",
                totalCount: total(bangumi.total_count),
                id: bangumi.media_id,
                follow: count(bangumi.stat.follow),
                view: count(bangumi.stat.view),
                danmaku: count(bangumi.stat.danmaku),
                coin: count(bangumi.stat.coin),
                score: bangumi.rating ? bangumi.rating.score : "暂无评分",
                des: bangumi.evaluate
            });
        }
        return $data;
    }
}
function count(e) {
    return e > 10000 && e < 100000000 ? `${(e / 10000).toFixed(1)} 万` : e > 100000000 ? `${(e / 100000000).toFixed(1)} 亿` : e;
}
function total(e) {
    return e === -1 ? `未完结` : `全${e}话`;
}
async function biliBangumi(vmid, status) {
    let page = await getBangumiPage(vmid, status);
    let list = [];
    for (let i = 1; i < page; i++) {
        let data = await getBangumi(vmid, status, i);
        list.push(...data);
    }
    return list;
}