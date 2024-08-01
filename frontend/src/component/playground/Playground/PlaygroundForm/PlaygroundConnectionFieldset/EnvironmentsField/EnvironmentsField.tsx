import type { ComponentProps, Dispatch, FC, SetStateAction } from 'react';
import { Autocomplete, TextField, Tooltip } from '@mui/material';
import { renderOption } from '../../renderOption';

interface IEnvironmentsFieldProps {
    environments: string[];
    setEnvironments: Dispatch<SetStateAction<string[]>>;
    availableEnvironments: string[];
    disabled?: boolean;
    tooltip?: string;
}

interface IOption {
    label: string;
    id: string;
}

export const EnvironmentsField: FC<IEnvironmentsFieldProps> = ({
    environments,
    setEnvironments,
    availableEnvironments,
    tooltip = 'Select environments to use in the playground',
    disabled,
}) => {
    const environmentOptions = [
        ...availableEnvironments.map((name) => ({
            label: name,
            id: name,
        })),
    ];
    const envValue = environmentOptions.filter(({ id }) =>
        environments.includes(id),
    );

    const onEnvironmentsChange: ComponentProps<
        typeof Autocomplete
    >['onChange'] = (event, value, reason) => {
        const newEnvironments = value as IOption | IOption[];
        if (reason === 'clear' || newEnvironments === null) {
            return setEnvironments([]);
        }
        if (Array.isArray(newEnvironments)) {
            if (newEnvironments.length === 0) {
                return setEnvironments([]);
            }
            return setEnvironments(newEnvironments.map(({ id }) => id));
        }

        return setEnvironments([newEnvironments.id]);
    };

    return (
        <Tooltip arrow title={tooltip}>
            <Autocomplete
                disablePortal
                limitTags={3}
                id='environment'
                multiple={true}
                options={environmentOptions}
                sx={{ flex: 1 }}
                renderInput={(params) => (
                    <TextField {...params} label='Environments' />
                )}
                renderOption={renderOption}
                getOptionLabel={({ label }) => label}
                disableCloseOnSelect={false}
                size='small'
                value={envValue}
                onChange={onEnvironmentsChange}
                disabled={disabled}
                data-testid={'PLAYGROUND_ENVIRONMENT_SELECT'}
            />
        </Tooltip>
    );
};
