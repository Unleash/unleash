import { styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { OwnerAvatarGroup } from 'component/common/OwnerAvatarGroup/OwnerAvatarGroup';
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

export const RoleAndOwnerInfo = ({ roles, owners }: Props) => {
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
                <OwnerAvatarGroup users={owners} avatarLimit={3} />
            </InfoSection>
        </Wrapper>
    );
};
