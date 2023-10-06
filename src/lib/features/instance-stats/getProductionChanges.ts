import { type Db } from 'lib/server-impl';
import { GetActiveUsers } from './getActiveUsers';

export type GetProductionChanges = () => Promise<{
    last30: number;
    last60: number;
    last90: number;
}>;

export const createGetProductionChanges =
    (db: Db): GetProductionChanges =>
    async () => {
        const productionChanges = await db
            .select({
                last_month: db.raw(
                    "SUM(CASE WHEN day > NOW() - INTERVAL '1 month' THEN updates END)",
                ),
                last_two_months: db.raw(
                    "SUM(CASE WHEN day > NOW() - INTERVAL '60 days' THEN updates END)",
                ),
                last_quarter: db.raw(
                    "SUM(CASE WHEN day > NOW() - INTERVAL '90 days' THEN updates END)",
                ),
            })
            .from('stat_environment_updates');
        return {
            last30: parseInt(productionChanges?.[0]?.last_month || '0', 10),
            last60: parseInt(
                productionChanges?.[0]?.last_two_months || '0',
                10,
            ),
            last90: parseInt(productionChanges?.[0]?.last_quarter || '0', 10),
        };
    };
export const createFakeGetProductionChanges =
    (
        changesInProduction: Awaited<ReturnType<GetProductionChanges>> = {
            last30: 0,
            last60: 0,
            last90: 0,
        },
    ): GetProductionChanges =>
    () =>
        Promise.resolve(changesInProduction);
