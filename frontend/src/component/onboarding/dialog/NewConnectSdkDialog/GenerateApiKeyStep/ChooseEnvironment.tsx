import {
    MenuItem,
    Select,
    styled,
    type SelectChangeEvent,
} from '@mui/material';

export interface ChooseEnvironmentProps {
    environments: string[];
    currentEnvironment: string;
    onSelect: (env: string) => void;
}

const StyledSelect = styled(Select<string>)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.divider,
    },
    '& .MuiSelect-select': {
        fontSize: theme.typography.body2.fontSize,
        color: theme.palette.text.primary,
    },
}));

export const ChooseEnvironment = ({
    environments,
    onSelect,
    currentEnvironment,
}: ChooseEnvironmentProps) => {
    const longestEnv =
        environments.length > 0
            ? Math.max(...environments.map((env) => env.length))
            : 0;

    const handleChange = (e: SelectChangeEvent<string>) =>
        onSelect(e.target.value);

    return (
        <StyledSelect
            value={currentEnvironment}
            onChange={handleChange}
            size='small'
            inputProps={{ 'aria-label': 'Select environment' }}
            sx={{ minWidth: `${longestEnv + 5}ch` }}
        >
            {environments.map((env) => (
                <MenuItem key={env} value={env}>
                    {env}
                </MenuItem>
            ))}
        </StyledSelect>
    );
};
