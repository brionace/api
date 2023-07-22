const mysql = require("mysql2/promise");
const config = require("../config");

async function query(sql, params) {
  const connection = await mysql.createConnection(config.db);
  const [results] = await connection.execute(sql, params);

  connection.connect(function (err) {
    if (err) {
      console.log("!!! Cannot connect !!! Error:");
      throw err;
    } else {
      console.log("Connection established.");
      queryDatabase();
    }
  });

  return results;
}

module.exports = {
  query,
};
