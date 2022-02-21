import { calculatePercentage } from '../../../../../utils/calculate-percentage';
import { useStyles } from './FeatureMetricsStats.styles';
import { Grid } from '@material-ui/core';

interface IFeatureMetricsStatsProps {
    totalYes: number;
    totalNo: number;
    hoursBack: number;
}

export const FeatureMetricsStats = ({
    totalYes,
    totalNo,
    hoursBack,
}: IFeatureMetricsStatsProps) => {
    const styles = useStyles();

    const hoursSuffix =
        hoursBack === 1 ? 'in the last hour' : `in the last ${hoursBack} hours`;

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
                <article className={styles.item}>
                    <h3 className={styles.title}>Exposure</h3>
                    <p className={styles.value}>{totalYes}</p>
                    <p className={styles.text}>
                        Total exposure of the feature in the environment{' '}
                        {hoursSuffix}.
                    </p>
                </article>
            </Grid>
            <Grid item xs={12} sm={4}>
                <article className={styles.item}>
                    <h3 className={styles.title}>Exposure %</h3>
                    <p className={styles.value}>
                        {calculatePercentage(totalYes + totalNo, totalYes)}%
                    </p>
                    <p className={styles.text}>
                        % total exposure of the feature in the environment{' '}
                        {hoursSuffix}.
                    </p>
                </article>
            </Grid>
            <Grid item xs={12} sm={4}>
                <article className={styles.item}>
                    <h3 className={styles.title}>Requests</h3>
                    <p className={styles.value}>{totalYes + totalNo}</p>
                    <p className={styles.text}>
                        Total requests for the feature in the environment{' '}
                        {hoursSuffix}.
                    </p>
                </article>
            </Grid>
        </Grid>
    );
};
