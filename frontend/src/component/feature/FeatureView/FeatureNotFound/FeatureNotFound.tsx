import React from 'react';
import { Link } from 'react-router-dom';
import { getCreateTogglePath } from 'utils/routePathHelpers';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useStyles } from 'component/feature/FeatureView/FeatureNotFound/FeatureNotFound.styles';
import { useFeaturesArchive } from 'hooks/api/getters/useFeaturesArchive/useFeaturesArchive';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

export const FeatureNotFound = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { archivedFeatures } = useFeaturesArchive();
    const { classes: styles } = useStyles();
    const { uiConfig } = useUiConfig();

    const createFeatureTogglePath = getCreateTogglePath(
        projectId,
        uiConfig.flags.E,
        { name: featureId }
    );

    if (!archivedFeatures) {
        return null;
    }

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
