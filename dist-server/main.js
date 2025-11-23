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
  addUser(username, password, tasksdata = "[]") {
    return `insert into userdata (username, password, tasksdata) values ('${username}', '${password}', '${tasksdata}');`;
  }
  getAllUsers() {
    return `select * from userdata;`;
  }
  getUserData(uid) {
    return `select * from userdata where uid = ${uid};`;
  }
};

// server/main.ts
dotenv.config();
var client = new Client({
  connectionString: process.env.postregConStr,
  ssl: true
});
async function main() {
  await client.connect();
  console.log("[SUCCESS] connected to db");
  const queries = new QueryBuilder("userdata");
  console.log(await client.query(queries.getUserData(1)));
  return;
  const app = express();
  app.get("/", (req, res) => {
    res.send("hello world");
  });
  app.listen(process.env.PORT, () => {
    console.log("[SERVER] listening on port", process.env.PORT);
  });
}
main().catch((r) => {
  console.log("main() encountered ", r);
});
