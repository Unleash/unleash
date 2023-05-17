import { useState } from 'react';
import { Box, styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import useToast from 'hooks/useToast';
import type { FeatureSchema } from 'openapi';

import { formatUnknownError } from 'utils/formatUnknownError';
import useFeatureApi from '../../../hooks/api/actions/useFeatureApi/useFeatureApi';

interface IExportDialogProps {
    showExportDialog: boolean;
    data: Pick<FeatureSchema, 'name'>[];
    onClose: () => void;
    onConfirm?: () => void;
    environments: string[];
    projectId: string;
}

const StyledSelect = styled(GeneralSelect)(({ theme }) => ({
    minWidth: '250px',
    marginTop: theme.spacing(2),
}));

export const BulkDisableDialog = ({
    showExportDialog,
    data,
    onClose,
    onConfirm,
    environments,
    projectId,
}: IExportDialogProps) => {
    const [selected, setSelected] = useState(environments[0]);
    const { bulkToggleFeaturesEnvironmentOff } = useFeatureApi();
    const { setToastApiError } = useToast();

    const getOptions = () =>
        environments.map(env => ({
            key: env,
            label: env,
        }));

    const onClick = async () => {
        try {
            await bulkToggleFeaturesEnvironmentOff(
                projectId,
                data.map(feature => feature.name),
                selected
            );
            onClose();
            onConfirm?.();
        } catch (e: unknown) {
            setToastApiError(formatUnknownError(e));
        }
    };

    return (
        <Dialogue
            open={showExportDialog}
            title="Disable feature toggles"
            onClose={onClose}
            onClick={onClick}
            primaryButtonText="Disable toggles"
            secondaryButtonText="Cancel"
        >
            <Box>
                You have selected <b>{data.length}</b> feature toggles to
                disable.
                <br />
                <br />
                <Typography>
                    Select which environment to disable the features for:
                </Typography>
                <StyledSelect
                    options={getOptions()}
                    value={selected}
                    onChange={(option: string) => setSelected(option)}
                />
            </Box>
        </Dialogue>
    );
};
