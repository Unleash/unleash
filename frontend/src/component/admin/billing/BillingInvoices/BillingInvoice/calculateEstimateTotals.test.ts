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
                createUsageLine(100, 50, 2),
                createUsageLine(200, 150, 1.5),
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
                subtotal: 175,
                taxAmount: 35,
                totalAmount: 210,
            });
        });

        it('calculates totals correctly with both main and usage lines', () => {
            const mainLines = [createMainLine(1000)];
            const usageLines = [createUsageLine(100, 50, 2)];
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
                subtotal: 1100,
                taxAmount: 110,
                totalAmount: 1210,
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
                createUsageLine(100, 50, 2),
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

            expect(result).toEqual({
                subtotal: 100,
                taxAmount: 10,
                totalAmount: 110,
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
                createUsageLine(100, 50, 2),
                createUsageLine(200, 100, 0),
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
                subtotal: 100,
                taxAmount: 10,
                totalAmount: 110,
            });
        });

        it('rounds down overages to integers', () => {
            const usageLines = [
                createUsageLine(150.7, 100, 2),
                createUsageLine(200.3, 150, 1.5),
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
                subtotal: 175,
                taxAmount: 17.5,
                totalAmount: 192.5,
            });
        });
    });
});
