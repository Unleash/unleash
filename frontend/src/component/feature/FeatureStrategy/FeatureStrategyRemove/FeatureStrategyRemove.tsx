import React, { useState } from 'react';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useHistory } from 'react-router-dom';
import useToast from 'hooks/useToast';
import { formatFeaturePath } from '../FeatureStrategyEdit/FeatureStrategyEdit';
import Dialogue from '../../../common/Dialogue';
import { Alert } from '@material-ui/lab';
import PermissionButton from '../../../common/PermissionButton/PermissionButton';
import { DELETE_FEATURE_STRATEGY } from '../../../providers/AccessProvider/permissions';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { STRATEGY_FORM_REMOVE_ID } from 'testIds';
import ConditionallyRender from 'component/common/ConditionallyRender';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { Delete } from '@material-ui/icons';

interface IFeatureStrategyRemoveProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    strategyId: string;
    disabled?: boolean;
    icon?: boolean;
}

export const FeatureStrategyRemove = ({
    projectId,
    featureId,
    environmentId,
    strategyId,
    disabled,
    icon,
}: IFeatureStrategyRemoveProps) => {
    const [openDialogue, setOpenDialogue] = useState(false);
    const { deleteStrategyFromFeature } = useFeatureStrategyApi();
    const { refetchFeature } = useFeature(projectId, featureId);
    const { setToastData, setToastApiError } = useToast();
    const { push } = useHistory();

    const onRemove = async (event: React.FormEvent) => {
        try {
            event.preventDefault();
            await deleteStrategyFromFeature(
                projectId,
                featureId,
                environmentId,
                strategyId
            );
            setToastData({
                title: 'Strategy deleted',
                type: 'success',
            });
            refetchFeature();
            push(formatFeaturePath(projectId, featureId));
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <>
            <ConditionallyRender
                condition={Boolean(icon)}
                show={
                    <PermissionIconButton
                        onClick={() => setOpenDialogue(true)}
                        projectId={projectId}
                        environmentId={environmentId}
                        disabled={disabled}
                        permission={DELETE_FEATURE_STRATEGY}
                        data-test={STRATEGY_FORM_REMOVE_ID}
                        type="button"
                    >
                        <Delete titleAccess="Delete strategy" />
                    </PermissionIconButton>
                }
                elseShow={
                    <PermissionButton
                        onClick={() => setOpenDialogue(true)}
                        projectId={projectId}
                        environmentId={environmentId}
                        disabled={disabled}
                        permission={DELETE_FEATURE_STRATEGY}
                        data-test={STRATEGY_FORM_REMOVE_ID}
                        color="secondary"
                        variant="text"
                        type="button"
                    >
                        Delete strategy
                    </PermissionButton>
                }
            />
            <Dialogue
                title="Are you sure you want to delete this strategy?"
                open={openDialogue}
                primaryButtonText="Delete strategy"
                secondaryButtonText="Cancel"
                onClick={onRemove}
                onClose={() => setOpenDialogue(false)}
            >
                <Alert severity="error">
                    Deleting the strategy will change which users receive access
                    to the feature.
                </Alert>
            </Dialogue>
        </>
    );
};
