import {ValidationError} from "../utils/error.js";

export const getCorrectedDateTime = userTimeZoneOffset => {
    const serverDateTime = new Date();
    const serverTimeOffsetMs = serverDateTime.getTimezoneOffset() * 60 * 1000;
    const userTimeOffsetMs = Number(userTimeZoneOffset) * 60 * 1000;
    const correctedTime = new Date(serverDateTime.getTime() + serverTimeOffsetMs - userTimeOffsetMs);

    return correctedTime.getTime();
};

export const validateDateTime = (date, time, userTimeZoneOffset) => {
    if (!date && !time) {
        return new Date(getCorrectedDateTime(userTimeZoneOffset));
    }

    const userLocalDateTime = new Date(`${date}T${time}`);

    if (isNaN(userLocalDateTime.getTime())) {
        throw new ValidationError('Nieprawidłowa data.');
    }

    return userLocalDateTime;
};
