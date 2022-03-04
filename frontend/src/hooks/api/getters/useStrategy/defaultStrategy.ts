import { IStrategy } from 'interfaces/strategy';

export const defaultStrategy: IStrategy = {
    name: '',
    description: '',
    displayName: '',
    editable: false,
    deprecated: false,
    parameters: [],
};
