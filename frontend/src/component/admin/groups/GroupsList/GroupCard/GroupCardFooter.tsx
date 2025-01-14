import type { IGroup } from 'interfaces/group';
import { Badge } from 'component/common/Badge/Badge';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import {
    AvatarComponent,
    AvatarGroup,
} from 'component/common/AvatarGroup/AvatarGroup';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { Box, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const StyledAvatarComponent = styled(AvatarComponent)(({ theme }) => ({
    height: theme.spacing(2.5),
    width: theme.spacing(2.5),
    marginLeft: theme.spacing(-0.75),
}));

const StyledProjectsTooltip = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    maxWidth: theme.spacing(25),
}));

const StyledProjectBadge = styled(Badge)({
    cursor: 'pointer',
    overflowWrap: 'anywhere',
});

interface IGroupCardFooterProps {
    group: IGroup;
}

export const GroupCardFooter = ({ group }: IGroupCardFooterProps) => {
    const navigate = useNavigate();

    return (
        <>
            {group.users.length > 0 ? (
                <AvatarGroup
                    users={group.users}
                    AvatarComponent={StyledAvatarComponent}
                />
            ) : (
                <span>This group has no users</span>
            )}
            {group.projects.length > 0 && (
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
                    <span>
                        {group.projects.length} project
                        {group.projects.length !== 1 && 's'}
                    </span>
                </TooltipLink>
            )}
        </>
    );
};
