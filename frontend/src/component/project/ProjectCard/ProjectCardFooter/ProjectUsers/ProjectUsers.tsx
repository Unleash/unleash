import { AvatarGroup, styled } from '@mui/material';
import type { ProjectSchema, ProjectSchemaOwners } from 'openapi';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { millify } from 'millify';

type ProjectUsersProps = {
    owners?: ProjectSchema['owners'];
    total: number;
};

const StyledAvatarGroup = styled(AvatarGroup)(({ theme }) => ({
    minHeight: theme.spacing(3.5),
    '& .MuiAvatar-root': {
        outline: `${theme.spacing(0.25)} solid ${theme.palette.background.paper}`,
        cursor: 'default',
        fontSize: theme.fontSizes.smallerBody,
        border: 'none',
        '&:hover': {
            outlineColor: theme.palette.primary.main,
            zIndex: 1,
        },
    },
}));

const mapOwner = (owner: ProjectSchemaOwners[number]) => {
    if (owner.ownerType === 'user') {
        return {
            name: owner.name,
            email: owner.email || undefined,
            imageUrl: owner.imageUrl || undefined,
        };
    }
    if (owner.ownerType === 'group') {
        return { name: owner.name };
    }
};

const AVATAR_LIMIT = 4;
const MAX_OVERFLOW_DISPLAY_NUMBER = 99;

export const ProjectUsers = ({ owners = [], total }: ProjectUsersProps) => {
    const nonSystemOwners = owners.filter((o) => o.ownerType !== 'system');
    const shownOwners = nonSystemOwners.slice(0, AVATAR_LIMIT).map(mapOwner);
    const overflow = total - shownOwners.length;

    return (
        <StyledAvatarGroup>
            {shownOwners.map((owner, i) => (
                <UserAvatar key={owner?.name ?? i} user={owner} />
            ))}
            {overflow > 0 && (
                <UserAvatar user={{ username: `Total: ${millify(total)}` }}>
                    {shownOwners.length > 0 && '+'}
                    {Math.min(overflow, MAX_OVERFLOW_DISPLAY_NUMBER)}
                </UserAvatar>
            )}
        </StyledAvatarGroup>
    );
};
