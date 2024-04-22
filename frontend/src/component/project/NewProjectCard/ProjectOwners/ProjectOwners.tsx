import { GroupCardAvatars } from 'component/admin/groups/GroupsList/GroupCard/GroupCardAvatars/NewGroupCardAvatars';
import type { FC } from 'react';

interface IProjectOwnersProps {
    owners?: {
        users: any[];
        groups: any[];
    };
}

export const ProjectOwners: FC<IProjectOwnersProps> = ({ owners }) => {
    // @ts-ignore
    const allUsers = [
        ...(owners?.users || []),
        ...(owners?.groups || []).flatMap((group) =>
            group.users.map((item: any) => item.user),
        ),
    ];

    return (
        <>
            {/* Owners: */}
            <GroupCardAvatars users={allUsers} withDescription />
        </>
    );
};
