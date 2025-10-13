import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatCurrency.ts';

describe('formatCurrency', () => {
    it('formats USD currency', () => {
        expect(formatCurrency(1000, 'USD')).toMatchInlineSnapshot(`"$1,000"`);
        expect(formatCurrency(1234.56, 'USD')).toMatchInlineSnapshot(
            `"$1,234.56"`,
        );
        expect(formatCurrency(1000000, 'USD')).toMatchInlineSnapshot(
            `"$1,000,000"`,
        );
        expect(formatCurrency(0, 'USD')).toMatchInlineSnapshot(`"$0"`);
        expect(formatCurrency(-500, 'USD')).toMatchInlineSnapshot(`"$-500"`);
        expect(formatCurrency(1000, 'usd')).toMatchInlineSnapshot(`"$1,000"`);
        expect(formatCurrency(1234.56, 'usd')).toMatchInlineSnapshot(
            `"$1,234.56"`,
        );
    });

    it('formats EUR currency', () => {
        expect(formatCurrency(1000, 'EUR')).toMatchInlineSnapshot(`"€ 1 000"`);
        expect(formatCurrency(1234.56, 'EUR')).toMatchInlineSnapshot(
            `"€ 1 234,56"`,
        );
        expect(formatCurrency(1000000, 'EUR')).toMatchInlineSnapshot(
            `"€ 1 000 000"`,
        );
        expect(formatCurrency(0, 'EUR')).toMatchInlineSnapshot(`"€ 0"`);
        expect(formatCurrency(-500, 'EUR')).toMatchInlineSnapshot(`"€ −500"`);
        expect(formatCurrency(1000, 'eur')).toMatchInlineSnapshot(`"€ 1 000"`);
        expect(formatCurrency(1234.56, 'eur')).toMatchInlineSnapshot(
            `"€ 1 234,56"`,
        );
    });

    it('formats other currencies', () => {
        expect(formatCurrency(1000, 'GBP')).toMatchInlineSnapshot(`"1000 GBP"`);
        expect(formatCurrency(100000, 'JPY')).toMatchInlineSnapshot(
            `"100000 JPY"`,
        );
        expect(formatCurrency(500, 'SEK')).toMatchInlineSnapshot(`"500 SEK"`);
        expect(formatCurrency(1000, '')).toMatchInlineSnapshot(`"1000"`);
    });

    it('formats without currency', () => {
        expect(formatCurrency(1000)).toMatchInlineSnapshot(`"1000"`);
        expect(formatCurrency(1234.56)).toMatchInlineSnapshot(`"1234.56"`);
        expect(formatCurrency(0)).toMatchInlineSnapshot(`"0"`);
        expect(formatCurrency(-500)).toMatchInlineSnapshot(`"-500"`);
    });

    it('handles edge cases', () => {
        expect(formatCurrency(0.01, 'USD')).toMatchInlineSnapshot(`"$0.01"`);
        expect(formatCurrency(999999999, 'EUR')).toMatchInlineSnapshot(
            `"€ 999 999 999"`,
        );
        expect(formatCurrency(10.999, 'USD')).toMatchInlineSnapshot(
            `"$10.999"`,
        );
        expect(formatCurrency(10.999, 'EUR')).toMatchInlineSnapshot(
            `"€ 10,999"`,
        );
    });
});
