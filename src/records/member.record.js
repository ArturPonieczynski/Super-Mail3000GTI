import {pool} from "../utils/database.js";
import {v4 as uuid} from "uuid";
import {ValidationError} from "../utils/error.js";

export class MemberRecord {

    constructor(obj) {
        this.validate(obj);
        this.id = obj.id || uuid();
        this.email = obj.email;
        this.description = obj.description;
    }

    validate(obj) {
        if (!obj.email || obj.email.length > 50) {
            throw new ValidationError('E-mail jest nieprawidłowy. Podaj poprawny e-mail i nie przekraczaj 50 znaków.');
        }
        if (obj.description.length > 45) {
            throw new ValidationError('Opis jest za długi. Możesz użyć maksymalnie 45 znaków.')
        }
    }

    async insert() {
        await pool.execute("INSERT INTO `members` (`id`,`email`, `description`) VALUES (:id, :email, :description)", {
            id: this.id,
            email: this.email,
            description: this.description,
        });
        return this.id;
    }

    static async delete(id) {
        const member = await this.findOne(id);
        if (member) {
            const result = await pool.execute("DELETE FROM `members` WHERE `id` = :id", {
                id: id,
            });
            return result[0].affectedRows;
        } else {
            return 0;
        }
    }

    static async findOne(id) {
        const [result] = await pool.execute("SELECT * FROM `members` WHERE `id` = :id", {
            id: id,
        });
        return result.length === 0 ? null : new MemberRecord(...result);
    }

    static async findAll() {
        const [result] = await pool.execute("SELECT * FROM `members` ORDER BY `description` ASC");
        return result.map(obj => new MemberRecord(obj));
    };
}
