import { styled } from '@mui/material';
import type { ProjectOwners } from '../../openapi';
import { AvatarGroup } from 'component/common/AvatarGroup/AvatarGroup';
import { Badge } from 'component/common/Badge/Badge';

type Props = {
    roles: {
        id: number;
        name: string;
        type: string;
    }[];
    owners: ProjectOwners;
};

const Wrapper = styled('div')(({ theme }) => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
    justifyContent: 'space-between',
}));

const RoleInfo = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
}));

export const RoleAndOwnerInfo = ({ roles, owners }: Props) => {
    return (
        <Wrapper>
            <RoleInfo>
                <span>Your roles in this project:</span>
                {roles.map((role) => (
                    <Badge key={role.id} color='secondary'>
                        {role.name}
                    </Badge>
                ))}
            </RoleInfo>
            <AvatarGroup
                //@ts-ignore
                users={owners}
                avatarLimit={3}
            />
        </Wrapper>
    );
};
