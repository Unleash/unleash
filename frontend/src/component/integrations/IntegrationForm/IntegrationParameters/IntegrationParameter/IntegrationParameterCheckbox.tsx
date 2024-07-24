import {
    Checkbox,
    FormControlLabel,
    FormHelperText,
    Typography,
} from '@mui/material';
import { styled } from '@mui/material';
import type { IIntegrationParameterProps } from './IntegrationParameterTypes';

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
    marginLeft: theme.spacing(2),
}));

export const IntegrationParameterCheckbox = ({
    definition,
    config,
    parametersErrors,
    setParameterValue,
}: IIntegrationParameterProps) => {
    const value = config.parameters[definition?.name] === 'true';

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setParameterValue(
            definition.name,
            event.target.checked ? 'true' : 'false',
        );
    };

    return (
        <>
            <FormControlLabel
                control={
                    <StyledCheckbox
                        checked={value}
                        onChange={onChange}
                        name={definition.name}
                        color='primary'
                        id={definition.name}
                    />
                }
                label={
                    <label htmlFor={definition.name}>
                        <div>
                            <Typography
                                component='span'
                                sx={(theme) => ({
                                    color: theme.palette.text.secondary,
                                })}
                            >
                                {definition.displayName}
                            </Typography>
                            {definition.required ? (
                                <Typography component='span'>*</Typography>
                            ) : null}
                        </div>
                        <FormHelperText>
                            {definition.description}
                        </FormHelperText>
                    </label>
                }
            />
        </>
    );
};
