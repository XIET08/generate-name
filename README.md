# Chinese Name Generator ![Version](https://img.shields.io/badge/version-0.1-blue)

这是一个基于AI的中文姓名生成器，可以根据英文名生成具有中国文化特色的中文名字。项目采用现代化的Web技术栈，提供直观的用户界面，让用户能够轻松获得富有文化内涵的中文名字。

## 功能特点

- 根据英文名生成对应的中文名
- 每个名字都包含详细的中英文含义解释
- 简洁美观的用户界面
- 响应式设计，支持移动端访问

## 技术栈

- 前端：HTML, CSS, JavaScript
- 后端：Node.js
- API：DeepSeek AI API

## 本地开发

1. 克隆项目到本地
2. 创建 `.env` 文件，配置以下环境变量：
   ```
   API_KEY=your_api_key
   API_ENDPOINT=your_api_endpoint
   ```
3. 安装依赖：`npm install`
4. 启动服务器：`node server.js`
5. 访问 `http://localhost:3000`

## 部署

项目已配置好 Vercel 部署文件，可以直接部署到 Vercel 平台。

## 许可证

MIT

## 更新日志

### v0.1
- 初始版本发布
- 实现基本的英文名到中文名的转换功能
- 集成DeepSeek AI API进行智能名字生成
- 支持响应式界面设计
- 添加用户友好的加载动画和提示