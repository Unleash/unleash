import { styled, Tooltip } from '@mui/material';
import { IGroup } from 'interfaces/group';
import { Link, useNavigate } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { GroupCardAvatars } from './GroupCardAvatars/GroupCardAvatars';
import { Badge } from 'component/common/Badge/Badge';
import { GroupCardActions } from './GroupCardActions/GroupCardActions';
import { RemoveGroup } from 'component/admin/groups/RemoveGroup/RemoveGroup';
import { useState } from 'react';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import { EditGroupUsers } from 'component/admin/groups/Group/EditGroupUsers/EditGroupUsers';

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    color: theme.palette.text.primary,
}));

const StyledGroupCard = styled('aside')(({ theme }) => ({
    padding: theme.spacing(2.5),
    height: '100%',
    border: `1px solid ${theme.palette.dividerAlternative}`,
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: theme.boxShadows.card,
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(4),
    },
    '&:hover': {
        transition: 'background-color 0.2s ease-in-out',
        backgroundColor: theme.palette.neutral.light,
    },
}));

const StyledRow = styled('div')(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const StyledTitleRow = styled(StyledRow)(() => ({
    alignItems: 'flex-start',
}));

const StyledBottomRow = styled(StyledRow)(() => ({
    marginTop: 'auto',
}));

const StyledHeaderTitle = styled('h2')(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: theme.fontWeight.medium,
}));

const StyledHeaderActions = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
}));

const StyledDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(4),
}));

const StyledCounterDescription = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(1),
}));

const ProjectBadgeContainer = styled('div')(() => ({
    maxWidth: '50%',
}));

const StyledBadge = styled(Badge)(() => ({
    marginRight: 0.5,
}));

interface IGroupCardProps {
    group: IGroup;
}

export const GroupCard = ({ group }: IGroupCardProps) => {
    const [editUsersOpen, setEditUsersOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);
    const navigate = useNavigate();
    return (
        <>
            <StyledLink key={group.id} to={`/admin/groups/${group.id}`}>
                <StyledGroupCard>
                    <StyledTitleRow>
                        <StyledHeaderTitle>{group.name}</StyledHeaderTitle>
                        <StyledHeaderActions>
                            <GroupCardActions
                                groupId={group.id}
                                onEditUsers={() => setEditUsersOpen(true)}
                                onRemove={() => setRemoveOpen(true)}
                            />
                        </StyledHeaderActions>
                    </StyledTitleRow>
                    <StyledDescription>{group.description}</StyledDescription>
                    <StyledBottomRow>
                        <ConditionallyRender
                            condition={group.users?.length > 0}
                            show={<GroupCardAvatars users={group.users} />}
                            elseShow={
                                <StyledCounterDescription>
                                    This group has no users.
                                </StyledCounterDescription>
                            }
                        />
                        <ProjectBadgeContainer>
                            <ConditionallyRender
                                condition={group.projects.length > 0}
                                show={group.projects.map(project => (
                                    <Tooltip
                                        key={project}
                                        title="View project"
                                        arrow
                                        placement="bottom-end"
                                        describeChild
                                    >
                                        <StyledBadge
                                            onClick={e => {
                                                e.preventDefault();
                                                navigate(
                                                    `/projects/${project}/access`
                                                );
                                            }}
                                            color="secondary"
                                            icon={<TopicOutlinedIcon />}
                                        >
                                            {project}
                                        </StyledBadge>
                                    </Tooltip>
                                ))}
                                elseShow={
                                    <Tooltip
                                        title="This group is not used in any project"
                                        arrow
                                        describeChild
                                    >
                                        <Badge>Not used</Badge>
                                    </Tooltip>
                                }
                            />
                        </ProjectBadgeContainer>
                    </StyledBottomRow>
                </StyledGroupCard>
            </StyledLink>
            <EditGroupUsers
                open={editUsersOpen}
                setOpen={setEditUsersOpen}
                group={group}
            />
            <RemoveGroup
                open={removeOpen}
                setOpen={setRemoveOpen}
                group={group!}
            />
        </>
    );
};
