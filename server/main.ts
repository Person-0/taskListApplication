// External Deps
import express from "express";
import { Client } from 'pg';
import * as dotenv from "dotenv";

// Local Deps
import { QueryExecutor } from "./queries";

dotenv.config();

const app = express();

const client = new Client({
    connectionString: process.env.postregConStr,
    ssl: true // connection fails without this (econnreset)
});
const queries = new QueryExecutor(client, process.env.userDataTable as string);

main().catch(r => console.log("main() encountered ", r));

function log(...stuff: any[]) {
    console.log("[SERVER] ", ...stuff);
}

async function main(){
    log("connecting...");
    await client.connect();
    log("connected to db");

    log("ensuring userdata table exists...");
    await queries.ensureUserdataTable();

    log("finished.");

    app.get("/", (req, res) => {
        res.send("hell0 w0rld.");
    })

    app.get("/getUserData", async (req, res) => {
        const query = ensureQuery(req, res, ["uid"]);
        if(query) {
            const result: any = await queries.getUserData(parseInt(query.uid));
            if(result?.password){
                delete result.password;
            }
            res.send(JSON.stringify(result));
        }
    })

    log("starting API server...");
    app.listen(process.env.API_PORT, () => {
        log("listening on port", process.env.API_PORT);
    })

    function ensureQuery(
        req: express.Request, 
        res: express.Response, 
        params: string[]
    ) {
        if(req.query){
            let queryData: Record<string, string> = {};
            let success = true;
            for(const param of params){
                if(req.query[param]) {
                    queryData[param] = req.query[param] as string;
                } else {
                    success = false;
                    break;
                }
            }
            if(success) {
                return queryData;
            }
        }
        res.send(
            JSON.stringify({
                error: true,
                message: "ensureQuery failed"
            })
        )
        return false;
    }
}