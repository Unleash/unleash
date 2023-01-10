import { styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { IEnvironment } from 'interfaces/environments';
import { FeatureSchema } from 'openapi';
import { useState } from 'react';

interface IExportDialogProps {
    showExportDialog: boolean;
    data: FeatureSchema[];
    onClose: () => void;
    environments: IEnvironment[];
}

const StyledSelect = styled(GeneralSelect)(({ theme }) => ({
    minWidth: '250px',
    marginTop: theme.spacing(2),
}));

export const ExportDialog = ({
    showExportDialog,
    data,
    onClose,
    environments,
}: IExportDialogProps) => {
    const [selected, setSelected] = useState(environments[0].name);

    const getOptions = () =>
        environments.map(env => ({
            key: env.name,
            label: env.name,
        }));

    const getPayload = () => {
        return {
            features: data.map(feature => feature.name),
            environment: selected,
        };
    };

    const onClick = () => {
        // const payload = getPayload();
        // make API call
    };

    return (
        <Dialogue
            open={showExportDialog}
            title="Export feature toggle configuration"
            onClose={onClose}
            onClick={onSubmit}
            primaryButtonText="Export selection"
            secondaryButtonText="Cancel"
        >
            The current search filter will be used to export feature toggles.
            Currently {data.length} feature toggles will be exported.
            <br />
            <br />
            <Typography>
                Select which environment to export feature toggle configuration
                from:
            </Typography>
            <StyledSelect
                options={getOptions()}
                value={selected}
                onChange={(option: string) => setSelected(option)}
            />
        </Dialogue>
    );
};
