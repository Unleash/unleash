import { IUnleashContextDefinition } from 'interfaces/context';
import { IConstraint } from 'interfaces/strategy';

export const createEmptyConstraint = (
    context: IUnleashContextDefinition[]
): IConstraint => {
    if (context.length === 0) {
        throw new Error('Expected at least one context definition');
    }

    return {
        contextName: context[0].name,
        operator: 'IN',
        values: [],
        value: '',
        caseInsensitive: false,
        inverted: false,
    };
};
