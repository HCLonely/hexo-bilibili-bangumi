# hexo-bilibili-bangumi

![](https://nodei.co/npm/hexo-bilibili-bangumi.png?downloads=true&downloadRank=true&stars=true)

## 介绍

&#160;&#160;&#160;&#160;**为Hexo添加哔哩哔哩番剧页面，参考了[hexo-douban](https://github.com/mythsman/hexo-douban)的部分代码**

## 安装

```bash
$ npm install hexo-bilibili-bangumi --save
```

------------

## 配置

将下面的配置写入站点的配置文件 `_config.yml` 里(不是主题的配置文件).

``` yaml
bangumi:
  enable: true 
  vmid: 
  title: '追番列表'
  quote: '生命不息，追番不止！'
  loading: '/img/bangumi-loading.gif'
```

- **enable**: 是否启用
- **vmid**: 哔哩哔哩番剧页面的 `vmid(uid)` (),[如何获取？](#获取uid)
- **title**: 该页面的标题
- **quote**: 写在页面开头的一段话,支持html语法
- **loading**: 图片加载完成前的loading图片

##使用

1. 前往你的 Hexo 博客的根目录
2. 输入`hexo new page bangumis` (`bangumis可任意替换`)
3. 你会找到`source/bangumis/index.md`这个文件
4. 修改这个文件，添加`type: "bangumis"`：
```markdown
---
title: bangumis
date: 2018-01-05 00:00:00
type: "bangumis"
---
```

##获取uid

登录哔哩哔哩后前往[https://space.bilibili.com/](https://space.bilibili.com/)页面，网址最后的一串数字就是 `uid`
