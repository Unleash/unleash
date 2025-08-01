import { styled } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import type { FC, ReactNode } from 'react';

type ProjectsListHeaderProps = {
    children: ReactNode;
    helpText: string;
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

const StyledHeaderTitle = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    flexGrow: 0,
}));

export const ProjectsListHeader: FC<ProjectsListHeaderProps> = ({
    children,
    helpText,
    actions,
}) => {
    return (
        <StyledHeaderContainer>
            <StyledHeaderTitle>
                {children}
                <HelpIcon tooltip={helpText} />
            </StyledHeaderTitle>
            {actions}
        </StyledHeaderContainer>
    );
};
