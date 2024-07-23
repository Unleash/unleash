import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import type { AddonParameterSchema, AddonSchema } from 'openapi';
import type { ChangeEventHandler } from 'react';
import { styled } from '@mui/material';

export interface IIntegrationParameterCheckboxProps {
    parametersErrors: Record<string, string>;
    definition: AddonParameterSchema;
    setParameterValue: (param: string) => ChangeEventHandler<HTMLInputElement>;
    config: AddonSchema;
}

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
    marginLeft: theme.spacing(2),
}));

export const IntegrationParameterCheckbox = ({
    definition,
    config,
    parametersErrors,
    setParameterValue,
}: IIntegrationParameterCheckboxProps) => {
    const value = config.parameters[definition?.name] || false;
    const error = parametersErrors[definition.name];

    return (
        <FormControlLabel
            control={
                <StyledCheckbox
                    checked={value === 'on'}
                    onChange={setParameterValue(definition.name)}
                    name={definition.name}
                    color='primary'
                />
            }
            label={
                <label>
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
                </label>
            }
        />
    );
};
