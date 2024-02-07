import {readdir} from 'fs/promises';

const maxAge = 1000 * 60 * 60 * 24 * 400;
const deleteOldFiles = async () => {

    const files = await readdir('../uploads');

    files.forEach(file => {
        const [dateStampString] = file.split('-');
        const now = Date.now();

        if (now - Number(dateStampString) > maxAge) {
            console.log('delete old file');
        } else {
            console.log('leave file');
        }
        // console.log(dateStampString);
    })
    // console.log(files);

    // const now = Date.now();
};

await deleteOldFiles();