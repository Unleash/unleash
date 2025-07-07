import { Link } from 'react-router-dom';
import { getCreateTogglePath } from 'utils/routePathHelpers';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { styled } from '@mui/material';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';

const StyledFeatureId = styled('strong')({
    wordBreak: 'break-all',
});

export const FeatureNotFound = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { features: archivedFeatures } = useFeatureSearch({
        project: `IS:${projectId}`,
        archived: 'IS:true',
    });

    const createFeatureTogglePath = getCreateTogglePath(projectId, {
        name: featureId,
    });

    if (!archivedFeatures) {
        return null;
    }

    const isArchived = archivedFeatures.some((archivedFeature) => {
        return archivedFeature.name === featureId;
    });

    if (isArchived) {
        return (
            <p>
                The feature <StyledFeatureId>{featureId}</StyledFeatureId> has
                been archived. You can find it on the{' '}
                <Link to={`/projects/${projectId}?archived=IS%3Atrue`}>
                    project overview with archived flags filter
                </Link>
                .
            </p>
        );
    }

    return (
        <p>
            The feature <StyledFeatureId>{featureId}</StyledFeatureId> does not
            exist. Would you like to{' '}
            <Link to={createFeatureTogglePath}>create it</Link>?
        </p>
    );
};
