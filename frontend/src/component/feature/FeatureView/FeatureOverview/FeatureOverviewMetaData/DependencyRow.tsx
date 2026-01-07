import { AddDependencyDialogue } from 'component/feature/Dependencies/AddDependencyDialogue';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { useState } from 'react';
import { StyledLink } from '../FeatureOverviewSidePanel/FeatureOverviewSidePanelDetails/StyledRow.tsx';
import { ExtraActions } from './ExtraActions.tsx';
import { useDependentFeaturesApi } from 'hooks/api/actions/useDependentFeaturesApi/useDependentFeaturesApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { ChildrenTooltip } from './ChildrenTooltip.tsx';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { UPDATE_FEATURE_DEPENDENCY } from 'component/providers/AccessProvider/permissions';
import { useCheckProjectAccess } from 'hooks/useHasAccess';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import useToast from 'hooks/useToast';
import { useHighestPermissionChangeRequestEnvironment } from 'hooks/useHighestPermissionChangeRequestEnvironment';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { formatUnknownError } from 'utils/formatUnknownError';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { VariantsTooltip } from './VariantsTooltip.tsx';
import { styled } from '@mui/material';
import {
    StyledMetaDataItem,
    StyledMetaDataItemLabel,
    StyledMetaDataItemValue,
} from './FeatureOverviewMetaData.tsx';
import { Truncator } from 'component/common/Truncator/Truncator';

const StyledPermissionButton = styled(PermissionButton)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    lineHeight: theme.typography.body1.lineHeight,
}));

const useDeleteDependency = (project: string, featureId: string) => {
    const { trackEvent } = usePlausibleTracker();
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(project);
    const { setToastData, setToastApiError } = useToast();
    const { refetchFeature } = useFeature(project, featureId);
    const environment = useHighestPermissionChangeRequestEnvironment(project)();
    const { isChangeRequestConfiguredInAnyEnv } =
        useChangeRequestsEnabled(project);
    const { removeDependencies } = useDependentFeaturesApi(project);

    const handleAddChange = async () => {
        if (!environment) {
            console.error('No change request environment');
            return;
        }
        await addChange(project, environment, [
            {
                action: 'deleteDependency',
                feature: featureId,
                payload: undefined,
            },
        ]);
    };

    const deleteDependency = async () => {
        try {
            if (isChangeRequestConfiguredInAnyEnv()) {
                await handleAddChange();
                trackEvent('dependent_features', {
                    props: {
                        eventType: 'delete dependency added to change request',
                    },
                });
                setToastData({
                    type: 'success',
                    text: 'Change added to draft',
                });
                await refetchChangeRequests();
            } else {
                await removeDependencies(featureId);
                trackEvent('dependent_features', {
                    props: {
                        eventType: 'dependency removed',
                    },
                });
                setToastData({ text: 'Dependency removed', type: 'success' });
                await refetchFeature();
            }
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return deleteDependency;
};

interface IDependencyRowProps {
    feature: IFeatureToggle;
}

export const DependencyRow = ({ feature }: IDependencyRowProps) => {
    const [showDependencyDialogue, setShowDependencyDialogue] = useState(false);
    const canAddParentDependency =
        Boolean(feature.project) &&
        feature.dependencies.length === 0 &&
        feature.children.length === 0;
    const hasParentDependency =
        Boolean(feature.project) && Boolean(feature.dependencies.length > 0);
    const hasChildren = Boolean(feature.project) && feature.children.length > 0;
    const environment = useHighestPermissionChangeRequestEnvironment(
        feature.project,
    )();
    const checkAccess = useCheckProjectAccess(feature.project);
    const deleteDependency = useDeleteDependency(feature.project, feature.name);

    return (
        <>
            {canAddParentDependency ? (
                <StyledMetaDataItem>
                    <StyledMetaDataItemLabel>
                        Dependency:
                    </StyledMetaDataItemLabel>
                    <div>
                        <StyledPermissionButton
                            size='small'
                            permission={UPDATE_FEATURE_DEPENDENCY}
                            projectId={feature.project}
                            variant='text'
                            onClick={() => {
                                setShowDependencyDialogue(true);
                            }}
                        >
                            Add parent flag
                        </StyledPermissionButton>
                    </div>
                </StyledMetaDataItem>
            ) : null}
            {hasParentDependency ? (
                <StyledMetaDataItem>
                    <StyledMetaDataItemLabel>
                        Dependency:
                    </StyledMetaDataItemLabel>
                    <StyledMetaDataItemValue>
                        <StyledLink
                            to={`/projects/${feature.project}/features/${feature.dependencies[0]?.feature}`}
                        >
                            <Truncator title={feature.dependencies[0]?.feature}>
                                {feature.dependencies[0]?.feature}
                            </Truncator>
                        </StyledLink>
                        {checkAccess(UPDATE_FEATURE_DEPENDENCY, environment) ? (
                            <ExtraActions
                                capabilityId='dependency'
                                feature={feature.name}
                                onEdit={() => setShowDependencyDialogue(true)}
                                onDelete={deleteDependency}
                            />
                        ) : null}
                    </StyledMetaDataItemValue>
                </StyledMetaDataItem>
            ) : null}
            {hasParentDependency && !feature.dependencies[0]?.enabled ? (
                <StyledMetaDataItem>
                    <StyledMetaDataItemLabel>
                        Dependency value:
                    </StyledMetaDataItemLabel>
                    <span>disabled</span>
                </StyledMetaDataItem>
            ) : null}
            {hasParentDependency &&
            Boolean(feature.dependencies[0]?.variants?.length) ? (
                <StyledMetaDataItem>
                    <StyledMetaDataItemLabel>
                        Dependency value:
                    </StyledMetaDataItemLabel>
                    <VariantsTooltip
                        variants={feature.dependencies[0]?.variants || []}
                    />
                </StyledMetaDataItem>
            ) : null}
            {hasChildren ? (
                <StyledMetaDataItem>
                    <StyledMetaDataItemLabel>Children:</StyledMetaDataItemLabel>
                    <ChildrenTooltip
                        childFeatures={feature.children}
                        project={feature.project}
                    />
                </StyledMetaDataItem>
            ) : null}
            {feature.project ? (
                <AddDependencyDialogue
                    project={feature.project}
                    featureId={feature.name}
                    parentDependency={feature.dependencies[0]}
                    onClose={() => setShowDependencyDialogue(false)}
                    showDependencyDialogue={showDependencyDialogue}
                />
            ) : null}
        </>
    );
};
