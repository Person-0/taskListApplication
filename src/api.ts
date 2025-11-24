export class APIClass {
    api_url = "http://" + location.hostname + ":8080";

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

    async authorize(params: string) {
        return (await fetch(this.api_url + "/authorize?" + params)).json();
    }

    async getMyData() {
        return (await this._authedFetch(this.api_url + "/getMyData")).json();
    }
}