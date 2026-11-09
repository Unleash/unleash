import { createRef, useState } from 'react';
import { styled, Typography, Box, Alert } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { useExportApi } from 'hooks/api/actions/useExportApi/useExportApi';
import useToast from 'hooks/useToast';
import type { FeatureSchema } from 'openapi';

import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from '../../common/ConditionallyRender/ConditionallyRender.tsx';
import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates.ts';
import type { Tracking } from 'utils/trackingEvents';

interface IExportDialogProps {
    showExportDialog: boolean;
    data: Pick<FeatureSchema, 'name' | 'environments'>[];
    project?: string;
    onClose: () => void;
    onConfirm?: () => void;
    environments: string[];
    tracking: Tracking;
}

const StyledSelect = styled(GeneralSelect)(({ theme }) => ({
    minWidth: '250px',
    marginTop: theme.spacing(2),
}));

export const ExportDialog = ({
    showExportDialog,
    data,
    project,
    onClose,
    onConfirm,
    environments,
    tracking,
}: IExportDialogProps) => {
    const [selected, setSelected] = useState(environments[0]);
    const { createExport } = useExportApi();
    const ref = createRef<HTMLDivElement>();
    const { setToastApiError } = useToast();
    const { templates } = useReleasePlanTemplates();
    const hasReleaseTemplates = Boolean(templates.length);

    const getOptions = () =>
        environments.map((env) => ({
            key: env,
            label: env,
        }));

    const downloadFile = (json: any) => {
        const link = document.createElement('a');
        ref.current?.appendChild(link);
        link.style.display = 'display: none';

        const blob = new Blob([JSON.stringify(json)], {
            type: 'application/json',
        });
        const url = window.URL.createObjectURL(blob);

        link.href = url;
        const date = new Date();
        link.download = `${date.toISOString()}-export.json`;
        link.click();
        window.URL.revokeObjectURL(url);

        ref.current?.removeChild(link);
    };

    const exportFlags = async () => {
        const res = await createExport({
            features: data.map((feature) => feature.name),
            environment: selected,
            project,
        });
        downloadFile(await res.json());
        onClose();
        onConfirm?.();
    };

    return (
        <Dialogue
            open={showExportDialog}
            title='Export feature flag configuration'
            onClose={onClose}
            onSubmit={exportFlags}
            onError={(error) => setToastApiError(formatUnknownError(error))}
            tracking={tracking}
            primaryButtonText='Export selection'
            secondaryButtonText='Cancel'
        >
            <Box ref={ref}>
                {hasReleaseTemplates && (
                    <Alert severity='warning' sx={{ mb: 4 }}>
                        Exporting does not include release plans. You may need
                        to set up new release plans for the imported feature
                        flags.
                    </Alert>
                )}
                <ConditionallyRender
                    condition={data.length > 0}
                    show={
                        <span>
                            The current search filter will be used to export
                            feature flags. Currently {data.length} feature flags
                            will be exported.
                        </span>
                    }
                    elseShow={
                        <span>
                            You will export all feature flags from this project.
                        </span>
                    }
                />

                <br />
                <br />
                <Typography>
                    Select which environment to export feature flag
                    configuration from:
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
