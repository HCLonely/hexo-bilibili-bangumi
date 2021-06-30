const bangumiData = require('bangumi-data');
const axios = require('axios')
const cheerio = require('cheerio')
const util = require('util')

headers = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:71.0) Gecko/20100101 Firefox/71.0',
    accept: 'text/css,*/*;q=0.1',
    acceptLanguage: 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
    acceptEncoding: 'gzip, deflate, br',
    }
id = 294713
// id = 333598

async function queryCNName(id, jpname = null){
    const res =  await axios.get(`https://bgm.tv/subject/${id}`)
    const $ = cheerio.load(res.data);
    const cn_name = $('meta[name="keywords"]').attr('content').split(',')[0] ?? null;
    console.log(cn_name)
    return cn_name ?? jpname ?? null
}

async function test(){
    const res =  await axios.get(`https://bgm.tv/subject/${id}`)
    const $ = cheerio.load(res.data);
    // cover
    const cover = 'https:' +　$('img','#bangumiInfo')?.attr('src')
    const score = $('span[property*="v:average"]').text()
    // name
    const cn_name = await queryCNName(id)
    // totalCount
    const hastotalCount = $('span', '#infobox')[1].children[0].data;
    const totalCount = $('span', '#infobox')[1].next.data;
    // wantWatch
    const wish = $('a[href$="wishes"]').text()
    // watching
    const collect = $('a[href$="collections"]').text()
    // watched
    const doing = $('a[href$="doings"]').text()
    // view
    const people = $('.tip_i').find('a')
    var s = 0;
    for(var i=1; i<people.length;i++)
    {
        s+= parseInt(people[i].children[0].data.split('人')[0]) 
    }
    const view = s
    const des = $('#subject_summary').text()
    const type = $('option[selected*=selected]').attr('value')
    return {
        title: cn_name,
        score: score,
        des: des,
        wish: wish,
        collect: collect,
        doing: doing,
        cover: cover,
        totalCount: totalCount,
        type: type,
        view: view,
        id: id
      }
}
async function t(){
    // console.log(await test())
    await test()
}
t()
