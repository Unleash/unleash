import useAddons from 'hooks/api/getters/useAddons/useAddons';
import { IntegrationForm } from '../IntegrationForm/IntegrationForm.tsx';
import cloneDeep from 'lodash.clonedeep';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import type { AddonSchema } from 'openapi';

export const DEFAULT_DATA: Omit<AddonSchema, 'id'> = {
    provider: '',
    description: '',
    enabled: true,
    parameters: {},
    events: [],
    projects: [],
    environments: [],
};

export const CreateIntegration = () => {
    const providerId = useRequiredPathParam('providerId');
    const { providers, refetchAddons } = useAddons();

    const editMode = false;
    const provider = providers.find(
        (providerItem: any) => providerItem.name === providerId,
    );

    const defaultAddon = {
        ...cloneDeep(DEFAULT_DATA),
        provider: provider ? provider.name : '',
    };

    return (
        <IntegrationForm
            editMode={editMode}
            provider={provider}
            fetch={refetchAddons}
            addon={defaultAddon}
        />
    );
};
