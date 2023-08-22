import useAddons from 'hooks/api/getters/useAddons/useAddons';
import { IntegrationForm } from '../IntegrationForm/IntegrationForm';
import cloneDeep from 'lodash.clonedeep';
import { IAddon } from 'interfaces/addons';
import { DEFAULT_DATA } from '../CreateIntegration/CreateIntegration';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

export const EditIntegration = () => {
    const addonId = useRequiredPathParam('addonId');
    const { providers, addons, refetchAddons } = useAddons();

    const editMode = true;
    const addon = addons.find(
        (addon: IAddon) => addon.id === Number(addonId)
    ) || { ...cloneDeep(DEFAULT_DATA) };
    const provider = addon
        ? providers.find(provider => provider.name === addon.provider)
        : undefined;

    return (
        <IntegrationForm
            editMode={editMode}
            provider={provider}
            fetch={refetchAddons}
            addon={addon}
        />
    );
};
