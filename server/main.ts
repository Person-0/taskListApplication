// External Deps
import express from "express";
import { Client } from 'pg';
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";

// Local Deps
import { QueryExecutor, User } from "./queries";
import { authTokenManager, tokenRecord } from "./tempAuthTokens";
import { UUID } from "crypto";

dotenv.config();

const app = express();
const _bcryptRounds = parseInt(process.env.bcrypt_hrounds || "5");

const client = new Client({
    connectionString: process.env.postregConStr,
    ssl: true // connection fails without this (econnreset)
});
const queries = new QueryExecutor(client, process.env.userDataTable as string);
const authTokens = new authTokenManager();

main().catch(r => console.log("main() encountered ", r));

function log(...stuff: any[]) {
    console.log("[SERVER] ", ...stuff);
}

// simple cookie reader
function readCookies(cookiesStr: string): Record<string, string> {
    let cookies: any = false;
    try {
        cookies = cookiesStr.split(";");
        cookies = cookies.map((e: string) => e.split("="));
        cookies = Object.fromEntries(cookies);
    } catch {
        cookies = false;
    }
    if (typeof cookies === "object") {
        return cookies;
    } else {
        return {};
    }
}

function authorizeTokenFromCookies(
    req: express.Request,
    res: express.Response
) {
    const cookies = readCookies(req.headers["cookie"] || "");
    if (cookies.auth) {
        try {
            const [token, uid_str] = cookies.auth.split(",");
            const uid = parseInt(uid_str);
            if (authTokens.authorizeToken(uid, token as UUID)) {
                return authTokens._findByUid(uid) as tokenRecord;
            }
        } catch (e) { }
    }
    res.send("unauthorized");
    return false;
}

function ensureQuery(
    req: express.Request,
    res: express.Response,
    params: string[]
) {
    if (req.query) {
        let queryData: Record<string, string> = {};
        let success = true;
        for (const param of params) {
            if (req.query[param]) {
                queryData[param] = req.query[param] as string;
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
    )
    return false;
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
    })

    app.get("/authorize", async (req, res): Promise<any> => {
        const queryData = ensureQuery(req, res, ["username", "password", "authType"]);
        if (queryData) {

            const usernameExists = await queries.doesUsernameExist(queryData.username);

            if (queryData.authType === "0") {
                // login

                if (!usernameExists) {
                    return res.send(JSON.stringify({
                        error: true,
                        message: "username does not exist"
                    }));
                }

                let userData: any = await queries.getUserData("username", queryData.username);
                if (userData) {
                    if (bcrypt.compareSync(queryData.password, userData.password)) {
                        delete userData.password;
                        res.cookie("auth", authTokens.getTokenCookieString(userData.uid));
                        return res.send(JSON.stringify({
                            error: false,
                            ...userData
                        }));
                    } else {
                        return res.send(JSON.stringify({
                            error: true,
                            message: "invalid password"
                        }));
                    }
                }

                return res.send(JSON.stringify({
                    error: true,
                    message: "unknown error"
                }));

            } else if (queryData.authType === "1") {
                // register

                if (usernameExists) {
                    return res.send(JSON.stringify({
                        error: true,
                        message: "username already exists"
                    }));
                }

                const userData: any = await queries.addUser(
                    queryData.username, 
                    bcrypt.hashSync(queryData.password, _bcryptRounds)
                );
                if (userData.password) {
                    delete userData.password;
                }

                res.cookie("auth", authTokens.getTokenCookieString(userData.uid));
                return res.send(JSON.stringify({
                    error: false,
                    ...userData
                }));
            }
        }
    })

    app.get("/getMyData", async (req, res) => {
        const authResult = authorizeTokenFromCookies(req, res);
        if (!authResult) return;
        const result: any = await queries.getUserData("uid", authResult.uid);
        if (result?.password) {
            delete result.password;
        }
        res.send(JSON.stringify(result));
    })

    log("starting API server...");
    app.listen(process.env.API_PORT, () => {
        log("listening on port", process.env.API_PORT);
    })
}