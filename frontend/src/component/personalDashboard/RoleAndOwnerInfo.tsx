import { styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { AvatarGroupFromOwners } from 'component/common/AvatarGroupFromOwners/AvatarGroupFromOwners';
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
    alignItems: 'center',
}));

export const RoleAndOwnerInfo = ({ roles, owners }: Props) => {
    return (
        <Wrapper>
            <InfoSection>
                {roles.length > 0 ? (
                    <>
                        <span>Your roles in this project:</span>
                        {roles.map((role) => (
                            <Badge key={role} color='secondary'>
                                {role}
                            </Badge>
                        ))}
                    </>
                ) : (
                    <span>You have no project roles in this project.</span>
                )}
            </InfoSection>
            <InfoSection>
                <span>Project owner{owners.length > 1 ? 's' : ''}</span>
                <AvatarGroupFromOwners users={owners} avatarLimit={3} />
            </InfoSection>
        </Wrapper>
    );
};
