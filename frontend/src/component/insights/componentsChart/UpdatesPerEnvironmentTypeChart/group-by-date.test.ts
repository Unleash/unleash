import { groupByDateAndFillMissingDatapoints } from './UpdatesPerEnvironmentTypeChart.jsx';

describe('groupByDate', () => {
    it('correctly groups items by date and includes all environment types', () => {
        const items = [
            {
                date: '2023-01-01',
                environmentType: 'development',
                totalUpdates: 5,
                week: '2023-01',
            },
            {
                date: '2023-01-01',
                environmentType: 'production',
                totalUpdates: 3,
                week: '2023-01',
            },
            {
                date: '2023-01-09',
                environmentType: 'development',
                totalUpdates: 2,
                week: '2023-02',
            },
        ];
        const grouped = groupByDateAndFillMissingDatapoints(items);
        expect(Object.keys(grouped)).toEqual(
            expect.arrayContaining(['2023-01-01', '2023-01-09']),
        );
        expect(grouped['2023-01-01']).toMatchObject([
            {
                date: '2023-01-01',
                environmentType: 'development',
                totalUpdates: 5,
                week: '2023-01',
            },
            {
                date: '2023-01-01',
                environmentType: 'production',
                totalUpdates: 3,
                week: '2023-01',
            },
        ]);

        expect(grouped['2023-01-09']).toMatchObject([
            {
                date: '2023-01-09',
                environmentType: 'development',
                totalUpdates: 2,
                week: '2023-02',
            },
            {
                date: '2023-01-09',
                environmentType: 'production',
                totalUpdates: 0,
                week: '2023-02',
            },
        ]);
    });

    it('inserts placeholder items for missing environmentType data on some dates', () => {
        const items = [
            {
                date: '2023-01-01',
                environmentType: 'development',
                totalUpdates: 4,
                week: '2023-01',
            },
            {
                date: '2023-01-09',
                environmentType: 'production',
                totalUpdates: 6,
                week: '2023-02',
            },
        ];
        const grouped = groupByDateAndFillMissingDatapoints(items);
        const productionOnJan01 = grouped['2023-01-01']?.find(
            (item) => item.environmentType === 'production',
        ) ?? { totalUpdates: -1 };
        const developmentOnJan09 = grouped['2023-01-09']?.find(
            (item) => item.environmentType === 'development',
        ) ?? { totalUpdates: -1 };

        expect(productionOnJan01.totalUpdates).toBe(0);
        expect(developmentOnJan09.totalUpdates).toBe(0);
        expect(grouped['2023-01-01']?.[1]?.week).toBe('2023-01');
    });
});
