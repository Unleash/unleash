import { calculateMedian } from './calculateMedian.ts';

test('works with empty data', () => {
    const result = calculateMedian([]);
    expect(result).toBe('N/A');
});

test('correctly identifies the median in odd-length arrays', () => {
    const data = [
        {
            data: [
                {
                    week: '2024-01',
                    date: '2024-01-07 01:00:00',
                    newProductionFlags: 99,
                },
                {
                    week: '2024-02',
                    date: '2024-01-14 01:00:00',
                    newProductionFlags: 0,
                },
                {
                    week: '2024-03',
                    date: '2024-01-21 01:00:00',
                    newProductionFlags: 3,
                },
            ],
        },
    ];
    const result = calculateMedian(data);
    expect(result).toBe(3);
});

test('correctly identifies the median in even-length arrays', () => {
    const data = [
        {
            data: [
                {
                    week: '2024-01',
                    date: '2024-01-07 01:00:00',
                    newProductionFlags: 0,
                },
                {
                    week: '2024-02',
                    date: '2024-01-14 01:00:00',
                    newProductionFlags: 10,
                },
                {
                    week: '2024-03',
                    date: '2024-01-21 01:00:00',
                    newProductionFlags: 12,
                },
                {
                    week: '2024-04',
                    date: '2024-01-28 01:00:00',
                    newProductionFlags: 50,
                },
            ],
        },
    ];
    const result = calculateMedian(data);
    expect(result).toBe(11);
});

test('handles single week data', () => {
    const data = [
        {
            data: [
                {
                    week: '2024-01',
                    date: '2024-01-07 01:00:00',
                    newProductionFlags: 7,
                },
            ],
        },
    ];
    const result = calculateMedian(data);
    expect(result).toBe(7);
});

test('handles multiple projects with overlapping weeks', () => {
    const data = [
        {
            data: [
                {
                    week: '2024-01',
                    date: '2024-01-07 01:00:00',
                    newProductionFlags: 11,
                },
                {
                    week: '2024-02',
                    date: '2024-01-14 01:00:00',
                    newProductionFlags: 3,
                },
            ],
        },
        {
            data: [
                {
                    week: '2024-02',
                    date: '2024-01-14 01:00:00',
                    newProductionFlags: 7,
                },
                {
                    week: '2024-03',
                    date: '2024-01-21 01:00:00',
                    newProductionFlags: 100,
                },
            ],
        },
        {
            data: [
                {
                    week: '2024-01',
                    date: '2024-01-07 01:00:00',
                    newProductionFlags: 1,
                },
                {
                    week: '2024-04',
                    date: '2024-01-21 01:00:00',
                    newProductionFlags: 20,
                },
            ],
        },
    ];
    const result = calculateMedian(data);
    expect(result).toBe(16);
});
describe('handling weeks with no production flags data', () => {
    test('it disregards solo entries without production flags data', () => {
        const data = [
            { data: [{ week: '2024-02', date: '2024-01-14 01:00:00' }] },
        ];
        const result = calculateMedian(data);
        expect(result).toBe('N/A');
    });
    test('weeks without production flags data is disregarded in larger sets', () => {
        const data = [
            {
                data: [
                    { week: '2024-01', date: '2024-01-14 01:00:00' },
                    {
                        week: '2024-02',
                        date: '2024-01-14 01:00:00',
                        newProductionFlags: 7,
                    },
                    {
                        week: '2024-03',
                        date: '2024-01-21 01:00:00',
                        newProductionFlags: 3,
                    },
                ],
            },
            {
                data: [{ week: '2024-03', date: '2024-01-21 01:00:00' }],
            },
        ];

        const result = calculateMedian(data);
        expect(result).toBe(5);
    });
});
