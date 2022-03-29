import { v4 as uuidv4 } from 'uuid';

export const randomId = (): string => {
    return uuidv4();
};
