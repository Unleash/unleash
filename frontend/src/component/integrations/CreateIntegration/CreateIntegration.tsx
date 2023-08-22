import useAddons from 'hooks/api/getters/useAddons/useAddons';
import { IntegrationForm } from '../IntegrationForm/IntegrationForm';
import cloneDeep from 'lodash.clonedeep';
import { IAddon } from 'interfaces/addons';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

export const DEFAULT_DATA = {
    provider: '',
    description: '',
    enabled: true,
    parameters: {},
    events: [],
    projects: [],
    environments: [],
} as unknown as IAddon; // TODO: improve type

export const CreateIntegration = () => {
    const providerId = useRequiredPathParam('providerId');
    const { providers, refetchAddons } = useAddons();

    const editMode = false;
    const provider = providers.find(
        (providerItem: any) => providerItem.name === providerId
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
