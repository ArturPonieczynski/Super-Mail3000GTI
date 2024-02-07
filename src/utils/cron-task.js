import {readdir} from 'fs/promises';

// const maxAge = 1000 * 60 * 60 * 24 * 400;
const deleteOldFiles = async () => {

    const files = await readdir('../uploads');
    console.log(files);

    // const now = Date.now();
};

await deleteOldFiles();