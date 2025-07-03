export type ProductivityReportMetrics = {
    health: number;
    flagsCreated: number;
    productionUpdates: number;
    previousMonth: {
        health: number;
        flagsCreated: number;
        productionUpdates: number;
    } | null;
};

const RED = '#d93644';
const GREEN = '#68a611';
const ORANGE = '#d76500';

export const productivityReportViewModel = ({
    unleashUrl,
    userEmail,
    userName,
    metrics,
}: {
    unleashUrl: string;
    userEmail: string;
    userName: string;
    metrics: ProductivityReportMetrics;
}) => ({
    userName,
    userEmail,
    flagsCreated: metrics.flagsCreated,
    productionUpdates: metrics.productionUpdates,
    previousMonth: metrics.previousMonth,
    health: metrics.health,
    technicalDebt: Math.max(0, 100 - metrics.health).toString(),
    unleashUrl,
    technicalDebtColor() {
        const technicalDebtRating = Math.max(0, 100 - metrics.health);
        if (technicalDebtRating < 25) {
            return GREEN;
        }
        if (technicalDebtRating < 75) {
            return ORANGE;
        }
        return RED;
    },
    actionText(): string | null {
        const improveMessage =
            'Remember to archive stale flags to reduce technical debt and keep your project healthy';
        const previousHealth = this.previousMonth?.health || 0;
        if (this.health <= 74) {
            return improveMessage;
        }
        if (this.health < previousHealth) {
            return improveMessage;
        }
        return null;
    },
    technicalDebtTrendMessage() {
        return this.previousMonthText(
            '%',
            100 - this.health,
            this.previousMonth ? 100 - this.previousMonth.health : undefined,
            true,
        );
    },
    flagsCreatedTrendMessage() {
        return this.previousMonthText(
            '',
            this.flagsCreated,
            this.previousMonth?.flagsCreated,
        );
    },
    productionUpdatedTrendMessage() {
        return this.previousMonthText(
            '',
            this.productionUpdates,
            this.previousMonth?.productionUpdates,
        );
    },
    previousMonthText(
        unit: '' | '%',
        currentValue: number,
        previousValue?: number,
        reversed: boolean = false,
    ) {
        if (previousValue == null) {
            return null;
        }
        if (currentValue > previousValue) {
            const color = reversed ? RED : GREEN;
            return `<span style='color: ${color}'>&#9650;</span> ${currentValue - previousValue}${unit} more than previous month`;
        }
        if (previousValue > currentValue) {
            const color = reversed ? GREEN : RED;
            return `<span style='color: ${color}'>&#9660;</span> ${previousValue - currentValue}${unit} less than previous month`;
        }
        return `Same as last month`;
    },
});
