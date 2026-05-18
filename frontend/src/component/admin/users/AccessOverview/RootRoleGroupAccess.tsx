import { Box, Typography, styled } from '@mui/material';
import { Badge as MuiBadge } from 'component/common/Badge/Badge';
import GroupsIcon from '@mui/icons-material/GroupsOutlined';
import type { IGroup } from 'interfaces/group';
import type { IRole } from 'interfaces/role';
import { useRole } from 'hooks/api/getters/useRole/useRole';

const Badge = styled(MuiBadge)({
    whiteSpace: 'nowrap',
});

const StyledGroupRow = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(1, 2),
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledGroupName = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledGroupList = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
}));

const RoleBadge = ({ role }: { role?: IRole }) => (
    <Badge color='info'>{role?.name}</Badge>
);

const GroupItem = ({ group }: { group: IGroup }) => {
    const { role } = useRole(group.rootRole?.toString());
    return (
        <StyledGroupRow>
            <StyledGroupName>
                <GroupsIcon color='success' />
                {group.name}
            </StyledGroupName>
            {group.rootRole !== undefined && <RoleBadge role={role} />}
        </StyledGroupRow>
    );
};

export const RootRoleGroupAccess = ({ groups }: { groups: IGroup[] }) => {
    if (!groups.length) return null;

    return (
        <Box>
            <Typography variant='body1' fontWeight='bold'>
                Groups
            </Typography>
            <Typography variant='body2' color='text.secondary'>
                The group an user is a part of might affect the root access
            </Typography>
            <StyledGroupList>
                {groups.map((group) => (
                    <GroupItem key={group.id} group={group} />
                ))}
            </StyledGroupList>
        </Box>
    );
};
