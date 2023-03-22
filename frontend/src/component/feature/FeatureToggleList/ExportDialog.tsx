import { createRef, useState } from 'react';
import { styled, Typography, Box } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { useExportApi } from 'hooks/api/actions/useExportApi/useExportApi';
import useToast from 'hooks/useToast';
import type { FeatureSchema } from 'openapi';

import { formatUnknownError } from 'utils/formatUnknownError';

interface IExportDialogProps {
    showExportDialog: boolean;
    data: Pick<FeatureSchema, 'name'>[];
    onClose: () => void;
    onConfirm?: () => void;
    environments: string[];
}

const StyledSelect = styled(GeneralSelect)(({ theme }) => ({
    minWidth: '250px',
    marginTop: theme.spacing(2),
}));

export const ExportDialog = ({
    showExportDialog,
    data,
    onClose,
    onConfirm,
    environments,
}: IExportDialogProps) => {
    const [selected, setSelected] = useState(environments[0]);
    const { createExport } = useExportApi();
    const ref = createRef<HTMLDivElement>();
    const { setToastApiError } = useToast();

    const getOptions = () =>
        environments.map(env => ({
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

    const onClick = async () => {
        try {
            const payload = {
                features: data.map(feature => feature.name),
                environment: selected,
            };
            const res = await createExport(payload);
            const body = await res.json();
            downloadFile(body);
            onClose();
            onConfirm?.();
        } catch (e: unknown) {
            setToastApiError(formatUnknownError(e));
        }
    };

    return (
        <Dialogue
            open={showExportDialog}
            title="Export feature toggle configuration"
            onClose={onClose}
            onClick={onClick}
            primaryButtonText="Export selection"
            secondaryButtonText="Cancel"
        >
            <Box ref={ref}>
                The current search filter will be used to export feature
                toggles. Currently {data.length} feature toggles will be
                exported.
                <br />
                <br />
                <Typography>
                    Select which environment to export feature toggle
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
