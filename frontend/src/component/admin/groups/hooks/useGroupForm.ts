import { useState } from 'react';
import useQueryParams from 'hooks/useQueryParams';
import { IGroupUser } from 'interfaces/group';

export const useGroupForm = (
    initialName = '',
    initialDescription = '',
    initialMappingsSSO: string[] = [],
    initialUsers: IGroupUser[] = []
) => {
    const params = useQueryParams();
    const groupQueryName = params.get('name');
    const [name, setName] = useState(groupQueryName || initialName);
    const [description, setDescription] = useState(initialDescription);
    const [mappingsSSO, setMappingsSSO] = useState(initialMappingsSSO);
    const [users, setUsers] = useState<IGroupUser[]>(initialUsers);
    const [errors, setErrors] = useState({});

    const getGroupPayload = () => {
        return {
            name,
            description,
            mappingsSSO,
            users: users.map(({ id }) => ({
                user: { id },
            })),
        };
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
        name,
        setName,
        description,
        setDescription,
        mappingsSSO,
        setMappingsSSO,
        users,
        setUsers,
        getGroupPayload,
        clearErrors,
        errors,
        setErrors,
    };
};
