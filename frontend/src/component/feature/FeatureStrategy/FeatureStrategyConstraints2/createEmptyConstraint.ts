import { IUnleashContextDefinition } from 'interfaces/context';
import { IConstraint } from 'interfaces/strategy';

export const createEmptyConstraint = (
    context: IUnleashContextDefinition[]
): IConstraint => {
    return {
        contextName: context[0].name,
        operator: 'IN',
        values: [],
        value: '',
        caseInsensitive: false,
        inverted: false,
    };
};
