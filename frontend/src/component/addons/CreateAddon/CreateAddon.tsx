import { useParams } from 'react-router-dom';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import { AddonForm } from '../AddonForm/AddonForm';
import cloneDeep from 'lodash.clonedeep';

interface IAddonCreateParams {
    providerId: string;
}

const DEFAULT_DATA = {
    provider: '',
    description: '',
    enabled: true,
    parameters: {},
    events: [],
};

export const CreateAddon = () => {
    const { providerId } = useParams<IAddonCreateParams>();

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
        // @ts-expect-error
        <AddonForm
            editMode={editMode}
            provider={provider}
            fetch={refetchAddons}
            addon={defaultAddon}
        />
    );
};
