import * as fs from 'fs';

export const readFile: (file: string) => Promise<string> = async (file) =>
    new Promise((resolve, reject) =>
        fs.readFile(file, (err, v) =>
            err ? reject(err) : resolve(v.toString('utf-8')),
        ),
    );
