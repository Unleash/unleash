import { styled } from '@mui/material';
import { GroupCardAvatars } from 'component/admin/groups/GroupsList/GroupCard/GroupCardAvatars/NewGroupCardAvatars';
import { useMemo, type FC } from 'react';

interface IProjectOwnersProps {
    owners?: {
        users: any[];
        groups: any[];
    };
}

const StyledContainer = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

export const ProjectOwners: FC<IProjectOwnersProps> = ({ owners }) => {
    // @ts-ignore
    const allUsers = [
        ...(owners?.users || []),
        ...(owners?.groups || []).flatMap((group) =>
            group.users.map((item: any) => item.user),
        ),
    ];

    const header = useMemo(() => {
        if (owners?.users.length === 1 && !owners?.groups.length) {
            return 'Owner';
        }
        if (owners?.groups.length === 1 && !owners?.users.length) {
            return 'Owner';
        }
        if (owners?.users.length || owners?.groups.length) {
            return 'Owners';
        }
        return null;
    }, [owners]);

    return (
        <StyledContainer>
            <GroupCardAvatars
                header={header}
                users={allUsers}
                withDescription
            />
        </StyledContainer>
    );
};
