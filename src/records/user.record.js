import {pool} from "../utils/database.js";
import {v4 as uuid} from "uuid";
import {ValidationError} from "../utils/error.js";

export class UserRecord {
    constructor(obj) {
        this.validate(obj);
        this.id = obj.id || uuid();
        this.userName = obj.userName;
        this.password = obj.password;
    }

    validate(obj) {
        if (!obj.userName || obj.userName.length > 50) {
            throw new ValidationError('E-mail jest nieprawidłowy. Podaj poprawny e-mail i nie przekraczaj 50 znaków.');
        }
        if (obj.password.length > 36 || obj.password.length < 4) {
            throw new ValidationError('Hasło jest nieprawidłowe. Użyj od 4 do 36 znaków.')
        }
    }

    async insert() {
        await pool.execute("INSERT INTO `users` (`id`,`user_name`, `password`) VALUES (:id, :userName, :password)", {
            id: this.id,
            userName: this.userName,
            password: this.password,
        });
        return this.id;
    }

    static async delete(id) {
        const user = await this.findOne(id);
        if (user.lenght > 0) {
            const result = await pool.execute("DELETE FROM `users` WHERE `id` = :id", {
                id: id,
            });
            return result[0].affectedRows;
        } else {
            return 0;
        }
    }

    static async findOne(id) {
        const [result] = await pool.execute("SELECT * FROM `users` WHERE `id` = :id", {
            id: id,
        });
        return result.length === 0 ? null : new UserRecord(result);
    }

    static async findAll() {
        const [result] = await pool.execute("SELECT * FROM `users` ORDER BY `user_name` ASC");
        return result.map((obj) => {
            return new UserRecord(obj);
        });
    };
}
