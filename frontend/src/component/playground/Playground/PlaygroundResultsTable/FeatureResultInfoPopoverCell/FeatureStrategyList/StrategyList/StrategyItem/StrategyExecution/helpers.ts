export const getMappedParam = (key: string) => {
    switch (key.toUpperCase()) {
        case 'USERIDS':
            return 'userId';
        case 'IPS':
            return 'remoteAddress';
        default:
            return key;
    }
};
