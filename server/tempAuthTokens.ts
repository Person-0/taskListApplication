import { UUID, randomUUID } from "crypto";

export interface tokenRecord {
    uid: number;
    token: UUID;
    createdAt: number;
}

export class authTokenManager {
    tokens: tokenRecord[] = [];
    tokenExpiryMS = parseInt(process.env.tokenExpiryMS as string);

    _findByUid(uid: number) {
        let result: null | tokenRecord = null;
        for(const record of this.tokens) {
            if (record.uid == uid) {
                result = record;
                break;
            }
        }
        return result;
    }

    _removeTokenRecord(uid: number) {
        this.tokens = this.tokens.filter(r => r.uid !== uid);
    }

    _hasExpired(tokenRecordInstance: tokenRecord) {
        if(Date.now() - tokenRecordInstance.createdAt >= this.tokenExpiryMS) {
            this._removeTokenRecord(tokenRecordInstance.uid);
            return true;
        }
        return false;
    }

    generateToken(uid: number) {
        this._removeTokenRecord(uid);
        const newRecord: tokenRecord = {
            uid: parseInt(uid.toString()), // ensuring uid is a number
            token: randomUUID(),
            createdAt: Date.now()
        }
        this.tokens.push(newRecord);
        return newRecord.token;
    }

    getTokenCookieString(uid: number) {
        const token = this.generateToken(uid);
        return token + "," + uid.toString();
    }

    authorizeToken(uid: number, token: UUID) {
        const tokenRecord = this._findByUid(uid);
        if(tokenRecord) {
            if(tokenRecord.token === token) {
                return true;
            }
        } 
        return false;
    }
}