import { styled } from '@mui/material';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo.tsx';
import { StyledProjectCardFooter, StyledSubtitle } from './ProjectCard.styles';

type ProjectCardFooterProps = {
    lastUpdatedAt?: string | null;
    createdAt?: string;
    memberCount: number;
};

const StyledRightGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginLeft: 'auto',
}));

export const ProjectCardFooter = ({
    lastUpdatedAt,
    createdAt,
    memberCount,
}: ProjectCardFooterProps) => {
    return (
        <StyledProjectCardFooter>
            {lastUpdatedAt ? (
                <StyledSubtitle>
                    Updated <TimeAgo date={lastUpdatedAt} />
                </StyledSubtitle>
            ) : createdAt ? (
                <StyledSubtitle>
                    Created <TimeAgo date={createdAt} />
                </StyledSubtitle>
            ) : null}
            <StyledRightGroup>
                <StyledSubtitle>
                    {memberCount} member
                    {memberCount === 1 ? '' : 's'}
                </StyledSubtitle>
            </StyledRightGroup>
        </StyledProjectCardFooter>
    );
};
