import { validateSchema } from '../validate';
import { StrategySchema } from './strategy-schema';

test('strategySchema', () => {
    const data: StrategySchema = {
        description: '',
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

    expect(
        validateSchema('#/components/schemas/strategySchema', {}),
    ).toMatchSnapshot();
});
