import { styled, Typography } from '@mui/material';
import type { FC, ReactNode } from 'react';

type ProjectsListHeaderProps = {
    children?: ReactNode;
    subtitle?: string;
    actions?: ReactNode;
};

const StyledHeaderContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column-reverse',
    gap: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    marginBottom: theme.spacing(2),
}));

const StyledHeaderTitle = styled('div')(() => ({
    flexGrow: 0,
}));

export const ProjectsListHeader: FC<ProjectsListHeaderProps> = ({
    children,
    subtitle,
    actions,
}) => {
    return (
        <StyledHeaderContainer>
            <StyledHeaderTitle>
                {children ? (
                    <Typography component='h2' variant='h2'>
                        {children}
                    </Typography>
                ) : null}
                {subtitle ? (
                    <Typography variant='body2' color='text.secondary'>
                        {subtitle}
                    </Typography>
                ) : null}
            </StyledHeaderTitle>
            {actions}
        </StyledHeaderContainer>
    );
};
