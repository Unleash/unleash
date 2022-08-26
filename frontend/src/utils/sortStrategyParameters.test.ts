import { sortStrategyParameters } from 'utils/sortStrategyParameters';

test('sortStrategyParameters', () => {
    expect(
        sortStrategyParameters(
            {
                c: 1,
                b: 2,
                a: 3,
            },
            {
                name: '',
                displayName: '',
                description: '',
                editable: false,
                deprecated: false,
                parameters: [
                    { name: 'a', description: '', type: '', required: false },
                    { name: 'b', description: '', type: '', required: false },
                    { name: 'c', description: '', type: '', required: false },
                ],
            }
        )
    ).toEqual({
        a: 3,
        b: 2,
        c: 1,
    });
});
