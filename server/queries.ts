import { Client, QueryResult } from "pg";

interface User {
    uid: number;
    username: string;
    password: string;
    tasksdata: string;
}

class QueryBuilder {
    tablename: string;
    constructor(tablename: string) {
        this.tablename = tablename;
    }

    getTables() {
        return `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';`
    }

    getMaxUID() {
        return `SELECT MAX(uid) FROM ${this.tablename};`
    }

    addUser(username: string, password: string, tasksdata: string = "[]") {
        return `insert into ${this.tablename} (username, password, tasksdata) values ('${username}', '${password}', '${tasksdata}');`;
    }

    getAllUsers() {
        return `select * from ${this.tablename};`;
    }

    getAllUsernames() {
        return `select username from ${this.tablename};`;
    }

    getAllUIDs() {
        return `select uid from ${this.tablename};`;
    }

    getUserDataUID(uid: number) {
        return `select * from ${this.tablename} where uid = ${uid};`;
    }

    getUserDataUsername(username: string) {
        return `select * from ${this.tablename} where username = '${username}';`;
    }

    setUserTasks(uid: number, tasksdata: string) {
        return `update ${this.tablename} set tasksdata = '${tasksdata}' where uid = ${uid}`;
    }
}

class QueryExecutor {
    queryBuilder: QueryBuilder;
    client: Client;

    constructor(client: Client, tableName: string) {
        this.queryBuilder = new QueryBuilder(tableName);
        this.client = client;
    }

    async ensureUserdataTable() {
        const result = await this.client.query(this.queryBuilder.getTables());
        if (this._validateArray(result.rows)) {
            if (result.rows.map(e => e.tablename || "").includes(this.queryBuilder.tablename)) {
                return true;
            } else {
                console.log(result.rows);
            }
        }
        // TODO: create the table if it does not exist
        console.log("ERROR! " + this.queryBuilder.tablename + " does not exist in the database!");
        return false;
    }

    async getAllUsers() {
        const result = await this.client.query(this.queryBuilder.getAllUsers());
        if (this._validateArray(result.rows)) {
            return result.rows as User[];
        }
        return [];
    }

    async doesUsernameExist(username: string) {
        const result = await this.client.query(this.queryBuilder.getAllUsernames());
        let exists = false;
        if (this._validateArray(result.rows)) {
            for (const row of result.rows) {
                if (row && row.username && row.username === username) {
                    exists = true;
                    break;
                }
            }
        }
        return exists;
    }

    async doesUIDExist(uid: number) {
        const result = await this.client.query(this.queryBuilder.getAllUIDs());
        let exists = false;
        if (this._validateArray(result.rows)) {
            for (const row of result.rows) {
                if (row && row.uid && parseInt(row.uid) === uid) {
                    exists = true;
                    break;
                }
            }
        }
        return exists;
    }

    async getUserData(from: 'uid' | 'username', uid_or_username: number | string) {
        let result: QueryResult<any> | undefined;
        if (from == "uid") {
            result = await this.client.query(this.queryBuilder.getUserDataUID(uid_or_username as number));
        } else if (from == "username") {
            result = await this.client.query(this.queryBuilder.getUserDataUsername(uid_or_username as string));
        } else {
            result = undefined;
        }
        if (result && this._validateArray(result.rows)) {
            if (result.rowCount && result.rowCount > 1) {
                console.warn("POSSIBLE DUPLICATE!! getUserData(): result.rows has length > 1: ", result.rows);
            }
            return result.rows[0] as User;
        }
        return null;
    }

    async addUser(username: string, password: string, tasksdata: string = "[]") {
        let nextUID = 1;
        const result_maxuid = await this.client.query(this.queryBuilder.getMaxUID());
        if (this._validateArray(result_maxuid.rows)) {
            if (result_maxuid.rows[0] && result_maxuid.rows[0].max) {
                nextUID = parseInt(result_maxuid.rows[0].max) + 1;
            }
        }
        await this.client.query(
            this.queryBuilder.addUser(username, password, tasksdata)
        );
        return await this.getUserData("uid", nextUID);
    }

    async setUserTasks(uid: number, tasksdata: string) {
        if(await this.doesUIDExist(uid)){
            return await this.client.query(this.queryBuilder.setUserTasks(uid, tasksdata));
        } else {
            console.warn("cannot set user tasks: uid does not exist: " + uid.toString());
            return false;
        }
    }

    _validateArray(e: any) {
        if (typeof e === "object" && Array.isArray(e)) {
            return true;
        } else {
            console.warn("last query's result.rows does not exist as an array");
        }
        return false;
    }
}

export { QueryExecutor };
export type { User };