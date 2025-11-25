import { ValidatorClass } from "../server/validator";
const validator = new ValidatorClass();

export class APIClass {
    api_url = "http://" + location.hostname + ":8080/api";

    _authedFetch(url: string) {
        return fetch(url, {
            headers: {
                auth: localStorage.getItem("token") as string
            }
        });
    }

    async logout() {
        await this._authedFetch(this.api_url + "/logout");
    }

    async authorize(username: string, password: string, type: 'signup' | 'login') {
        const qparams = new URLSearchParams();

        const authType = type === 'signup' ? '1' : '0';
        qparams.append("authType", authType);

        if (!(validator.username(username))) {
            return {error: true, message: "invalid username"};
        }
        qparams.append("username", username);

        if (!(validator.password(password))) {
            return {error: true, message: "invalid password"};
        }
        qparams.append("password", password);

        return (await fetch(this.api_url + "/authorize?" + qparams.toString())).json();
    }

    async getMyData() {
        return (await this._authedFetch(this.api_url + "/getMyData")).json();
    }

    async setMyTasks(tasksdata: string) {
        const qparams = new URLSearchParams();
        qparams.append("tasksdata", tasksdata);
        return (await this._authedFetch(this.api_url + "/setMyTasks?" + qparams.toString())).json();
    }
}