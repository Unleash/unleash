import { type FC, useState } from 'react';
import { Box, styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { useDependentFeaturesApi } from 'hooks/api/actions/useDependentFeaturesApi/useDependentFeaturesApi';
import { useParentOptions } from 'hooks/api/getters/useParentOptions/useParentOptions';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useHighestPermissionChangeRequestEnvironment } from 'hooks/useHighestPermissionChangeRequestEnvironment';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { DependenciesUpgradeAlert } from './DependenciesUpgradeAlert';
import { useUiFlag } from 'hooks/useUiFlag';

interface IAddDependencyDialogueProps {
    project: string;
    featureId: string;
    parentFeatureId?: string;
    parentFeatureValue?: ParentValue;
    showDependencyDialogue: boolean;
    onClose: () => void;
}

const StyledSelect = styled(GeneralSelect)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
}));

const REMOVE_DEPENDENCY_OPTION = {
    key: 'none (remove dependency)',
    label: 'none (remove dependency)',
};

// Project can have 100s of parents. We want to read them only when the modal for dependencies opens.
const LazyOptions: FC<{
    project: string;
    featureId: string;
    parent: string;
    onSelect: (parent: string) => void;
}> = ({ project, featureId, parent, onSelect }) => {
    const { parentOptions } = useParentOptions(project, featureId);

    const options = parentOptions
        ? [
              REMOVE_DEPENDENCY_OPTION,
              ...parentOptions.map((parent) => ({
                  key: parent,
                  label: parent,
              })),
          ]
        : [REMOVE_DEPENDENCY_OPTION];
    return (
        <StyledSelect
            fullWidth
            options={options}
            value={parent}
            onChange={onSelect}
        />
    );
};

const FeatureValueOptions: FC<{
    parentValue: ParentValue;
    onSelect: (parent: string) => void;
}> = ({ onSelect, parentValue }) => {
    return (
        <StyledSelect
            fullWidth
            options={[
                { key: 'enabled', label: 'enabled' },
                { key: 'disabled', label: 'disabled' },
            ]}
            value={parentValue.status}
            onChange={onSelect}
        />
    );
};

type ParentValue = { status: 'enabled' } | { status: 'disabled' };

const useManageDependency = (
    project: string,
    featureId: string,
    parent: string,
    parentValue: ParentValue,
    onClose: () => void,
) => {
    const { trackEvent } = usePlausibleTracker();
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(project);
    const { setToastData, setToastApiError } = useToast();
    const { refetchFeature } = useFeature(project, featureId);
    const environment = useHighestPermissionChangeRequestEnvironment(project)();
    const { isChangeRequestConfiguredInAnyEnv } =
        useChangeRequestsEnabled(project);
    const { addDependency, removeDependencies } =
        useDependentFeaturesApi(project);

    const handleAddChange = async (
        actionType: 'addDependency' | 'deleteDependency',
    ) => {
        if (!environment) {
            console.error('No change request environment');
            return;
        }
        if (actionType === 'addDependency') {
            await addChange(project, environment, [
                {
                    action: actionType,
                    feature: featureId,
                    payload: {
                        feature: parent,
                        enabled: parentValue.status !== 'disabled',
                    },
                },
            ]);
            trackEvent('dependent_features', {
                props: {
                    eventType: 'dependency added',
                },
            });
        }
        if (actionType === 'deleteDependency') {
            await addChange(project, environment, [
                { action: actionType, feature: featureId, payload: undefined },
            ]);
        }
        void refetchChangeRequests();
        setToastData({
            text:
                actionType === 'addDependency'
                    ? `${featureId} will depend on ${parent}`
                    : `${featureId} dependency will be removed`,
            type: 'success',
            title: 'Change added to a draft',
        });
    };

    return async () => {
        try {
            if (isChangeRequestConfiguredInAnyEnv()) {
                const actionType =
                    parent === REMOVE_DEPENDENCY_OPTION.key
                        ? 'deleteDependency'
                        : 'addDependency';
                await handleAddChange(actionType);
                trackEvent('dependent_features', {
                    props: {
                        eventType:
                            actionType === 'addDependency'
                                ? 'add dependency added to change request'
                                : 'delete dependency added to change request',
                    },
                });
            } else if (parent === REMOVE_DEPENDENCY_OPTION.key) {
                await removeDependencies(featureId);
                trackEvent('dependent_features', {
                    props: {
                        eventType: 'dependency removed',
                    },
                });
                setToastData({ title: 'Dependency removed', type: 'success' });
            } else {
                await addDependency(featureId, {
                    feature: parent,
                    enabled: parentValue.status !== 'disabled',
                });
                trackEvent('dependent_features', {
                    props: {
                        eventType: 'dependency added',
                    },
                });
                setToastData({ title: 'Dependency added', type: 'success' });
            }
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
        void refetchFeature();
        onClose();
    };
};

export const AddDependencyDialogue = ({
    project,
    featureId,
    parentFeatureId,
    parentFeatureValue,
    showDependencyDialogue,
    onClose,
}: IAddDependencyDialogueProps) => {
    const [parent, setParent] = useState(
        parentFeatureId || REMOVE_DEPENDENCY_OPTION.key,
    );
    const [parentValue, setParentValue] = useState<ParentValue>(
        parentFeatureValue || { status: 'enabled' },
    );
    const handleClick = useManageDependency(
        project,
        featureId,
        parent,
        parentValue,
        onClose,
    );
    const { isChangeRequestConfiguredInAnyEnv } =
        useChangeRequestsEnabled(project);

    const variantDependenciesEnabled = useUiFlag('variantDependencies');

    return (
        <Dialogue
            open={showDependencyDialogue}
            title='Add parent feature dependency'
            onClose={onClose}
            onClick={handleClick}
            primaryButtonText={
                isChangeRequestConfiguredInAnyEnv()
                    ? 'Add change to draft'
                    : parent === REMOVE_DEPENDENCY_OPTION.key
                      ? 'Remove'
                      : 'Add'
            }
            secondaryButtonText='Cancel'
        >
            <Box>
                <DependenciesUpgradeAlert />
                <Box sx={{ mt: 2, mb: 4 }}>
                    Your feature will be evaluated only when the selected parent
                    feature is{' '}
                    <b>
                        {parentValue.status === 'disabled'
                            ? 'disabled'
                            : 'enabled'}
                    </b>{' '}
                    in the same environment.
                </Box>

                <Typography>
                    What <b>feature</b> do you want to depend on?
                </Typography>
                <ConditionallyRender
                    condition={showDependencyDialogue}
                    show={
                        <LazyOptions
                            project={project}
                            featureId={featureId}
                            parent={parent}
                            onSelect={(status) => {
                                setParentValue({ status: 'enabled' });
                                setParent(status);
                            }}
                        />
                    }
                />

                <ConditionallyRender
                    condition={
                        parent !== REMOVE_DEPENDENCY_OPTION.key &&
                        variantDependenciesEnabled
                    }
                    show={
                        <Box sx={{ mt: 2 }}>
                            <Typography>
                                What <b>feature status</b> do you want to depend
                                on?
                            </Typography>
                            <FeatureValueOptions
                                parentValue={parentValue}
                                onSelect={(value) =>
                                    setParentValue({
                                        status:
                                            value === 'disabled'
                                                ? 'disabled'
                                                : 'enabled',
                                    })
                                }
                            />
                        </Box>
                    }
                />
            </Box>
        </Dialogue>
    );
};
