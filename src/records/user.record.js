import {pool} from "../utils/database.js";
import {v4 as uuid} from "uuid";
import {ValidationError} from "../utils/error.js";

export class UserRecord {
    constructor(obj) {
        this.validate(obj);
        this.id = obj.id || uuid();
        this.user_name = obj.user_name;
        this.password_hash = obj.password_hash;
    }

    validate(obj) {
        if (!obj.user_name || obj.user_name.length > 50) {
            throw new ValidationError('Nazwa użytkownika jest nieprawidłowa i nie przekraczaj 50 znaków.');
        }
        if (obj.password_hash.length > 60 || obj.password_hash.length < 4) {
            throw new ValidationError('Hasło jest nieprawidłowe. Użyj od 4 do 36 znaków.')
        }
    }

    async insert() {
        await pool.execute("INSERT INTO `users` (`id`,`user_name`, `password`) VALUES (:id, :userName, :password)", {
            id: this.id,
            user_name: this.user_name,
            password_hash: this.password_hash,
        });
        return this.id;
    }

    static async delete(id) {
        const user = await this.findOneByName(id);
        if (user) {
            const result = await pool.execute("DELETE FROM `users` WHERE `id` = :id", {
                id: id,
            });
            return result[0].affectedRows;
        } else {
            return 0;
        }
    }

    static async findOneByName(user_name) {
        const [result] = await pool.execute("SELECT * FROM `users` WHERE `user_name` = :user_name", {
            user_name: user_name,
        });
        return result.length === 0 ? null : new UserRecord(result[0]);
    }

    static async findAll() {
        const [result] = await pool.execute("SELECT * FROM `users` ORDER BY `user_name` ASC");
        return result.map((obj) => {
            return new UserRecord(obj);
        });
    };
}
