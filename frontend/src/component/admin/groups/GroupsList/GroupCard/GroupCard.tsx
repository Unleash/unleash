import { Box, Card, styled } from '@mui/material';
import type { IGroup } from 'interfaces/group';
import { Link, useNavigate } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Badge } from 'component/common/Badge/Badge';
import { GroupCardActions } from './GroupCardActions/GroupCardActions';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import { RoleBadge } from 'component/common/RoleBadge/RoleBadge';
import { useScimSettings } from 'hooks/api/getters/useScimSettings/useScimSettings';
import {
    AvatarComponent,
    AvatarGroup,
} from 'component/common/AvatarGroup/AvatarGroup';
import GroupsIcon from '@mui/icons-material/GroupsOutlined';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { Truncator } from 'component/common/Truncator/Truncator';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';

const StyledCardLink = styled(Link)(({ theme }) => ({
    color: 'inherit',
    textDecoration: 'none',
    border: 'none',
    padding: '0',
    background: 'transparent',
    fontFamily: theme.typography.fontFamily,
    pointer: 'cursor',
}));

const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
    },
    transition: 'background-color 0.2s ease-in-out',
    backgroundColor: theme.palette.background.default,
    '&:hover': {
        backgroundColor: theme.palette.neutral.light,
    },
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledCardBody = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    flexFlow: 'column',
    height: '100%',
    position: 'relative',
}));

const StyledCardBodyHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const StyledCardIconContainer = styled(Box)(({ theme }) => ({
    display: 'grid',
    placeItems: 'center',
    padding: theme.spacing(0.5),
    alignSelf: 'baseline',
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadiusMedium,
    '& > svg': {
        height: theme.spacing(2),
        width: theme.spacing(2),
    },
}));

const StyledCardTitle = styled('h3')(({ theme }) => ({
    margin: 0,
    marginRight: 'auto',
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: '1.2',
}));

const StyledCardDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    marginTop: theme.spacing(2),
}));

const StyledCardFooter = styled(Box)(({ theme }) => ({
    padding: theme.spacing(0, 2),
    display: 'flex',
    background: theme.palette.envAccordion.expanded,
    boxShadow: theme.boxShadows.accordionFooter,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: `1px solid ${theme.palette.divider}`,
    minHeight: theme.spacing(6.25),
}));

const StyledCardFooterSpan = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    textWrap: 'nowrap',
}));

const StyledAvatarComponent = styled(AvatarComponent)(({ theme }) => ({
    height: theme.spacing(2.5),
    width: theme.spacing(2.5),
    marginLeft: theme.spacing(-0.75),
}));

const StyledProjectsTooltip = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledProjectBadge = styled(Badge)({
    cursor: 'pointer',
});

interface IGroupCardProps {
    group: IGroup;
    onEditUsers: (group: IGroup) => void;
    onRemoveGroup: (group: IGroup) => void;
}

export const GroupCard = ({
    group,
    onEditUsers,
    onRemoveGroup,
}: IGroupCardProps) => {
    const navigate = useNavigate();

    const { searchQuery } = useSearchHighlightContext();

    const {
        settings: { enabled: scimEnabled },
    } = useScimSettings();
    const isScimGroup = scimEnabled && Boolean(group.scimId);

    return (
        <>
            <StyledCardLink to={`/admin/groups/${group.id}`}>
                <StyledCard>
                    <StyledCardBody>
                        <StyledCardBodyHeader>
                            <StyledCardIconContainer>
                                <GroupsIcon />
                            </StyledCardIconContainer>
                            <Truncator
                                title={group.name}
                                arrow
                                component={StyledCardTitle}
                            >
                                <Highlighter search={searchQuery}>
                                    {group.name}
                                </Highlighter>
                            </Truncator>
                            <ConditionallyRender
                                condition={Boolean(group.rootRole)}
                                show={
                                    <RoleBadge
                                        roleId={group.rootRole!}
                                        hideIcon
                                    />
                                }
                            />
                            <GroupCardActions
                                groupId={group.id}
                                onEditUsers={() => onEditUsers(group)}
                                onRemove={() => onRemoveGroup(group)}
                                isScimGroup={isScimGroup}
                            />
                        </StyledCardBodyHeader>
                        <ConditionallyRender
                            condition={Boolean(group.description)}
                            show={
                                <Truncator
                                    lines={2}
                                    title={group.description}
                                    arrow
                                    component={StyledCardDescription}
                                >
                                    <Highlighter search={searchQuery}>
                                        {group.description}
                                    </Highlighter>
                                </Truncator>
                            }
                        />
                    </StyledCardBody>
                    <StyledCardFooter>
                        <ConditionallyRender
                            condition={group.users.length > 0}
                            show={
                                <AvatarGroup
                                    users={group.users}
                                    AvatarComponent={StyledAvatarComponent}
                                />
                            }
                            elseShow={
                                <StyledCardFooterSpan>
                                    This group has no users
                                </StyledCardFooterSpan>
                            }
                        />
                        <ConditionallyRender
                            condition={group.projects.length > 0}
                            show={
                                <TooltipLink
                                    component='span'
                                    tooltip={
                                        <StyledProjectsTooltip>
                                            {group.projects.map((project) => (
                                                <StyledProjectBadge
                                                    key={project}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate(
                                                            `/projects/${project}/settings/access`,
                                                        );
                                                    }}
                                                    color='secondary'
                                                    icon={<TopicOutlinedIcon />}
                                                >
                                                    {project}
                                                </StyledProjectBadge>
                                            ))}
                                        </StyledProjectsTooltip>
                                    }
                                >
                                    <StyledCardFooterSpan>
                                        {group.projects.length} project
                                        {group.projects.length !== 1 && 's'}
                                    </StyledCardFooterSpan>
                                </TooltipLink>
                            }
                        />
                    </StyledCardFooter>
                </StyledCard>
            </StyledCardLink>
        </>
    );
};
