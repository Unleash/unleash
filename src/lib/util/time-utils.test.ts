import { generateHourBuckets } from './time-utils';

test('generateHourBuckets', () => {
    const result = generateHourBuckets(24);

    expect(result).toHaveLength(24);
});
