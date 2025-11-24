export class ValidatorClass {
    
    username_req = "Username must be between 3 to 15 characters in length";
    username(text: string) {
        if(
            typeof text === 'string' &&
            text.length <= 15 &&
            text.length > 0
        ) {
            return true;
        }
        return false;
    }

    password_req = "Password must be atleast 7 characters in length and must contain a lowercase, uppercase, numeric and special character";
    password(text: string) {
        if(
            typeof text === 'string' &&
            text.length <= 100 &&
            text.length > 7 &&
            containsCharFrom("0123456789", text) &&
            containsCharFrom("`~!@#$%^&*()_+-=[]{}\\|;:'\"<,.>/?", text) &&
            containsCharFrom("ABCDEFGHIJKLMNOPQRSTUVWXYZ", text) &&
            containsCharFrom("abcdefghijklmnopqrstuvwxyz", text)
        ) {
            return true;
        }
        return false;
    }
}

function containsCharFrom(from: string, instr: string) {
    let res = false;
    for(const char of instr) {
        if (from.includes(char)) {
            res = true;
            break;
        }
    }
    return res;
}