// server/main.ts
import express from "express";
import { Client } from "pg";
import * as dotenv from "dotenv";

// server/queries.ts
var QueryBuilder = class {
  tablename;
  constructor(tablename) {
    this.tablename = tablename;
  }
  getTables() {
    return `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';`;
  }
  getMaxUID() {
    return `SELECT MAX(uid) FROM ${this.tablename};`;
  }
  addUser(username, password, tasksdata = "[]") {
    return `insert into ${this.tablename} (username, password, tasksdata) values ('${username}', '${password}', '${tasksdata}');`;
  }
  getAllUsers() {
    return `select * from ${this.tablename};`;
  }
  getUserData(uid) {
    return `select * from ${this.tablename} where uid = ${uid};`;
  }
};
var QueryExecutor = class {
  queryBuilder;
  client;
  constructor(client2, tableName) {
    this.queryBuilder = new QueryBuilder(tableName);
    this.client = client2;
  }
  async ensureUserdataTable() {
    const result = await this.client.query(this.queryBuilder.getTables());
    if (this._validateArray(result.rows)) {
      if (result.rows.map((e) => e.tablename || "").includes(this.queryBuilder.tablename)) {
        return true;
      } else {
        console.log(result.rows);
      }
    }
    console.log("ERROR! " + this.queryBuilder.tablename + " does not exist in the database!");
    return false;
  }
  async getAllUsers() {
    const result = await this.client.query(this.queryBuilder.getAllUsers());
    if (this._validateArray(result.rows)) {
      return result.rows;
    }
    return [];
  }
  async getUserData(uid) {
    const result = await this.client.query(this.queryBuilder.getUserData(uid));
    if (this._validateArray(result.rows)) {
      if (!(result.rows.length === 1)) {
        console.warn("POSSIBLE DUPLICATE UID!! getUserData(): result.rows has length > 1");
      }
      return result.rows[0];
    }
    return null;
  }
  async addUser(username, password, tasksdata = "[]") {
    let nextUID = 0;
    const result_maxuid = await this.client.query(this.queryBuilder.getMaxUID());
    if (this._validateArray(result_maxuid.rows)) {
      if (result_maxuid.rows[0] && result_maxuid.rows[0].max) {
        nextUID = parseInt(result_maxuid.rows[0].max) + 1;
      }
    }
    await this.client.query(
      this.queryBuilder.addUser(username, password, tasksdata)
    );
    return await this.getUserData(nextUID);
  }
  _validateArray(e) {
    if (typeof e === "object" && Array.isArray(e)) {
      return true;
    } else {
      console.warn("last query's result.rows does not exist as an array");
    }
    return false;
  }
};

// server/main.ts
dotenv.config();
var app = express();
var client = new Client({
  connectionString: process.env.postregConStr,
  ssl: true
  // connection fails without this (econnreset)
});
var queries = new QueryExecutor(client, process.env.userDataTable);
main().catch((r) => console.log("main() encountered ", r));
function log(...stuff) {
  console.log("[SERVER] ", ...stuff);
}
async function main() {
  log("connecting...");
  await client.connect();
  log("connected to db");
  log("ensuring userdata table exists...");
  await queries.ensureUserdataTable();
  log("finished.");
  app.get("/", (req, res) => {
    res.send("hell0 w0rld.");
  });
  app.get("/getUserData", async (req, res) => {
    const query = ensureQuery(req, res, ["uid"]);
    if (query) {
      const result = await queries.getUserData(parseInt(query.uid));
      if (result?.password) {
        delete result.password;
      }
      res.send(JSON.stringify(result));
    }
  });
  log("starting API server...");
  app.listen(process.env.API_PORT, () => {
    log("listening on port", process.env.API_PORT);
  });
  function ensureQuery(req, res, params) {
    if (req.query) {
      let queryData = {};
      let success = true;
      for (const param of params) {
        if (req.query[param]) {
          queryData[param] = req.query[param];
        } else {
          success = false;
          break;
        }
      }
      if (success) {
        return queryData;
      }
    }
    res.send(
      JSON.stringify({
        error: true,
        message: "ensureQuery failed"
      })
    );
    return false;
  }
}
