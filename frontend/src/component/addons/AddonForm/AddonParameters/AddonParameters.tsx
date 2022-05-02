import React from 'react';
import { IAddonProvider } from 'interfaces/addons';
import {
    AddonParameter,
    IAddonParameterProps,
} from './AddonParameter/AddonParameter';

interface IAddonParametersProps {
    provider?: IAddonProvider;
    parametersErrors: IAddonParameterProps['parametersErrors'];
    editMode: boolean;
    setParameterValue: IAddonParameterProps['setParameterValue'];
    config: IAddonParameterProps['config'];
}

export const AddonParameters = ({
    provider,
    config,
    parametersErrors,
    setParameterValue,
    editMode,
}: IAddonParametersProps) => {
    if (!provider) return null;

    return (
        <React.Fragment>
            <h4>Parameters</h4>
            {editMode ? (
                <p>
                    Sensitive parameters will be masked with value "<i>*****</i>
                    ". If you don't change the value they will not be updated
                    when saving.
                </p>
            ) : null}
            {provider.parameters.map(parameter => (
                <AddonParameter
                    key={parameter.name}
                    definition={parameter}
                    parametersErrors={parametersErrors}
                    config={config}
                    setParameterValue={setParameterValue}
                />
            ))}
        </React.Fragment>
    );
};
