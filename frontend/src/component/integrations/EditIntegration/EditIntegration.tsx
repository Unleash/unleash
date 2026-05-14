import useAddons from 'hooks/api/getters/useAddons/useAddons';
import { IntegrationForm } from '../IntegrationForm/IntegrationForm.tsx';
import cloneDeep from 'lodash.clonedeep';
import { DEFAULT_DATA } from '../CreateIntegration/CreateIntegration.tsx';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import type { AddonSchema, AddonTypeSchema } from 'openapi';

const findProvider = (
    addon: AddonSchema | Omit<AddonSchema, 'id'>,
    providers: AddonTypeSchema[],
) => providers.find((provider) => provider.name === addon?.provider);

export const EditIntegration = () => {
    const addonId = useRequiredPathParam('addonId');
    const { providers, addons, refetchAddons } = useAddons();

    const editMode = true;
    const addon = addons.find(
        (addon: AddonSchema) => addon.id === Number(addonId),
    ) || { ...cloneDeep(DEFAULT_DATA) };

    const provider = findProvider(addon, providers);
    const deprecated = !provider || Boolean(provider.deprecated);

    return (
        <IntegrationForm
            editMode={editMode}
            provider={provider}
            fetch={refetchAddons}
            addon={addon}
            deprecated={deprecated}
        />
    );
};
