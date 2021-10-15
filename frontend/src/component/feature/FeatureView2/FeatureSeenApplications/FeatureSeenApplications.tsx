import useFeatureMetrics from '../../../../hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import { Link, useParams } from 'react-router-dom';
import { IFeatureViewParams } from '../../../../interfaces/params';
import { Grid } from '@material-ui/core';
import React from 'react';
import { useStyles } from './FeatureSeenApplications.styles';

const FeatureSeenApplications: React.FC = () => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { metrics } = useFeatureMetrics(projectId, featureId);
    const styles = useStyles()
    let seenApplications;
    if (metrics?.seenApplications?.length > 0) {
        seenApplications = metrics.seenApplications.map(appName => {
            return (<Grid item xs={4}>
                <Link
                    to={`/applications/${appName}`}
                    className={[
                        styles.listLink,
                        styles.truncate,
                    ].join(' ')}
                >
                    {appName}
                </Link>
            </Grid>)
        });
    } else {
        seenApplications = (<Grid item xs={12}><div>{'Not seen in any applications'}</div></Grid>);
    }

    return (
        <Grid container spacing={1}>
            <hr />
            {seenApplications}
        </Grid>
    );
}

export default FeatureSeenApplications;
