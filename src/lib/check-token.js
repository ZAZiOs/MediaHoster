import jwt from 'jsonwebtoken';
import { UserDB } from "$lib/model/users";
import dotenv from 'dotenv';
dotenv.config()
const config = process.env;

export const decodeTkn = async (token) => {
    if (!token) { return null }
    try {
        const decoded = jwt.verify(token, String(config.TOKEN_KEY));
        let result = await UserDB.findOne({_id: decoded.user_id}, {_id: 0, pass: 0}).lean()
        if (decoded.check == result.token_check) {
            delete result.token_check
            return result
        } else {
            return null
        }
    } catch (err) {
        return null;
    }
}