import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCreateTogglePath } from 'utils/routePathHelpers';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useStyles } from 'component/feature/FeatureView/FeatureNotFound/FeatureNotFound.styles';
import { IFeatureViewParams } from 'interfaces/params';
import { useFeaturesArchive } from 'hooks/api/getters/useFeaturesArchive/useFeaturesArchive';

export const FeatureNotFound = () => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { archivedFeatures } = useFeaturesArchive();
    const styles = useStyles();
    const { uiConfig } = useUiConfig();

    const createFeatureTogglePath = getCreateTogglePath(
        projectId,
        uiConfig.flags.E,
        { name: featureId }
    );

    const isArchived = archivedFeatures.some(archivedFeature => {
        return archivedFeature.name === featureId;
    });

    if (isArchived) {
        return (
            <p>
                The feature{' '}
                <strong className={styles.featureId}>{featureId}</strong> has
                been archived. You can find it on the{' '}
                <Link to={'/archive'}>archive page</Link>.
            </p>
        );
    }

    return (
        <p>
            The feature{' '}
            <strong className={styles.featureId}>{featureId}</strong> does not
            exist. Would you like to{' '}
            <Link to={createFeatureTogglePath}>create it</Link>?
        </p>
    );
};
