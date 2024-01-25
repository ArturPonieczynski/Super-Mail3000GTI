import {ValidationError} from "../utils/error.js";

export const validateDateTime = (date, time) => {
    if (!date && !time) {
        return Date.now();
    }

    const userLocalDateTime = new Date(`${date}T${time}`);

    if (isNaN(userLocalDateTime.getTime())) {
        throw new ValidationError('Nieprawidłowa data.');
    }

    return userLocalDateTime;
};