import { useParams } from 'react-router-dom';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import { AddonForm } from '../AddonForm/AddonForm';
import cloneDeep from 'lodash.clonedeep';
import { IAddon } from 'interfaces/addons';

interface IAddonCreateParams {
    providerId: string;
}

export const DEFAULT_DATA = {
    provider: '',
    description: '',
    enabled: true,
    parameters: {},
    events: [],
} as unknown as IAddon; // TODO: improve type

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
        <AddonForm
            editMode={editMode}
            provider={provider}
            fetch={refetchAddons}
            addon={defaultAddon}
        />
    );
};
