import { describe, it, expect } from 'vitest';
import { calculateEstimateTotals } from './calculateEstimateTotals.ts';
import type { DetailedInvoicesLineSchema } from 'openapi';

describe('calculateEstimateTotals', () => {
    const createMainLine = (
        totalAmount: number,
    ): DetailedInvoicesLineSchema => ({
        description: 'Test main line',
        currency: 'USD',
        lookupKey: 'test-key',
        quantity: 1,
        totalAmount,
    });

    const createUsageLine = (
        consumption: number,
        limit: number,
        unitPrice: number,
        totalAmount: number = 0,
    ): DetailedInvoicesLineSchema => ({
        description: 'Test usage line',
        currency: 'USD',
        lookupKey: 'test-usage-key',
        quantity: 1,
        totalAmount,
        consumption,
        limit,
        unitPrice,
    });

    describe('non-estimate invoices', () => {
        it('returns original values for non-estimate status', () => {
            const result = calculateEstimateTotals(
                'invoiced',
                1000,
                150,
                1150,
                15,
                [createMainLine(1000)],
                [createUsageLine(100, 50, 2)],
            );

            expect(result).toEqual({
                subtotal: 1000,
                taxAmount: 150,
                totalAmount: 1150,
            });
        });

        it('returns original values for paid status', () => {
            const result = calculateEstimateTotals(
                'paid',
                2000,
                300,
                2300,
                15,
                [createMainLine(2000)],
                [],
            );

            expect(result).toEqual({
                subtotal: 2000,
                taxAmount: 300,
                totalAmount: 2300,
            });
        });
    });

    describe('estimate invoices', () => {
        it('calculates totals correctly with main lines only', () => {
            const mainLines = [createMainLine(1000), createMainLine(500)];
            const result = calculateEstimateTotals(
                'estimate',
                0,
                0,
                0,
                15,
                mainLines,
                [],
            );

            expect(result).toEqual({
                subtotal: 1500,
                taxAmount: 225,
                totalAmount: 1725,
            });
        });

        it('calculates totals correctly with usage lines only', () => {
            const usageLines = [
                createUsageLine(60_000_000, 53_000_000, 5),
                createUsageLine(56_500_000, 53_000_000, 5),
            ];
            const result = calculateEstimateTotals(
                'estimate',
                0,
                0,
                0,
                20,
                [],
                usageLines,
            );

            // ceil(7M/1M)*5 + ceil(3.5M/1M)*5 = 7*5 + 4*5 = 55
            expect(result).toEqual({
                subtotal: 55,
                taxAmount: 11,
                totalAmount: 66,
            });
        });

        it('calculates totals correctly with both main and usage lines', () => {
            const mainLines = [createMainLine(375)];
            const usageLines = [createUsageLine(60_000_000, 53_000_000, 5)];
            const result = calculateEstimateTotals(
                'estimate',
                0,
                0,
                0,
                10,
                mainLines,
                usageLines,
            );

            // 375 + ceil(7M/1M)*5 = 375 + 35 = 410
            expect(result).toEqual({
                subtotal: 410,
                taxAmount: 41,
                totalAmount: 451,
            });
        });

        it('handles usage lines with no overage', () => {
            const usageLines = [
                createUsageLine(30, 50, 2),
                createUsageLine(100, 100, 1.5),
            ];
            const result = calculateEstimateTotals(
                'estimate',
                0,
                0,
                0,
                15,
                [],
                usageLines,
            );

            expect(result).toEqual({
                subtotal: 0,
                taxAmount: 0,
                totalAmount: 0,
            });
        });

        it('handles usage lines with missing consumption or limit', () => {
            const usageLines = [
                createUsageLine(60_000_000, 53_000_000, 5),
                { ...createUsageLine(0, 0, 0), consumption: undefined },
                { ...createUsageLine(0, 0, 0), limit: undefined },
            ];
            const result = calculateEstimateTotals(
                'estimate',
                0,
                0,
                0,
                10,
                [],
                usageLines,
            );

            // ceil(7M/1M)*5 = 35; missing consumption/limit lines contribute 0
            expect(result).toEqual({
                subtotal: 35,
                taxAmount: 3.5,
                totalAmount: 38.5,
            });
        });

        it('handles zero tax percentage', () => {
            const mainLines = [createMainLine(1000)];
            const result = calculateEstimateTotals(
                'estimate',
                0,
                0,
                0,
                0,
                mainLines,
                [],
            );

            expect(result).toEqual({
                subtotal: 1000,
                taxAmount: 0,
                totalAmount: 1000,
            });
        });

        it('handles undefined tax percentage', () => {
            const mainLines = [createMainLine(1000)];
            const result = calculateEstimateTotals(
                'estimate',
                0,
                0,
                0,
                undefined,
                mainLines,
                [],
            );

            expect(result).toEqual({
                subtotal: 1000,
                taxAmount: 0,
                totalAmount: 1000,
            });
        });

        it('handles empty arrays', () => {
            const result = calculateEstimateTotals(
                'estimate',
                0,
                0,
                0,
                15,
                [],
                [],
            );

            expect(result).toEqual({
                subtotal: 0,
                taxAmount: 0,
                totalAmount: 0,
            });
        });

        it('handles main lines with zero totalAmount', () => {
            const mainLines = [
                createMainLine(1000),
                createMainLine(0),
                createMainLine(500),
            ];
            const result = calculateEstimateTotals(
                'estimate',
                0,
                0,
                0,
                10,
                mainLines,
                [],
            );

            expect(result).toEqual({
                subtotal: 1500,
                taxAmount: 150,
                totalAmount: 1650,
            });
        });

        it('handles usage lines with zero unitPrice', () => {
            const usageLines = [
                createUsageLine(60_000_000, 53_000_000, 5),
                createUsageLine(60_000_000, 53_000_000, 0),
            ];
            const result = calculateEstimateTotals(
                'estimate',
                0,
                0,
                0,
                10,
                [],
                usageLines,
            );

            // ceil(7M/1M)*5 + ceil(7M/1M)*0 = 35 + 0 = 35
            expect(result).toEqual({
                subtotal: 35,
                taxAmount: 3.5,
                totalAmount: 38.5,
            });
        });

        it('rounds up overage bundles', () => {
            const usageLines = [createUsageLine(53_500_000, 53_000_000, 5)];
            const result = calculateEstimateTotals(
                'estimate',
                0,
                0,
                0,
                10,
                [],
                usageLines,
            );

            // ceil(500_000/1M) = 1 bundle, 1*5 = 5
            expect(result).toEqual({
                subtotal: 5,
                taxAmount: 0.5,
                totalAmount: 5.5,
            });
        });
    });
});
