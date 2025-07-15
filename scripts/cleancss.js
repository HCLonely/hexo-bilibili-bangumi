/*
 * @Author       : HCLonely
 * @Date         : 2025-07-09 19:43:28
 * @LastEditTime : 2025-07-09 20:37:37
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/scripts/cleancss.js
 * @Description  : CSS压缩脚本，使用clean-css库将源CSS文件压缩优化，
 *                 包括模板样式和主题样式文件，压缩等级设置为2级（最高级别）。
 */

const CleanCSS = require('clean-css');
const fs = require('fs');

const cssFiles = [
  {
    from: 'src/lib/templates/index.css',
    to: 'lib/templates/index.css'
  },
  {
    from: 'src/lib/templates/theme/fluid.css',
    to: 'lib/templates/theme/fluid.min.css'
  },
  {
    from: 'src/lib/templates/theme/nexmoe.css',
    to: 'lib/templates/theme/nexmoe.min.css'
  }
];

cssFiles.forEach((file) => {
  const input = fs.readFileSync(file.from, 'utf-8');
  const options = {
    level: 2
  };
  const output = new CleanCSS(options).minify(input);

  fs.writeFileSync(file.to, output.styles);
});
