import { calculateAverageTimeToProd } from './time-to-production.js';

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

    test('should return more than 0 if feature was enabled almost instantly', () => {
        const timeToProduction = calculateAverageTimeToProd([
            {
                created: new Date('2024-11-11T09:11:11.111Z'),
                enabled: new Date('2024-11-11T09:11:11.112Z'),
            },
            {
                created: new Date('2024-12-12T09:12:11.121Z'),
                enabled: new Date('2024-12-12T09:12:12.122Z'),
            },
        ]);

        expect(timeToProduction).toBe(0.1);
    });

    test('should return more than 0 if feature was enabled instantly', () => {
        const created = new Date('2024-11-11T09:11:11.111Z');
        const timeToProduction = calculateAverageTimeToProd([
            {
                created,
                enabled: created,
            },
        ]);

        expect(timeToProduction).toBe(0.1);
    });
});
