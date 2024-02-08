import {readdir, unlink} from 'fs/promises';
import {join} from 'path';

const maxAge = 1000 * 60 * 60 * 24 * 400;

export const deleteOldFiles = async () => {

    const files = await readdir('./uploads');

    files.forEach(file => {
        const [dateStampString] = file.split('-');
        const now = Date.now();
        const olderThanMaxAge = now - Number(dateStampString) > maxAge;

        if (olderThanMaxAge) {
            const path = join('./uploads/', file)
            unlink(path);
        }
    });
};
