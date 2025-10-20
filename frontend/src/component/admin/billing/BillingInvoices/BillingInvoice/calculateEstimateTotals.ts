import type { DetailedInvoicesLineSchema } from 'openapi';

export const calculateEstimateTotals = (
    status: string,
    subtotal: number,
    taxAmount: number,
    totalAmount: number,
    taxPercentage: number | undefined,
    mainLines: DetailedInvoicesLineSchema[],
    usageLines: DetailedInvoicesLineSchema[],
) => {
    if (status !== 'estimate') {
        return {
            subtotal: subtotal,
            taxAmount: taxAmount,
            totalAmount: totalAmount,
        };
    }

    const mainLinesTotal = mainLines.reduce(
        (sum, line) => sum + (line.totalAmount || 0),
        0,
    );

    const usageLinesTotal = usageLines.reduce((sum, line) => {
        const overage =
            line.consumption && line.limit
                ? Math.floor(Math.max(0, line.consumption - line.limit))
                : 0;
        return sum + overage * (line.unitPrice || 0);
    }, 0);

    const calculatedSubtotal = mainLinesTotal + usageLinesTotal;
    const calculatedTaxAmount = taxPercentage
        ? calculatedSubtotal * (taxPercentage / 100)
        : 0;
    const calculatedTotalAmount = calculatedSubtotal + calculatedTaxAmount;

    return {
        subtotal: calculatedSubtotal,
        taxAmount: calculatedTaxAmount,
        totalAmount: calculatedTotalAmount,
    };
};
