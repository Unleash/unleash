import type { FC } from 'react';
import useContext from 'hooks/api/getters/useContext/useContext';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam.ts';
import { CreateUnleashContext } from '../CreateUnleashContext/CreateUnleashContext.tsx';

type CloneContextProps = {
    onSubmit: () => void;
    onCancel: () => void;
    modal?: boolean;
};

export const CloneContext: FC<CloneContextProps> = ({
    onSubmit,
    onCancel,
    modal,
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
            modal={modal}
            onSubmit={onSubmit}
            onCancel={onCancel}
            cloneFrom={context}
        />
    );
};
