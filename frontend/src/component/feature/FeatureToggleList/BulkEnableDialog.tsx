import { useState } from 'react';
import { Alert, Box, styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import useToast from 'hooks/useToast';
import type { FeatureSchema } from 'openapi';

import { formatUnknownError } from 'utils/formatUnknownError';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IExportDialogProps {
    showExportDialog: boolean;
    data: Pick<FeatureSchema, 'name' | 'environments'>[];
    onClose: () => void;
    onConfirm?: () => void;
    environments: string[];
    projectId: string;
}

const StyledSelect = styled(GeneralSelect)(({ theme }) => ({
    minWidth: '450px',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
}));

const SpacedAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(1.5),
}));

export const BulkEnableDialog = ({
    showExportDialog,
    data,
    onClose,
    onConfirm,
    environments,
    projectId,
}: IExportDialogProps) => {
    const [selected, setSelected] = useState(environments[0]);
    const { bulkToggleFeaturesEnvironmentOn } = useFeatureApi();
    const { addChange } = useChangeRequestApi();
    const { setToastApiError, setToastData } = useToast();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const alreadyEnabledCount = data.filter(
        (feature) =>
            feature.environments?.find(
                (environment) => selected === environment.name,
            )?.enabled === true,
    ).length;

    const getOptions = () =>
        environments.map((env) => ({
            key: env,
            label: env,
        }));

    const onClick = async () => {
        try {
            if (isChangeRequestConfigured(selected)) {
                await addChange(
                    projectId,
                    selected,
                    data.map((feature) => ({
                        action: 'updateEnabled',
                        feature: feature.name,
                        payload: { enabled: true },
                    })),
                );
                refetchChangeRequests();
                setToastData({
                    type: 'success',
                    text: 'Changes added to draft',
                });
            } else {
                await bulkToggleFeaturesEnvironmentOn(
                    projectId,
                    data.map((feature) => feature.name),
                    selected,
                );
                setToastData({
                    type: 'success',
                    text: 'Feature flags enabled',
                });
            }

            onClose();
            onConfirm?.();
        } catch (e: unknown) {
            setToastApiError(formatUnknownError(e));
        }
    };

    const buttonText = isChangeRequestConfigured(selected)
        ? 'Add to change request'
        : 'Enable flags';

    return (
        <Dialogue
            open={showExportDialog}
            title='Enable feature flags'
            onClose={onClose}
            onClick={onClick}
            primaryButtonText={buttonText}
            secondaryButtonText='Cancel'
        >
            <Box>
                You have selected <b>{data.length}</b> feature flags to enable.
                <br />
                <br />
                <Typography>
                    Select which environment to enable the features for:
                </Typography>
                <StyledSelect
                    options={getOptions()}
                    value={selected}
                    onChange={(option: string) => setSelected(option)}
                />
                <ConditionallyRender
                    condition={isChangeRequestConfigured(selected)}
                    show={
                        <SpacedAlert severity='warning'>
                            Change requests are enabled for this environment.
                        </SpacedAlert>
                    }
                />
                <ConditionallyRender
                    condition={alreadyEnabledCount > 0}
                    show={
                        <SpacedAlert severity='info'>
                            {alreadyEnabledCount} feature{' '}
                            {alreadyEnabledCount > 1
                                ? 'flags are '
                                : 'flag is '}
                            already enabled.
                        </SpacedAlert>
                    }
                />
            </Box>
        </Dialogue>
    );
};
