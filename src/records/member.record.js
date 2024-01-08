import {pool} from "../utils/database.config.js";
import {v4 as uuid} from "uuid";
import {ServerError, ValidationError} from "../utils/error.js";

export class MemberRecord {

    constructor(obj) {
        this.validate(obj);
        this.id = obj.id || uuid();
        this.email = obj.email;
        this.description = obj.description;
    }

    validate(obj) {

        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!obj) {
            throw new ValidationError('Nie podano żadnych danych.')
        } else if (
            !obj.email ||
            typeof obj.email !== 'string' ||
            !emailRegex.test(obj.email) ||
            obj.email.length > 50
        ) {
            throw new ValidationError('E-mail jest nieprawidłowy. Podaj poprawny e-mail i nie przekraczaj 50 znaków.');
        } else if (typeof obj.description !== 'string' || obj.description.length > 45) {
            throw new ValidationError('Opis jest za długi. Możesz użyć maksymalnie 45 znaków.')
        }
    }

    async insert() {
       try {
           await pool.execute("INSERT INTO `members` (`id`,`email`, `description`) VALUES (:id, :email, :description)", {
               id: this.id,
               email: this.email,
               description: this.description,
           });

           return this.id;
       } catch (error) {
           console.error('Error occurred during member insertion:', error);
           throw new ServerError('Nie udało się dodać nowego adresu e-mail.');
       }
    }

    static async delete(id) {
        try {
            const member = await this.findOne(id);
            if (member) {
                const result = await pool.execute("DELETE FROM `members` WHERE `id` = :id", {
                    id: id,
                });
                return result[0].affectedRows;
            } else {
                return 0;
            }
        } catch (error) {
            console.error('Error occurred during member deletion:', error);
            throw new ServerError('Nie udało się usunąć adresu e-mail.');
        }
    }

    static async findOne(id) {
        try {
            const [result] = await pool.execute("SELECT * FROM `members` WHERE `id` = :id", {
                id: id,
            });
            return result.length === 0 ? null : new MemberRecord(...result);

        } catch (error) {
            console.error('Error occurred during member search by id:', error);
            throw new ServerError(`Nie udało się lub nie znaleziono adresu e-mail.`);
        }
    }

    static async findAll() {
        try {
            const [result] = await pool.execute("SELECT * FROM `members` ORDER BY `description` ASC");
            return result.map(obj => new MemberRecord(obj));

        } catch (error) {
            console.error('Error occurred during member search all:', error);
            throw new ServerError('Nie udało się pobrać adresów e-mail z bazy danych.');
        }
    };
}
