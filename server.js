require('dotenv').config()

const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')

const API_KEY = process.env.API_KEY
const API_ENDPOINT = process.env.API_ENDPOINT

console.log('API_ENDPOINT: ', API_ENDPOINT)

// 添加 MIME 类型映射
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript'
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // 处理静态文件请求
  if (req.method === 'GET') {
    let filePath = path.join(
      __dirname,
      req.url === '/' ? 'index.html' : req.url
    )
    const extname = path.extname(filePath)
    const contentType = MIME_TYPES[extname] || 'text/plain'

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404)
        res.end('File not found')
        return
      }
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content)
    })
    return
  }

  if (req.method === 'POST' && req.url === '/generate-names') {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk.toString()
    })

    req.on('end', () => {
      const { englishName } = JSON.parse(body)

      const prompt = `作为一个专业的中文起名专家，请为英文名"${englishName}"生成3个富有中国文化特色的中文名。
            每个名字都应该包含以下信息：
            1. 中文名
            2. 中文含义解释
            3. 英文含义解释
            请用JSON格式返回，格式如下：
            {
                "names": [
                    {
                        "chinese": "中文名",
                        "chineseMeaning": "中文含义",
                        "englishMeaning": "英文含义"
                    }
                ]
            }`

      const requestData = JSON.stringify({
        model: 'deepseek-r1-250120',
        messages: [
          { role: 'system', content: '你是一个专业的中文起名专家。' },
          { role: 'user', content: prompt }
        ]
      })

      const options = {
        hostname: API_ENDPOINT,
        path: '/api/v3/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`
        },
        timeout: 60000 // 60秒超时
      }

      const apiReq = https.request(options, (apiRes) => {
        let data = ''

        apiRes.on('data', (chunk) => {
          data += chunk
        })

        apiRes.on('end', () => {
          try {
            const response = JSON.parse(data)

            if (response.error) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(
                JSON.stringify({ error: response.error.message || 'API Error' })
              )
              return
            }

            let content = response.choices[0].message.content
            const jsonStart = content.indexOf('{')
            const jsonEnd = content.lastIndexOf('}') + 1

            if (jsonStart === -1 || jsonEnd === 0) {
              throw new Error('No valid JSON found in response')
            }

            content = content.slice(jsonStart, jsonEnd)
            const names = JSON.parse(content)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(names))
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(
              JSON.stringify({
                error: `Failed to process API response: ${error.message}`
              })
            )
          }
        })
      })

      apiReq.on('error', (error) => {
        console.error('Request error:', error) // 打印请求错误
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({ error: `Failed to call API: ${error.message}` })
        )
      })

      apiReq.on('timeout', () => {
        apiReq.destroy()
        res.writeHead(504, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Request timeout' }))
      })

      apiReq.write(requestData)
      apiReq.end()
    })
  } else {
    res.writeHead(404)
    res.end()
  }
})

const PORT = 3000
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
