import React from 'react';
import { IAddonConfig, IAddonProvider } from '../../../../interfaces/addons';
import { AddonParameter } from './AddonParameter/AddonParameter';

interface IAddonParametersProps {
    provider: IAddonProvider;
    errors: Record<string, string>;
    editMode: boolean;
    setParameterValue: (param: string) => void;
    config: IAddonConfig;
}

export const AddonParameters = ({
    provider,
    config,
    errors,
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
                    errors={errors}
                    config={config}
                    setParameterValue={setParameterValue}
                />
            ))}
        </React.Fragment>
    );
};
