export const snakeCase = (input: string): string => {
    const result = [];
    const splitString = input.split('');
    for (let i = 0; i < splitString.length; i++) {
        const char = splitString[i];
        if (i !== 0 && char.toLocaleUpperCase() === char) {
            result.push('_', char.toLocaleLowerCase());
        } else {
            result.push(char.toLocaleLowerCase());
        }
    }
    return result.join('');
};

export const snakeCaseKeys = (obj: {
    [index: string]: any;
}): { [index: string]: any } => {
    const objResult: { [index: string]: any } = {};

    Object.keys(obj).forEach((key) => {
        const snakeCaseKey = snakeCase(key);

        objResult[snakeCaseKey] = obj[key];
    });

    return objResult;
};
