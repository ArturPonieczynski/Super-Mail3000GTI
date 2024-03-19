import {pool} from "../utils/database.config.js";
import {v4 as uuid} from "uuid";
import {ValidationError} from "../utils/error.js";
import {hash, genSalt} from "bcrypt";

export class UserRecord {

    constructor(userRecordObj) {
        this.validate(userRecordObj);
        this.id = userRecordObj.id || uuid();
        this.name = userRecordObj.user_name;
        this.passwordHash = userRecordObj.password_hash || null;
        this.password = userRecordObj.password || null;
    }

    validate(userRecordObj) {
        if (!userRecordObj) {
            throw new ValidationError('Nie podano żadnych danych.');
        } else if (!userRecordObj.user_name || userRecordObj.user_name.length > 50) {
            throw new ValidationError('Nazwa użytkownika jest nieprawidłowa. Nie przekraczaj 50 znaków.');
        } else if (!userRecordObj.password_hash) {
            if (userRecordObj.password.length < 4 || userRecordObj.password.length > 60) {
                throw new ValidationError('Hasło jest nieprawidłowe. Użyj od 4 do 60 znaków.');
            }
        }
    }

    async insert() {
        try {
            if (!this.passwordHash) {
                const salt = await genSalt(11);
                this.passwordHash = await hash(this.password, salt);
                this.password = null;
            }

            await pool.execute("INSERT INTO `users` (`id`,`user_name`, `password_hash`) VALUES (:id, :user_name, :password_hash)", {
                id: this.id,
                user_name: this.name,
                password_hash: this.passwordHash,
            });

            return this.id;

        } catch (error) {
            console.error('Error occurred during user insertion:', error);
            throw new Error('Nie udało się dodać użytkownika.');
        }
    }

    static async delete(id) {
        try {
            const user = await this.findOneById(id);
            if (user) {
                const result = await pool.execute("DELETE FROM `users` WHERE `id` = :id", {
                    id: id,
                });
                return result[0].affectedRows;
            } else {
                return 0;
            }
        } catch (error) {
            console.error('Error occurred during user deletion:', error);
            throw new Error('Nie udało się usunąć użytkownika.');
        }
    }

    static async findOneByName(userName) {
        try {
            const [result] = await pool.execute("SELECT * FROM `users` WHERE `user_name` = :user_name", {
                user_name: userName,
            });

            return result.length === 0 ? null : new UserRecord(result[0]);

        } catch (error) {
            console.error('Error occurred during user search by name:', error);
            throw new Error(`Nie udało się lub nie znaleziono ${userName}`);
        }
    }

    static async findOneById(id) {
        try {
            const [result] = await pool.execute("SELECT * FROM `users` WHERE `id` = :id", {
                id,
            });

            return result.length === 0 ? null : new UserRecord(result[0]);

        } catch (error) {
            console.error('Error occurred during user search by id:', error);
            throw new Error(`Nie udało się wyszukać użytkownika`);
        }
    }

    static async findAll() {
        try {
            const [result] = await pool.execute("SELECT * FROM `users` ORDER BY `user_name` ASC");
            return result.map((obj) => {
                return new UserRecord(obj);
            });
        } catch (error) {
            console.error('Error occurred during user search all:', error);
            throw new Error('Nie udało się pobrać użytkowników z bazy danych.');
        }
    }
}
