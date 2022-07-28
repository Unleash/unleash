import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { DonutLarge } from '@mui/icons-material';
import { useStyles } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewSegment/FeatureOverviewSegment.styles';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';

interface IFeatureOverviewSegmentProps {
    strategyId: string;
}

export const FeatureOverviewSegment = ({
    strategyId,
}: IFeatureOverviewSegmentProps) => {
    const { classes: styles } = useStyles();
    const { segments } = useSegments(strategyId);

    if (!segments || segments.length === 0) {
        return null;
    }

    return (
        <>
            {segments.map(segment => (
                <Fragment key={segment.id}>
                    <div className={styles.container}>
                        <DonutLarge color="secondary" sx={{ mr: 1 }} /> Segment:{' '}
                        <Link
                            to={segmentPath(segment.id)}
                            className={styles.link}
                        >
                            {segment.name}
                        </Link>
                    </div>
                    <StrategySeparator text="AND" />
                </Fragment>
            ))}
        </>
    );
};

const segmentPath = (segmentId: number): string => {
    return `/segments/edit/${segmentId}`;
};
