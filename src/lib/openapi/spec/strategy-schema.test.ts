import { validateSchema } from '../validate';
import type { StrategySchema } from './strategy-schema';

test('strategySchema', () => {
    const data: StrategySchema = {
        description: '',
        title: '',
        name: '',
        displayName: '',
        editable: false,
        deprecated: false,
        parameters: [
            {
                name: '',
                type: '',
                description: '',
                required: true,
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/strategySchema', data),
    ).toBeUndefined();

    // allow null descriptions
    expect(
        validateSchema('#/components/schemas/strategySchema', {
            ...data,
            description: null,
        }),
    ).toBeUndefined();

    expect(
        validateSchema('#/components/schemas/strategySchema', {}),
    ).toMatchSnapshot();

    const { title, ...noTitle } = { ...data };
    expect(
        validateSchema('#/components/schemas/strategySchema', noTitle),
    ).toBeUndefined();
});
