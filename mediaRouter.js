const router = require("express").Router()
const multiparty = require("multiparty")
const url = require("url")
const fs = require("fs")
const BUCKET_NAME = 'bucket-h3v3bu' // Bucket 이름
const BUCKET_URL = 'bucket-h3v3bu.s3.ap-northeast-2.amazonaws.com' // Bucket 도메인
AWS.config.update({
    region:         'ap-northeast-2',
    accessKeyId:    'AKIATIIKUHVXRN7EW2MV', // 엑세스 키 ID
    secretAccessKey:'0/00kRKGuHR16RHFljQJXgvgrzBUCh7FID7ZMupx' // 엑세스 키
})

router.get("/*", (req, res) => {
  const { pathname } = url.parse(req.url, true)
  const filepath = `https://${BUCKET_URL}/video${pathname}`

  const stat = fs.statSync(filepath)
  const fileSize = stat.size
  const range = req.headers.range
  console.log(range)

  if (!range) {
    const header = { "Content-Type": "video/mp4" }
    res.writeHead(200, header)
    res.end()
  } else {
    const MAX_CHUNK_SIZE = 1000 * 1000 * 50
    // ranage헤더 파싱
    const parts = range.replace(/bytes=/, "").split("-")
    // 재생 구간 설정
    const start = parseInt(parts[0], 10)
    const _end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const end = Math.min(_end, start + MAX_CHUNK_SIZE - 1)

    const header = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Type": "video/mp4",
      "Content-Length": fileSize - 1,
    }
    res.writeHead(206, header)
    const readStream = fs.createReadStream(filepath, { start, end })
    readStream.pipe(res)
  }
})
router.post("/", (req, res) => {
  const form = new multiparty.Form()
  form.on("error", (err) => res.status(500).end())
  form.on("part", (part) => {
    // file이 아닌 경우 skip
    if (!part.filename) return part.resume()

    const filename = part.filename // 버킷에 올라갈 디렉토리+파일의 이름
    const params = { Bucket:BUCKET_NAME, Key:filename, Body:part, ContentType: 'image' }
    const upload = new AWS.S3.ManagedUpload({ params });
    upload.promise()
    
  })
  form.on("close", () => res.end())
  form.parse(req)
})

module.exports = router
