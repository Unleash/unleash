import { stepsFromTimestamps } from './change-request-timeline-steps.ts';

describe('stepsFromTimestamps', () => {
    test.each([
        'Rejected',
        'Cancelled',
    ])("always includes 'Draft' and 'In review' and the current stage (%s)", (state) => {
        expect(
            stepsFromTimestamps({}, state as 'Rejected' | 'Cancelled'),
        ).toStrictEqual(['Draft', 'In review', state]);
    });

    test('Includes all steps in the timestamps object', () => {
        expect(
            stepsFromTimestamps(
                {
                    Draft: {},
                    'In review': {},
                    Approved: {},
                    Rejected: {},
                },
                'Rejected',
            ),
        ).toStrictEqual(['Draft', 'In review', 'Approved', 'Rejected']);

        expect(
            stepsFromTimestamps(
                {
                    Draft: {},
                    Approved: {},
                    Scheduled: {},
                },
                'Rejected',
            ),
        ).toStrictEqual([
            'Draft',
            'In review',
            'Approved',
            'Scheduled',
            'Rejected',
        ]);

        // The implementation is naïve, so even if a CR must be approved to be
        // scheduled, if the timestamps object does not contain the 'Approved'
        // step, it will not be included.
        expect(
            stepsFromTimestamps(
                {
                    Scheduled: {},
                },
                'Rejected',
            ),
        ).toStrictEqual(['Draft', 'In review', 'Scheduled', 'Rejected']);
    });
});
