import { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    useMediaQuery,
    useTheme,
} from '@material-ui/core';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { useMemo } from 'react';
import { formatDateYMDHMS } from 'utils/formatDate';

export const FEATURE_METRICS_TABLE_ID = 'feature-metrics-table-id';

interface IFeatureMetricsTableProps {
    metrics: IFeatureMetricsRaw[];
}

export const FeatureMetricsTable = ({ metrics }: IFeatureMetricsTableProps) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const { locationSettings } = useLocationSettings();

    const sortedMetrics = useMemo(() => {
        return [...metrics].sort((metricA, metricB) => {
            return metricB.timestamp.localeCompare(metricA.timestamp);
        });
    }, [metrics]);

    if (sortedMetrics.length === 0) {
        return null;
    }

    return (
        <Table id={FEATURE_METRICS_TABLE_ID}>
            <TableHead>
                <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell hidden={smallScreen}>Application</TableCell>
                    <TableCell hidden={smallScreen}>Environment</TableCell>
                    <TableCell align="right">Requested</TableCell>
                    <TableCell align="right">Exposed</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {sortedMetrics.map(metric => (
                    <TableRow key={metric.timestamp}>
                        <TableCell>
                            {formatDateYMDHMS(
                                metric.timestamp,
                                locationSettings.locale
                            )}
                        </TableCell>
                        <TableCell hidden={smallScreen}>
                            {metric.appName}
                        </TableCell>
                        <TableCell hidden={smallScreen}>
                            {metric.environment}
                        </TableCell>
                        <TableCell align="right">
                            {metric.yes + metric.no}
                        </TableCell>
                        <TableCell align="right">{metric.yes}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
