import { describe, expect, test } from 'vitest';
import { lightTheme } from 'themes/theme';
import { formatTickValue } from 'component/common/Chart/formatTickValue';
import { createBarChartOptions } from './createChartOptions.js';

describe('createBarChartOptions', () => {
    test('only uses whole-number ticks on the y axis', () => {
        const options = createBarChartOptions(lightTheme, 24, {
            locale: 'en-US',
        });

        const yTicks = options.scales?.y?.ticks;
        expect(yTicks).toMatchObject({
            precision: 0,
            callback: formatTickValue,
            display: true,
        });
    });
});
