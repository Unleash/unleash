import type React from 'react';
import type { FC } from 'react';
import { Box, styled } from '@mui/material';
import {
    ProjectOwners,
    type IProjectOwnersProps,
} from './ProjectOwners/ProjectOwners';

interface IProjectCardFooterProps {
    id?: string;
    isFavorite?: boolean;
    children?: React.ReactNode;
    disabled?: boolean;
    owners: IProjectOwnersProps['owners'];
}

const StyledFooter = styled(Box)<{ disabled: boolean }>(
    ({ theme, disabled }) => ({
        display: 'flex',
        background: disabled
            ? theme.palette.background.paper
            : theme.palette.envAccordion.expanded,
        boxShadow: theme.boxShadows.accordionFooter,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: `1px solid ${theme.palette.divider}`,
    }),
);

export const ProjectCardFooter: FC<IProjectCardFooterProps> = ({
    children,
    owners,
    disabled = false,
}) => {
    return (
        <StyledFooter disabled={disabled}>
            <ProjectOwners owners={owners} />
            {children}
        </StyledFooter>
    );
};
