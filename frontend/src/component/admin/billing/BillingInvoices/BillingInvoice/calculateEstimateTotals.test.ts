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
                taxAmount: 225, // 1500 * 0.15
                totalAmount: 1725, // 1500 + 225
            });
        });

        it('calculates totals correctly with usage lines only', () => {
            const usageLines = [
                createUsageLine(100, 50, 2), // 50 overage * 2 = 100
                createUsageLine(200, 150, 1.5), // 50 overage * 1.5 = 75
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

            expect(result).toEqual({
                subtotal: 175, // 100 + 75
                taxAmount: 35, // 175 * 0.20
                totalAmount: 210, // 175 + 35
            });
        });

        it('calculates totals correctly with both main and usage lines', () => {
            const mainLines = [createMainLine(1000)];
            const usageLines = [createUsageLine(100, 50, 2)]; // 50 overage * 2 = 100
            const result = calculateEstimateTotals(
                'estimate',
                0,
                0,
                0,
                10,
                mainLines,
                usageLines,
            );

            expect(result).toEqual({
                subtotal: 1100, // 1000 + 100
                taxAmount: 110, // 1100 * 0.10
                totalAmount: 1210, // 1100 + 110
            });
        });

        it('handles usage lines with no overage', () => {
            const usageLines = [
                createUsageLine(30, 50, 2), // No overage
                createUsageLine(100, 100, 1.5), // No overage
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
                subtotal: 0, // No overage charges
                taxAmount: 0, // 0 * 0.15
                totalAmount: 0, // 0 + 0
            });
        });

        it('handles usage lines with missing consumption or limit', () => {
            const usageLines = [
                createUsageLine(100, 50, 2), // Normal overage
                { ...createUsageLine(0, 0, 0), consumption: undefined }, // No consumption
                { ...createUsageLine(0, 0, 0), limit: undefined }, // No limit
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

            expect(result).toEqual({
                subtotal: 100, // Only the first line contributes
                taxAmount: 10, // 100 * 0.10
                totalAmount: 110, // 100 + 10
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
                taxAmount: 0, // 0% tax
                totalAmount: 1000, // 1000 + 0
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
                taxAmount: 0, // undefined tax percentage
                totalAmount: 1000, // 1000 + 0
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
                subtotal: 1500, // 1000 + 0 + 500
                taxAmount: 150, // 1500 * 0.10
                totalAmount: 1650, // 1500 + 150
            });
        });

        it('handles usage lines with zero unitPrice', () => {
            const usageLines = [
                createUsageLine(100, 50, 2), // Normal overage
                createUsageLine(200, 100, 0), // Zero unit price
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

            expect(result).toEqual({
                subtotal: 100, // Only first line contributes (50 * 2)
                taxAmount: 10, // 100 * 0.10
                totalAmount: 110, // 100 + 10
            });
        });
    });
});
