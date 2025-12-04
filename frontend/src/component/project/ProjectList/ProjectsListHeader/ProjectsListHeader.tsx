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
    minHeight: theme.spacing(5),
    gap: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    marginBottom: theme.spacing(2),
}));

const StyledHeaderTitle = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(0.5),
    fontWeight: theme.typography.fontWeightBold,
    flexGrow: 0,
}));

const StyledHeaderActions = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: theme.spacing(2),
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
            <StyledHeaderActions>{actions}</StyledHeaderActions>
        </StyledHeaderContainer>
    );
};
