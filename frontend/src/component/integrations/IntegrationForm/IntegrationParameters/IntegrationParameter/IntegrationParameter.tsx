import type { ChangeEventHandler } from 'react';
import { StyledAddonParameterContainer } from '../../IntegrationForm.styles';
import type { AddonParameterSchema, AddonSchema } from 'openapi';
import { IntegrationParameterTextField } from './IntegrationParameterTextField.tsx';
import {
    IntegrationParameterKeyValuePairs,
    type IIntegrationParameterKeyValuePairsProps,
} from './IntegrationParameterKeyValuePairs.tsx';
import { isKvpParam } from './KvpParameterUtils.ts';

export interface IIntegrationParameterProps {
    parametersErrors: Record<string, string>;
    definition: AddonParameterSchema;
    setParameterValue: (param: string) => ChangeEventHandler<HTMLInputElement>;
    setParameterKvps: IIntegrationParameterKeyValuePairsProps['setParameterKvps'];
    config: AddonSchema;
}

export const IntegrationParameter = ({
    setParameterValue,
    setParameterKvps,
    ...props
}: IIntegrationParameterProps) => {
    return (
        <StyledAddonParameterContainer>
            {isKvpParam(props.definition) ? (
                <IntegrationParameterKeyValuePairs
                    setParameterKvps={setParameterKvps}
                    {...props}
                />
            ) : (
                <IntegrationParameterTextField
                    setParameterValue={setParameterValue}
                    {...props}
                />
            )}
        </StyledAddonParameterContainer>
    );
};
