import { StyledAddonParameterContainer } from '../../IntegrationForm.styles';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { AddonParameterSchema, AddonSchema } from 'openapi';
import { ChangeEventHandler } from 'react';
import { IntegrationParameterTextField } from './IntegrationParameterTextField';
import { useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

export interface IIntegrationParameterEnableWithDropdownProps {
    parametersErrors: Record<string, string>;
    definition: AddonParameterSchema;
    setParameterValue: (param: string) => ChangeEventHandler<HTMLInputElement>;
    config: AddonSchema;
    enableTitle: string;
    enableOptionText: string;
    disableOptionText: string;
}

export const IntegrationParameterEnableWithDropdown = ({
    definition,
    config,
    parametersErrors,
    setParameterValue,
    enableTitle,
    enableOptionText,
    disableOptionText,
}: IIntegrationParameterEnableWithDropdownProps) => {
    const value = config.parameters[definition?.name] || '';
    const renderProjectOptions = () => [
        { key: 'disabled', label: disableOptionText },
        { key: 'enabled', label: enableOptionText },
    ];

    const enabledFromStart = value !== '';
    const [enabled, setEnabled] = useState(
        enabledFromStart ? 'enabled' : 'disabled'
    );

    const onChange = (key: string) => {
        setEnabled(key);
        if (key === 'disabled') {
            const fakeEvent = {
                preventDefault: () => {},
                target: {
                    value: '',
                },
            };
            setParameterValue(definition.name)(fakeEvent as any);
        }
    };

    return (
        <>
            <StyledAddonParameterContainer>
                <GeneralSelect
                    label={enableTitle}
                    options={renderProjectOptions()}
                    value={enabled}
                    onChange={onChange}
                    fullWidth
                />
            </StyledAddonParameterContainer>
            <StyledAddonParameterContainer>
                <ConditionallyRender
                    condition={enabled === 'enabled'}
                    show={
                        <IntegrationParameterTextField
                            config={config}
                            definition={definition}
                            parametersErrors={parametersErrors}
                            setParameterValue={setParameterValue}
                        />
                    }
                />
            </StyledAddonParameterContainer>
        </>
    );
};
