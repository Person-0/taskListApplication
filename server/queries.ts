export class QueryBuilder {
    tablename: string;
    constructor(tablename: string){
        this.tablename = tablename;
    }

    addUser(username: string, password: string, tasksdata: string = "[]") {
        return `insert into userdata (username, password, tasksdata) values ('${username}', '${password}', '${tasksdata}');`;
    }

    getAllUsers() {
        return `select * from userdata;`;
    }

    getUserData(uid: number) {
        return `select * from userdata where uid = ${uid};`;
    }
}