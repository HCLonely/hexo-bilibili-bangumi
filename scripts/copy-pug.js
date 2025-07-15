/*
 * @Author       : HCLonely
 * @Date         : 2025-07-09 14:21:45
 * @LastEditTime : 2025-07-09 14:24:44
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/scripts/copy-pug.js
 * @Description  : 模板文件复制脚本，用于将src/lib/templates目录下的.pug模板文件
 *                 复制到lib/templates目录，保持项目构建后的模板文件完整性。
 */
const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'src', 'lib', 'templates');
const targetDir = path.join(__dirname, '..', 'lib', 'templates');
const files = fs.readdirSync(templatesDir);

// 找到所有的 .pug 文件
const pugFiles = files.filter((file) => file.endsWith('.pug'));

// 将所有 .pug 文件复制到到 targetDir
pugFiles.forEach((file) => {
  fs.cpSync(path.join(templatesDir, file), path.join(targetDir, file), { recursive: true });
});

console.log('Successfully copied pug files to targetDir');
