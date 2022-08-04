export const getMappedParam = (key: string) => {
    switch (key) {
        case 'userIds':
        case 'UserIds':
            return 'userId';
        case 'hostNames':
        case 'HostNames':
            return 'hostname';
        case 'IPs':
            return 'remoteAddress'
        default:
            return key;
    }
}
