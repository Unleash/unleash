import type { FC } from 'react';
import useContext from 'hooks/api/getters/useContext/useContext';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam.ts';
import { CreateUnleashContext } from '../CreateUnleashContext/CreateUnleashContext.tsx';
import type { FormTemplateLayout } from 'component/common/FormTemplate/FormTemplate';

type CloneContextProps = {
    onSubmit: () => void;
    onCancel: () => void;
    layout?: FormTemplateLayout;
};

export const CloneContext: FC<CloneContextProps> = ({
    onSubmit,
    onCancel,
    layout,
}) => {
    const projectId = useOptionalPathParam('projectId');
    const name = useRequiredPathParam('name');
    const { context, loading, error } = useContext({
        name,
        project: projectId,
    });

    if (loading) {
        return null;
    }

    if (error) {
        return <div role='alert'>Failed to load context field "{name}".</div>;
    }

    return (
        <CreateUnleashContext
            layout={layout}
            onSubmit={onSubmit}
            onCancel={onCancel}
            cloneFrom={context}
        />
    );
};
