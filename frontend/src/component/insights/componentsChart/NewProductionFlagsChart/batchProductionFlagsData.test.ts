import { batchProductionFlagsData } from './batchProductionFlagsData.ts';

it('handles a single data point', () => {
    const input = {
        newProductionFlags: 5,
        week: '50',
        date: '2022-01-01',
    };
    expect(batchProductionFlagsData([input])).toStrictEqual([
        {
            newProductionFlags: 5,
            date: input.date,
            endDate: input.date,
            week: '50',
        },
    ]);
});

it('adds data in the expected way', () => {
    const input = [
        {
            newProductionFlags: 5,
            week: '50',
            date: '2022-01-01',
        },
        {
            newProductionFlags: 6,
            week: '51',
            date: '2022-02-01',
        },
    ];
    expect(batchProductionFlagsData(input)).toStrictEqual([
        {
            newProductionFlags: 11,
            date: '2022-01-01',
            endDate: '2022-02-01',
            week: '50',
        },
    ]);
});
