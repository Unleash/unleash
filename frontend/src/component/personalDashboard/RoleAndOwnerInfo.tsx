import { styled } from '@mui/material';
import type { ProjectOwners } from '../../openapi';
import { AvatarGroup } from 'component/common/AvatarGroup/AvatarGroup';
import { Badge } from 'component/common/Badge/Badge';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

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

// copied from frontend/src/component/project/ProjectCard/ProjectCardFooter/ProjectOwners/ProjectOwners.tsx; consider refactoring
const mapOwners =
    (unleashUrl?: string) =>
    (
        owner: ProjectOwners[number],
    ): {
        name: string;
        imageUrl?: string;
        email?: string;
    } => {
        if (owner.ownerType === 'user') {
            return {
                name: owner.name,
                imageUrl: owner.imageUrl || undefined,
                email: owner.email || undefined,
            };
        }
        if (owner.ownerType === 'group') {
            return {
                name: owner.name,
            };
        }
        return {
            name: 'System',
            imageUrl: `${unleashUrl}/logo-unleash.png`,
        };
    };

export const RoleAndOwnerInfo = ({ roles, owners }: Props) => {
    const { uiConfig } = useUiConfig();
    const mappedOwners = owners.map(mapOwners(uiConfig.unleashUrl));
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
            <RoleInfo>
                <span>Project owner{owners.length > 1 ? 's' : ''}</span>
                <AvatarGroup users={mappedOwners} avatarLimit={3} />
            </RoleInfo>
        </Wrapper>
    );
};
