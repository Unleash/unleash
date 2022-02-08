import useFeatureMetrics from '../../../../hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import { Link, useParams } from 'react-router-dom';
import { IFeatureViewParams } from '../../../../interfaces/params';
import { Grid } from '@material-ui/core';
import React from 'react';
import { useStyles } from './FeatureSeenApplications.styles';
import ConditionallyRender from '../../../common/ConditionallyRender';

const FeatureSeenApplications: React.FC = () => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { metrics } = useFeatureMetrics(projectId, featureId);
    const styles = useStyles();
    const seenApplications = (seenApps: string[]) => {
        return seenApps.map(appName => {
            return (<Grid item md={4} xs={6} xl={3}>
                <Link
                    to={`/applications/${appName}`}
                    className={[
                        styles.listLink,
                        styles.truncate
                    ].join(' ')}
                >
                    {appName}
                </Link>
            </Grid>);
        });
    };

    const noApplications = (<Grid item xs={12}>
        <div>{'Not seen in any applications'}</div>
    </Grid>);


    return (
        <Grid container spacing={1}>
            <hr />
            <ConditionallyRender
                condition={metrics?.seenApplications?.length > 0}
                show={seenApplications(metrics.seenApplications)}
                elseShow={noApplications} />
        </Grid>
    );
};

export default FeatureSeenApplications;
