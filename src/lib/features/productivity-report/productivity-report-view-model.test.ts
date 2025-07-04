import {
    productivityReportViewModel,
    type ProductivityReportMetrics,
} from './productivity-report-view-model.js';

const mockData = {
    unleashUrl: 'http://example.com',
    userEmail: 'user@example.com',
    userName: 'Test User',
};
const mockMetrics = {
    health: 0,
    flagsCreated: 0,
    productionUpdates: 0,
    previousMonth: {
        health: 0,
        flagsCreated: 0,
        productionUpdates: 0,
    },
};

describe('productivityReportViewModel', () => {
    it('should show technical debt', () => {
        const viewModel = productivityReportViewModel({
            ...mockData,
            metrics: {
                ...mockMetrics,
                health: 85,
            },
        });

        expect(viewModel.technicalDebt).toBe('15');
    });

    describe('healthColor', () => {
        it('returns RED for technical debt between 75 and 100', () => {
            const metrics: ProductivityReportMetrics = {
                ...mockMetrics,
                health: 20,
            };

            const viewModel = productivityReportViewModel({
                ...mockData,
                metrics,
            });

            expect(viewModel.technicalDebtColor()).toBe('#d93644');
        });

        it('returns ORANGE for technical debt between 25 and 74', () => {
            const metrics: ProductivityReportMetrics = {
                ...mockMetrics,
                health: 50,
            };

            const viewModel = productivityReportViewModel({
                ...mockData,
                metrics,
            });

            expect(viewModel.technicalDebtColor()).toBe('#d76500');
        });

        it('returns GREEN for technical debt below 25', () => {
            const metrics: ProductivityReportMetrics = {
                ...mockMetrics,
                health: 80,
            };

            const viewModel = productivityReportViewModel({
                ...mockData,
                metrics,
            });

            expect(viewModel.technicalDebtColor()).toBe('#68a611');
        });
    });

    describe('technicalDebtTrendMessage', () => {
        it('returns correct trend message when technica debt decreased', () => {
            const metrics: ProductivityReportMetrics = {
                ...mockMetrics,
                health: 80,
                previousMonth: { ...mockMetrics.previousMonth, health: 70 },
            };
            const viewModel = productivityReportViewModel({
                ...mockData,
                metrics,
            });

            expect(viewModel.technicalDebtTrendMessage()).toMatchInlineSnapshot(
                `"<span style='color: #68a611'>&#9660;</span> 10% less than previous month"`,
            );
        });

        it('returns correct trend message when technical debt increased', () => {
            const metrics: ProductivityReportMetrics = {
                ...mockMetrics,
                health: 60,
                previousMonth: { ...mockMetrics.previousMonth, health: 70 },
            };
            const viewModel = productivityReportViewModel({
                ...mockData,
                metrics,
            });

            expect(viewModel.technicalDebtTrendMessage()).toMatchInlineSnapshot(
                `"<span style='color: #d93644'>&#9650;</span> 10% more than previous month"`,
            );
        });

        it('returns correct message when technical debt is the same', () => {
            const metrics: ProductivityReportMetrics = {
                ...mockMetrics,
                health: 70,
                previousMonth: { ...mockMetrics.previousMonth, health: 70 },
            };
            const viewModel = productivityReportViewModel({
                ...mockData,
                metrics,
            });

            expect(viewModel.technicalDebtTrendMessage()).toMatchInlineSnapshot(
                `"Same as last month"`,
            );
        });
    });

    describe('flagsCreatedTrendMessage', () => {
        it('returns correct trend message for flagsCreated increase', () => {
            const metrics: ProductivityReportMetrics = {
                ...mockMetrics,
                flagsCreated: 10,
                previousMonth: {
                    ...mockMetrics.previousMonth,
                    flagsCreated: 8,
                },
            };
            const viewModel = productivityReportViewModel({
                ...mockData,
                metrics,
            });
            expect(viewModel.flagsCreatedTrendMessage()).toMatchInlineSnapshot(
                `"<span style='color: #68a611'>&#9650;</span> 2 more than previous month"`,
            );
        });
    });
    describe('productionUpdatedTrendMessage', () => {
        it('returns correct trend message for productionUpdates decrease', () => {
            const metrics: ProductivityReportMetrics = {
                ...mockMetrics,
                productionUpdates: 5,
                previousMonth: {
                    ...mockMetrics.previousMonth,
                    productionUpdates: 8,
                },
            };
            const viewModel = productivityReportViewModel({
                ...mockData,
                metrics,
            });
            expect(
                viewModel.productionUpdatedTrendMessage(),
            ).toMatchInlineSnapshot(
                `"<span style='color: #d93644'>&#9660;</span> 3 less than previous month"`,
            );
        });
    });
    describe('Missing previous month data', () => {
        it('returns no trends messages', () => {
            const metrics: ProductivityReportMetrics = {
                health: 100,
                flagsCreated: 10,
                productionUpdates: 5,
                previousMonth: null,
            };
            const viewModel = productivityReportViewModel({
                ...mockData,
                metrics,
            });

            expect(viewModel.technicalDebtTrendMessage()).toBe(null);
            expect(viewModel.flagsCreatedTrendMessage()).toBe(null);
            expect(viewModel.productionUpdatedTrendMessage()).toBe(null);
        });
    });

    describe('Action text', () => {
        it('healthy instance', () => {
            const metrics: ProductivityReportMetrics = {
                ...mockMetrics,
                health: 75,
                previousMonth: {
                    ...mockMetrics.previousMonth,
                    health: 75,
                },
            };

            const viewModel = productivityReportViewModel({
                ...mockData,
                metrics,
            });

            expect(viewModel.actionText()).toBe(null);
        });

        it('health declined', () => {
            const metrics: ProductivityReportMetrics = {
                ...mockMetrics,
                health: 75,
                previousMonth: {
                    ...mockMetrics.previousMonth,
                    health: 76,
                },
            };

            const viewModel = productivityReportViewModel({
                ...mockData,
                metrics,
            });

            expect(viewModel.actionText()).toMatchInlineSnapshot(
                `"Remember to archive stale flags to reduce technical debt and keep your project healthy"`,
            );
        });

        it('health improved but below healthy threshold', () => {
            const metrics: ProductivityReportMetrics = {
                ...mockMetrics,
                health: 74,
                previousMonth: {
                    ...mockMetrics.previousMonth,
                    health: 73,
                },
            };

            const viewModel = productivityReportViewModel({
                ...mockData,
                metrics,
            });

            expect(viewModel.actionText()).toMatchInlineSnapshot(
                `"Remember to archive stale flags to reduce technical debt and keep your project healthy"`,
            );
        });

        it('healthy with no previous month data', () => {
            const metrics: ProductivityReportMetrics = {
                ...mockMetrics,
                health: 75,
                previousMonth: null,
            };

            const viewModel = productivityReportViewModel({
                ...mockData,
                metrics,
            });

            expect(viewModel.actionText()).toBe(null);
        });
    });
});
