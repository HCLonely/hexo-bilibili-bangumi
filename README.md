# hexo-bilibili-bangumi

[![npm](https://nodei.co/npm/hexo-bilibili-bangumi.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/hexo-bilibili-bangumi)
[![NPM version](https://img.shields.io/npm/v/hexo-bilibili-bangumi.svg)](https://www.npmjs.com/package/hexo-bilibili-bangumi)
[![NPM Downloads](https://img.shields.io/npm/dm/hexo-bilibili-bangumi.svg)](https://www.npmjs.com/package/hexo-bilibili-bangumi)
[![GitHub license](https://img.shields.io/github/license/HCLonely/hexo-bilibili-bangumi)](https://github.com/HCLonely/hexo-bilibili-bangumi/blob/master/LICENSE)

## 💡 介绍

为 Hexo 博客添加追番/追剧页面。

- ✨ 支持多个数据源（哔哩哔哩、Bangumi、AniList、Simkl）
- 🎨 支持自定义样式
- 🚀 支持图片懒加载
- 📊 支持进度展示
- 🔄 支持数据自动更新
- 📱 响应式设计
- 🖼️ 支持图片镜像缓存
- 📄 支持手动添加数据

[效果预览](https://demo.hclonely.com/bangumis/)

## 📦 安装

```bash
npm install hexo-bilibili-bangumi --save
```

## ⚙️ 配置

### 基础配置

将以下配置写入站点的配置文件 `_config.yml` 中（不是主题的配置文件）：

```yaml
bangumi: # 追番设置
  enable: true           # 是否启用
  source: bili          # 数据源
  path: bangumis/index.html  # 页面路径
  vmid:                 # 用户ID
  title: '追番列表'      # 页面标题
  quote: '生命不息，追番不止！' # 页面引言
  show: 1              # 初始显示页面: 0=想看, 1=在看, 2=看过
  lazyload: true       # 是否启用图片懒加载
  metaColor:           # meta 信息字体颜色
  color:               # 简介字体颜色
  webp: true          # 是否使用 webp 格式图片
  progress: true      # 是否显示进度条
  ...
cinema: # 追剧设置
  enable: true           # 是否启用
  source: bili
  ...
game: # 游戏设置，仅支持source: bgmv0
  enable: true           # 是否启用
  source: bgmv0
  ...
```

<details>
<summary>详细配置</summary>

``` yaml
bangumi: # 追番设置
  enable: true
  source: bili
  bgmInfoSource: 'bgmv0'
  path:
  vmid:
  title: '追番列表'
  quote: '生命不息，追番不止！'
  show: 1
  lazyload: true
  srcValue: '__image__'
  # lazyloadAttrName: 'data-src=__image__' # 已弃用
  # loading: 已弃用
  showMyComment: false
  pagination: false
  metaColor:
  color:
  webp:
  progress:
  progressBar:
  extraOrder:
  order: latest
  proxy:
    host: '代理host'
    port: '代理端口'
  extra_options:
    key: value
  coverMirror:
cinema: # 追剧设置
  enable: true
  path:
  vmid:
  title: '追剧列表'
  quote: '生命不息，追剧不止！'
  show: 1
  lazyload: true
  srcValue: '__image__'
  metaColor:
  color:
  webp:
  progress:
  progressBar:
  extraOrder:
  order:
  extra_options:
    key: value
  coverMirror:
game: # 游戏设置，仅支持source: bgmv0
  enable: true
  path:
  source: bgmv0
  vmid:
  title: '游戏列表'
  quote: '生命不息，游戏不止！'
  show: 1
  lazyload: true
  srcValue: '__image__'
  metaColor:
  color:
  webp:
  progress:
  progressBar:
  extraOrder:
  order:
  extra_options:
    key: value
  coverMirror:
```

</details>

### 详细参数说明

#### 基础参数

| 参数名 | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| enable | boolean | false | 是否启用该功能 |
| source | string | 'bili' | 数据源选择。`bili`: [哔哩哔哩源](https://www.bilibili.com/), `bgmv0`: [Bgm Api源(api.bgm.tv)](https://bgm.tv/), `bangumi`: [Bangumi源(bangumi.tv)](https://bangumi.tv/), `bgm`: [Bangumi源(bgm.tv)](https://bgm.tv/), `anilist`: [AniList源](https://anilist.co/), `simkl`: [Simkl源](https://simkl.com/) |
| path | string | 'bangumis/index.html' | 生成页面的路径 |
| vmid | string/number | - | 用户Id。[如何获取](#-获取用户-id) |
| title | string | '追番列表' | 页面标题 |
| quote | string | '生命不息，追番不止！' | 页面顶部的引言，支持HTML |

#### 显示控制

| 参数名 | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| show | number | 1 | 初始显示的内容类型：0=想看，1=在看，2=看过 |
| lazyload | boolean | true | 是否启用图片懒加载，可避免首次加载时间过长 |
| srcValue | string | '\_\_image\_\_' | 设置封面图的默认src值，`__image__`为封面链接，`__loading__`为loading图片链接 |
| metaColor | string | - | meta信息的字体颜色，支持CSS颜色值（如'#FFFFFF'） |
| color | string | - | 简介文字的字体颜色 |

#### 图片处理

| 参数名 | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| webp | boolean | true | 是否使用webp格式图片（仅支持哔哩哔哩源，可大幅减小图片体积） |
| coverMirror | string | - | 封面图片镜像服务地址，用于解决防盗链、跨域等问题([图片镜像服务](#图片镜像服务)) |

#### 进度显示

| 参数名 | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| progress | boolean | true | 是否显示数据获取进度条 |
| progressBar | boolean | true | 是否在追番页面显示观看进度条（仅支持bili和bgmv0源） |

#### 数据处理

| 参数名 | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| pagination | boolean | false | 是否启用分页优化，建议番剧数量较多时启用 |
| order | string | - | 排序方式：score=评分升序，-score=评分降序 ，其他=默认顺序|
| extraOrder | number | - | 手动添加数据的显示顺序：1=优先显示，其他=默认顺序 |
| showMyComment | boolean | false | 是否显示个人评论（仅支持bgm、anilist源） |

#### 代理设置

| 参数名 | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| proxy.host | string | - | 代理服务器地址 |
| proxy.port | number | - | 代理服务器端口 |

#### 扩展选项

| 参数名 | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| extra_options | object | - | 扩展配置，会被注入到Hexo的page变量中 |
| bgmInfoApi | string | 'bgmApi' | Bangumi信息源：`bgmApi`: [Bangumi Api](https://github.com/bangumi/api/), `bgmSub`: [Bangumi-Subject](https://github.com/czy0729/Bangumi-Subject) |

### 图片镜像服务

当遇到图片加载失败（403错误）或加载缓慢时，可以配置 `coverMirror` 使用镜像服务：

```yaml
coverMirror: 'https://image.baidu.com/search/down?url='  # 示例配置
```

推荐的镜像服务地址：

```text
https://image.baidu.com/search/down?url=     # 百度镜像（限制5MB）
https://images.weserv.nl/?url=               # Weserv
https://pic1.xuehuaimg.com/proxy/            # 雪花镜像
https://search.pstatic.net/common?src=       # Naver镜像
```

## 🚀 使用方法

### 更新数据

在生成或部署博客之前，需要更新追番/追剧数据：

```bash
# 更新追番数据
hexo bangumi -u

# 使用 bili 源时显示追番进度（需要 SESSDATA）
hexo bangumi -u 'your_sessdata_here'

# 更新追剧数据
hexo cinema -u

# 更新游戏数据
hexo game -u
```

### 删除数据

```bash
# 删除追番数据
hexo bangumi -d

# 删除追剧数据
hexo cinema -d

# 删除游戏数据
hexo game -d
```

## 📝 手动添加数据

在 `source/_data/` 目录下创建 `extra_bangumis.json`（追番）或 `extra_cinemas.json`（追剧）：

```json
{
  "watchedExtra": [
    {
      "title": "番剧标题",
      "type": "番剧",
      "area": "日本",
      "cover": "封面图片链接",
      "totalCount": "全12话",
      "link": "https://example.com/xxx",
      "des": "简介内容..."
    }
  ]
}
```

可用数组名：

- `wantWatchExtra`: 想看
- `watchingExtra`: 在看
- `watchedExtra`: 看过

## 🔍 获取用户 ID

<details>
<summary>哔哩哔哩 UID</summary>

1. 登录 [哔哩哔哩](https://www.bilibili.com/)
2. 访问 [个人空间](https://space.bilibili.com/)
3. 网址最后的数字即为 UID
4. **注意：** 需要将追番列表设为公开

</details>

<details>
<summary>Bangumi 用户名</summary>

1. 登录 [Bangumi](https://bangumi.tv/)
2. 打开控制台 (Ctrl + Shift + J)
3. 输入：

```javascript
document.getElementById('header').getElementsByTagName('a')[0].getAttribute('href').split('/').at(-1)
```

</details>

<details>
<summary>Bangumi 用户 ID</summary>

1. 登录 [Bangumi](https://bangumi.tv/)
2. 打开控制台 (Ctrl + Shift + J)
3. 输入：

```javascript
CHOBITS_UID
```

</details>

<details>
<summary>AniList ID</summary>

1. 登录 [AniList](https://anilist.co/home)
2. 打开控制台 (Ctrl + Shift + J)
3. 输入：

```javascript
JSON.parse(window.localStorage.getItem('auth')).id
```

</details>

<details>
<summary>Simkl Token</summary>

1. 登录 [Simkl](https://simkl.com/)
2. 创建一个App: [https://simkl.com/settings/developer/new/](https://simkl.com/settings/developer/new/)
3. `Name`和`Description`随便填，`Redirect URI`填写`127.0.0.1`
4. 创建App后记住`Client ID`和`Client Secret`
5. 打开`https://simkl.com/oauth/authorize?response_type=code&client_id={your_client_id}&redirect_uri=http://127.0.0.1`，注意把`{your_client_id}`改成你的`Client ID`
6. 授权后会跳转到`127.0.0.1/?code=your_code`，记住`your_code`
7. 打开`https://simkl.docs.apiary.io/#reference/authentication-oauth-2.0/exchange-code-for-access_token?console=1`，找到右侧的`Body`并点击。修改如下

```json
{
    "code"          : "你的code",
    "client_id"     : "你的Client ID",
    "client_secret" : "你的Client Secret",
    "redirect_uri"  : "127.0.0.1",
    "grant_type"    : "authorization_code"
}
```

8. 修改后点击右下角的`Call Resource`按钮，然后拉到最下面，右下角找到`"access_token": "your_token",`，记住`your_token`
9. `vmid`填入`{your_client_id}-{your_token}`，`{your_client_id}`替换为App的`Client ID`，`{your_token}`替换为上一步得到的`your_token`

</details>

## 🎨 主题适配

1. Fork 本项目并克隆到本地
2. 安装依赖：`npm install`
3. 在 `src/lib/templates/theme/` 添加主题样式文件
4. 运行 `npm run build`
5. 提交 PR

## 📄 开源协议

[Apache License 2.0](./LICENSE)
