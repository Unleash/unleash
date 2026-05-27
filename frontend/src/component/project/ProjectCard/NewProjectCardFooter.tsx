import type { ReactNode } from 'react';
import { Box, styled } from '@mui/material';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo.tsx';
import { StyledSubtitle } from './ProjectCard.styles';

type NewProjectCardFooterProps = {
    children?: ReactNode;
    lastUpdatedAt?: string | null;
    createdAt?: string;
};

const StyledFooter = styled(Box)(({ theme }) => ({
    display: 'flex',
    background: theme.palette.background.elevation1,
    boxShadow: theme.boxShadows.accordionFooter,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingInline: theme.spacing(2),
    paddingBlock: theme.spacing(1.5),
}));

const StyledRightGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginLeft: 'auto',
}));

export const NewProjectCardFooter = ({
    children,
    lastUpdatedAt,
    createdAt,
}: NewProjectCardFooterProps) => {
    return (
        <StyledFooter>
            {lastUpdatedAt ? (
                <StyledSubtitle>
                    Updated <TimeAgo date={lastUpdatedAt} />
                </StyledSubtitle>
            ) : createdAt ? (
                <StyledSubtitle>
                    Created <TimeAgo date={createdAt} />
                </StyledSubtitle>
            ) : null}
            <StyledRightGroup>{children}</StyledRightGroup>
        </StyledFooter>
    );
};
