export type EndpointInfo = {
    label: string;
    color: string;
    order: number;
};

export const endpointsInfo: Record<string, EndpointInfo> = {
    '/api/admin': {
        label: 'Admin',
        color: '#6D66D9',
        order: 1,
    },
    '/api/frontend': {
        label: 'Frontend',
        color: '#A39EFF',
        order: 2,
    },
    '/api/client': {
        label: 'Server',
        color: '#D8D6FF',
        order: 3,
    },
};
