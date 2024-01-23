import { type Db } from '../../server-impl';

export type GetProductionChanges = () => Promise<{
    last30: number;
    last60: number;
    last90: number;
}>;

export const createGetProductionChanges =
    (db: Db): GetProductionChanges =>
    async () => {
        const productionChanges = await db.raw(`SELECT SUM(CASE WHEN seu.day > NOW() - INTERVAL '30 days' THEN seu.updates END) AS last_month,
                         SUM(CASE WHEN seu.day > NOW() - INTERVAL '60 days' THEN seu.updates END) AS last_two_months,
                         SUM(CASE WHEN seu.day > NOW() - INTERVAL '90 days' THEN seu.updates END) AS last_quarter
                  FROM stat_environment_updates seu
                  LEFT JOIN environments e
                    ON e.name = seu.environment
                  WHERE e.type = 'production';`);
        return {
            last30: parseInt(productionChanges.rows[0]?.last_month || '0', 10),
            last60: parseInt(
                productionChanges.rows[0]?.last_two_months || '0',
                10,
            ),
            last90: parseInt(
                productionChanges.rows[0]?.last_quarter || '0',
                10,
            ),
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
