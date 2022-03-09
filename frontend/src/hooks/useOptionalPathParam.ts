import { useParams } from 'react-router-dom';

export const useOptionalPathParam = (key: string): string | undefined => {
    return useParams<{ [key: string]: string | undefined }>()[key];
};
