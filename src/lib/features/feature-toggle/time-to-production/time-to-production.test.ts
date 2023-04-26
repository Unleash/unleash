import { calculateAverageTimeToProd } from './time-to-production';

describe('calculate average time to production', () => {
    test('should calculate average correctly', () => {
        const timeToProduction = calculateAverageTimeToProd([
            {
                created: new Date('2022-12-05T09:37:32.483Z'),
                enabled: new Date('2023-01-25T09:37:32.504Z'),
            },
            {
                created: new Date('2023-01-19T09:37:32.484Z'),
                enabled: new Date('2023-01-31T09:37:32.506Z'),
            },
            {
                created: new Date('2023-01-19T09:37:32.484Z'),
                enabled: new Date('2023-02-02T09:37:32.509Z'),
            },
            {
                created: new Date('2023-01-19T09:37:32.486Z'),
                enabled: new Date('2023-01-26T09:37:32.508Z'),
            },
        ]);

        expect(timeToProduction).toBe(21);
    });
});
