const mysql = require("mysql");
const { promisify } = require("util");

const { database } = require("./keys.js");

const pool = mysql.createPool(database);

pool.getConnection((err, conexion) => {
  if (err) {
    console.log(err.code);
  }

  if (conexion) {
    conexion.release();
    console.log("Database connected succesfully.");
  }

  return;
});

pool.query = promisify(pool.query);

module.exports = pool;
