'use strict';

const ejs = require('ejs');
const path = require('path');
const i18n = require('./util').i18n;
const fs = require('hexo-fs');
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
    let wantWatch=[], watching=[], watched=[];
    if(!fs.existsSync(path.resolve(__dirname, '../data/bangumis.json'))){
        log.info(`Can't find bilibili bangumi data, please use 'hexo bangumi update' command to get data`);
    }else{
        ({ wantWatch, watching, watched } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/bangumis.json'))));
        log.info(wantWatch.length + watching.length + watched.length + ' bangumis have been loaded');
    }
    
    let __ = i18n.__(config.language);

    let contents = ejs.renderFile(path.join(__dirname, 'templates/bangumi.ejs'), {
        'quote': config.bangumi.quote,
        'show': config.bangumi.show,
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