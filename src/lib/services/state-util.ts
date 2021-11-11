import * as fs from 'fs';
import * as mime from 'mime';
import * as YAML from 'js-yaml';

export const readFile: (file: string) => Promise<string> = (file) =>
    new Promise((resolve, reject) =>
        fs.readFile(file, (err, v) =>
            err ? reject(err) : resolve(v.toString('utf-8')),
        ),
    );

export const parseFile: (file: string, data: string) => any = (
    file: string,
    data: string,
) => (mime.getType(file) === 'text/yaml' ? YAML.load(data) : JSON.parse(data));

export const filterExisting: (
    keepExisting: boolean,
    existingArray: any[],
) => (item: any) => boolean =
    (keepExisting, existingArray = []) =>
    (item) => {
        if (keepExisting) {
            const found = existingArray.find((t) => t.name === item.name);
            return !found;
        }
        return true;
    };

export const filterEqual: (existingArray: any[]) => (item: any) => boolean =
    (existingArray = []) =>
    (item) => {
        const toggle = existingArray.find((t) => t.name === item.name);
        if (toggle) {
            return JSON.stringify(toggle) !== JSON.stringify(item);
        }
        return true;
    };
