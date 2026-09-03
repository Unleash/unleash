import useAddons from 'hooks/api/getters/useAddons/useAddons';
import { IntegrationForm } from '../IntegrationForm/IntegrationForm.tsx';
import cloneDeep from 'lodash.clonedeep';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';
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

type CreateIntegrationProps = {
    modal?: boolean;
};

export const CreateIntegration = ({ modal }: CreateIntegrationProps) => {
    const providerId = useRequiredPathParam('providerId');
    const projectId = useOptionalPathParam('projectId');
    const { providers, refetchAddons } = useAddons();

    const editMode = false;
    const provider = providers.find(
        (providerItem: any) => providerItem.name === providerId,
    );

    const defaultAddon = {
        ...cloneDeep(DEFAULT_DATA),
        provider: provider ? provider.name : '',
        // In a project the selector is hidden, so scope the new integration here.
        projects: projectId ? [projectId] : [],
    };
    const deprecated = !provider || Boolean(provider.deprecated);

    return (
        <IntegrationForm
            editMode={editMode}
            provider={provider}
            fetch={refetchAddons}
            addon={defaultAddon}
            deprecated={deprecated}
            modal={modal}
        />
    );
};
