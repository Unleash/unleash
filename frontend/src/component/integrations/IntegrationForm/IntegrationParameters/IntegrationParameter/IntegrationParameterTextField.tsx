import { TextField } from '@mui/material';
import type { AddonParameterSchema, AddonSchema } from 'openapi';
import type { ChangeEventHandler } from 'react';
import { styled } from '@mui/material';
import { Markdown } from 'component/common/Markdown/Markdown';
import { FormField } from 'component/common/FormField/FormField';

const MASKED_VALUE = '*****';

const resolveType = ({ type = 'text', sensitive = false }, value: string) => {
    if (sensitive && value === MASKED_VALUE) {
        return 'text';
    }
    if (type === 'textfield') {
        return 'text';
    }
    return type;
};

export interface IIntegrationParameterTextFieldProps {
    parametersErrors: Record<string, string>;
    definition: AddonParameterSchema;
    setParameterValue: (param: string) => ChangeEventHandler<HTMLInputElement>;
    config: AddonSchema;
}

const StyledTextField = styled(TextField)({
    width: '100%',
});

export const IntegrationParameterTextField = ({
    definition,
    config,
    parametersErrors,
    setParameterValue,
}: IIntegrationParameterTextFieldProps) => {
    const value = config.parameters[definition?.name] || '';
    const type = resolveType(
        definition,
        typeof value === 'string' ? value : '',
    );
    const error = parametersErrors[definition.name];

    return (
        <FormField
            label={`${definition.displayName}${definition.required ? '*' : ''}`}
        >
            <StyledTextField
                size='large'
                minRows={definition.type === 'textfield' ? 5 : 0}
                multiline={definition.type === 'textfield'}
                type={type}
                label=''
                name={definition.name}
                placeholder={definition.placeholder || ''}
                slotProps={{
                    formHelperText: {
                        component: 'div',
                    },
                }}
                value={value}
                error={Boolean(error)}
                onChange={setParameterValue(definition.name)}
                variant='outlined'
                helperText={
                    definition.description ? (
                        <Markdown>{definition.description}</Markdown>
                    ) : undefined
                }
            />
        </FormField>
    );
};
