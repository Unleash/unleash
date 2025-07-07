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

const ARROW_UP = '&#9650;';
const ARROW_DOWN = '&#9660;';

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
}) => {
    const { health, previousMonth, flagsCreated, productionUpdates } = metrics;
    const technicalDebt = Math.max(0, 100 - health) || 0;

    return {
        userName,
        userEmail,
        flagsCreated,
        productionUpdates,
        previousMonth,
        health,
        technicalDebt: technicalDebt.toString(),
        unleashUrl,
        technicalDebtColor() {
            if (technicalDebt < 25) {
                return GREEN;
            }
            if (technicalDebt < 75) {
                return ORANGE;
            }
            return RED;
        },
        actionText(): string | null {
            const improveMessage =
                'Remember to archive stale flags to reduce technical debt and keep your project healthy';
            const previousHealth = previousMonth?.health || 0;
            if (health <= 74) {
                return improveMessage;
            }
            if (health < previousHealth) {
                return improveMessage;
            }
            return null;
        },
        technicalDebtTrendMessage() {
            if (!previousMonth || Number.isNaN(previousMonth.health)) {
                return null;
            }
            const previousTechnicalDebt = Math.max(
                0,
                100 - previousMonth.health,
            );

            if (technicalDebt > previousTechnicalDebt) {
                return `<span style='color: ${RED}'>${ARROW_UP}</span> ${technicalDebt - previousTechnicalDebt}% more than previous month`;
            }
            if (previousTechnicalDebt > technicalDebt) {
                return `<span style='color: ${GREEN}'>${ARROW_DOWN}</span> ${previousTechnicalDebt - technicalDebt}% less than previous month`;
            }
            return 'Same as last month';
        },
        flagsCreatedTrendMessage() {
            if (!previousMonth) {
                return null;
            }

            if (flagsCreated > previousMonth.flagsCreated) {
                return `<span style='color: ${GREEN}'>${ARROW_UP}</span> ${flagsCreated - previousMonth.flagsCreated} more than previous month`;
            }
            if (previousMonth.flagsCreated > flagsCreated) {
                return `<span style='color: ${RED}'>${ARROW_DOWN}</span> ${previousMonth.flagsCreated - flagsCreated} less than previous month`;
            }
            return 'Same as last month';
        },
        productionUpdatedTrendMessage() {
            if (!previousMonth) {
                return null;
            }

            if (productionUpdates > previousMonth.productionUpdates) {
                return `<span style='color: ${GREEN}'>${ARROW_UP}</span> ${productionUpdates - previousMonth.productionUpdates} more than previous month`;
            }
            if (previousMonth.productionUpdates > productionUpdates) {
                return `<span style='color: ${RED}'>${ARROW_DOWN}</span> ${previousMonth.productionUpdates - productionUpdates} less than previous month`;
            }
            return 'Same as last month';
        },
    };
};
