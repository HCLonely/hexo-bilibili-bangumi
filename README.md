# hexo-bilibili-bangumi

![](https://nodei.co/npm/hexo-bilibili-bangumi.png?downloads=true&downloadRank=true&stars=true)

## 介绍

**为 Hexo 添加哔哩哔哩追番/追剧页面，参考自[hexo-douban](https://github.com/mythsman/hexo-douban)**.

[Demo](https://demo.hclonely.com/bangumis/)

## 安装

```bash
$ npm install hexo-bilibili-bangumi --save
```

------------

## 配置

将下面的配置写入站点的配置文件 `_config.yml` 里(不是主题的配置文件).

``` yaml
bangumi: # 追番设置
  enable: true
  path:
  vmid:
  title: '追番列表'
  quote: '生命不息，追番不止！'
  show: 1
  loading:
  metaColor:
  color:
  webp:
  progress:
cinema: # 追剧设置
  enable: true
  path:
  vmid:
  title: '追番列表'
  quote: '生命不息，追番不止！'
  show: 1
  loading:
  metaColor:
  color:
  webp:
  progress:
```

- **enable**: 是否启用
- **path**: 页面路径，默认`bangumis/index.html`, `cinemas/index.html`
- **vmid**: 哔哩哔哩的 `vmid(uid)`,[如何获取？](#获取uid)
- **title**: 该页面的标题
- **quote**: 写在页面开头的一段话，支持 html 语法，可留空。
- **show**: 初始显示页面：`0: 想看`, `1: 在看`, `2: 看过`，默认为`1`
- **loading**: 图片加载完成前的 loading 图片
- **metaColor**: meta 部分(简介上方)字体颜色
- **color**: 简介字体颜色
- **webp**: 番剧封面使用`webp`格式(此格式在`safari`浏览器下不显示，但是图片大小可以缩小 100 倍左右), 默认`true`
- **progress**: 获取番剧数据时是否显示进度条，默认`true`

## 使用

1. 在`hexo generate`或`hexo deploy`之前使用`hexo bangumi -u`命令更新追番数据，使用`hexo cinema -u`命令更新追剧数据！
2. 删除数据命令:`hexo bangumi -d`/`hexo cinema -d`

## 获取 uid

登录哔哩哔哩后前往[https://space.bilibili.com/](https://space.bilibili.com/)页面，网址最后的一串数字就是 `uid`

***需要将追番列表设置为公开！***

## 示例

![示例图片](https://github.com/HCLonely/hexo-bilibili-bangumi/raw/master/example.png)

## 手动添加番剧/追剧数据
因为某些番剧在哔哩哔哩上没有，但是又想在hexo中展示，怎么办呢？现在支持手动添加番剧数据了！

在 `sources/_data/` 目录下新建文件，命名为 `extra_bangumis.json`(追番数据)或`extra_cinemas.json`(追剧数据) ，并添加以如下内容:
```json
{
  "watchedExtra": [
    {
      "title": "缘之空",
      "type": "番剧",
      "area": "日本",
      "cover": "https://cdn.jsdelivr.net/gh/mmdjiji/bangumis@main/Yosuga-no-Sora/cover.jpg",
      "totalCount": "全12话",
      "id": 0,
      "follow": "不可用",
      "view": "不可用",
      "danmaku": "不可用",
      "coin": "不可用",
      "score": "不可用",
      "des": "远离都市的田园小镇，奥木染。春日野悠带着妹妹穹，来到了这座城镇。坐落在这里的是，儿时暑假经常造访的充满回忆的已故祖父的家。双亲因意外事故而丧生，变得无依无靠..."
    }
  ]
}
```

`title` 是番剧的标题，`cover` 是封面图链接， `des` 是简介，上述字段均根据需要修改。

另外除了 `watchedExtra` 数组，还可以在后面添加新的数组，可用数组名如下:

|可用数组名|含义|
|-|-|
|wantWatchExtra|想看|
|watchingExtra|在看|
|watchedExtra|看过|

需要注意，在两个数组之间需要用 `,` 分隔。

## Lisense

[Apache Licence 2.0](https://github.com/HCLonely/hexo-bilibili-bangumi/blob/master/LICENSE)
