const mysql = require("mysql"),
  dbInfo = {
    host: "dmu-pino.ckct8n4nimnj.ap-northeast-2.rds.amazonaws.com",
    port: "3306",
    user: "root",
    password: "qwer1595",
    database: "gamza",
  },
  pool = mysql.createPool(dbInfo)

module.exports = (callback) => {
  pool.getConnection((err, conn) => {
    if (!err) {
      callback(conn)
    }
  })
}
