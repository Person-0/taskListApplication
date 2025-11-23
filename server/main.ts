// External Deps
import express from "express";
import { Client } from 'pg';
import * as dotenv from "dotenv";

// Local Deps
import { QueryBuilder } from "./queries";

dotenv.config();

const client = new Client({
    connectionString: process.env.postregConStr,
    ssl: true
});

async function main(){
    await client.connect();
    console.log("[SUCCESS] connected to db");

    const queries = new QueryBuilder("userdata");
    console.log(await client.query(queries.getUserData(1)));

    return;

    const app = express();

    app.get("/", (req, res) => {
        res.send("hello world");
    })

    app.listen(process.env.PORT, () => {
        console.log("[SERVER] listening on port", process.env.PORT);
    })
}

main().catch((r)=>{console.log("main() encountered ", r)});