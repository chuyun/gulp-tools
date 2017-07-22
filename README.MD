##　前端开发环境搭建工具 -- gulp 版本

### 自动化流程工具
   开发环境：使用 gulp dev-less 或者 gulp dev-sass  ==> 搭建本地服务器[监测文件变化,自动编译,压缩,刷新页面,搭建本地服务器]
   
   生产环境：
   (1) 使用 gulp less ==> 编译Less文件  gulp sass ==> 编译sass文件
   (2) 使用 gulp minify-css ==> 压缩css文件到 dist 目录下
  （3）使用 gulp product-less 或 gulp product-sass 结合以上两个步骤