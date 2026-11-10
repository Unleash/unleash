import { useParams } from 'react-router';

export const useOptionalPathParam = (key: string): string | undefined => {
    return useParams<{ [key: string]: string | undefined }>()[key];
};
