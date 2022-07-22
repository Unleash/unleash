import { useEffect, useState } from 'react';
import useQueryParams from 'hooks/useQueryParams';
import { IGroupUser, Role } from 'interfaces/group';

export const useGroupForm = (
    initialName = '',
    initialDescription = '',
    initialUsers: IGroupUser[] = []
) => {
    const params = useQueryParams();
    const groupQueryName = params.get('name');
    const [name, setName] = useState(groupQueryName || initialName);
    const [description, setDescription] = useState(initialDescription);
    const [users, setUsers] = useState<IGroupUser[]>(initialUsers);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!name) {
            setName(groupQueryName || initialName);
        }
    }, [name, initialName, groupQueryName]);

    useEffect(() => {
        setDescription(initialDescription);
    }, [initialDescription]);

    const initialUsersStringified = JSON.stringify(initialUsers);

    useEffect(() => {
        setUsers(initialUsers);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialUsersStringified]);

    const getGroupPayload = () => {
        return {
            name,
            description,
            users: users.map(({ id, role }) => ({
                user: { id },
                role: role || Role.Member,
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
        users,
        setUsers,
        getGroupPayload,
        clearErrors,
        errors,
    };
};
