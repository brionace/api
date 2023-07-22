const db = require("./db");
const helper = require("../helper");
const config = require("../config");

async function getMultiple(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT id, name, description 
    FROM work RIGHT JOIN images ON work.imagesId=images.workId LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  console.log(rows);

  return {
    data,
    meta,
  };
}

async function createWork() {
  await db.query("DROP TABLE IF EXISTS work;", function (err, results, fields) {
    if (err) throw err;
    console.log("Dropped work table, it existed.");
  });
  const connected = await db.query(
    "CREATE TABLE work (id serial PRIMARY KEY NOT NULL auto_increment, name text, description text, updated timestamp NOT NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP);",
    function (err, results, fields) {
      if (err) throw err;
      console.log("Created work table.");
    }
  );
  const inserted = await db.query(
    "INSERT INTO work (name, description) VALUES (?, ?);",
    ["Woo! My first work post", "Gotta delete it!"],
    function (err, results, fields) {
      if (err) throw err;
      else console.log("Inserted " + results.affectedRows + " row(s).");
    }
  );
  await db.end(function (err) {
    if (err) throw err;
    else console.log("Work table created.");
  });

  return {
    connected,
    inserted,
  };
}

module.exports = {
  getMultiple,
  createWork,
};
