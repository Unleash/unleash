import { styled } from '@mui/material';
import { AvatarGroup } from 'component/common/AvatarGroup/AvatarGroup';
import { Badge } from 'component/common/Badge/Badge';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { ProjectSchemaOwners } from 'openapi';

type Props = {
    roles: string[];
    owners: ProjectSchemaOwners;
};

const Wrapper = styled('div')(({ theme }) => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
    justifyContent: 'space-between',
}));

const InfoSection = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
}));

const mapOwners =
    (unleashUrl?: string) => (owner: ProjectSchemaOwners[number]) => {
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
            <InfoSection>
                <span>Your roles in this project:</span>
                {roles.map((role) => (
                    <Badge key={role} color='secondary'>
                        {role}
                    </Badge>
                ))}
            </InfoSection>
            <InfoSection>
                <span>Project owner{owners.length > 1 ? 's' : ''}</span>
                <AvatarGroup users={mappedOwners} avatarLimit={3} />
            </InfoSection>
        </Wrapper>
    );
};
