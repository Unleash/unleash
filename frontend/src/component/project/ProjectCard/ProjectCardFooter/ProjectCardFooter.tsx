import type React from 'react';
import type { FC } from 'react';
import { Box, styled } from '@mui/material';
import {
    ProjectOwners,
    type IProjectOwnersProps,
} from './ProjectOwners/ProjectOwners.tsx';
import type { ProjectSchemaOwners } from 'openapi';

interface IProjectCardFooterProps {
    id?: string;
    isFavorite?: boolean;
    children?: React.ReactNode;
    owners?: IProjectOwnersProps['owners'];
}

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

export const ProjectCardFooter: FC<IProjectCardFooterProps> = ({
    children,
    owners,
}) => {
    const ownersWithoutSystem = owners?.filter(
        (owner) => owner.ownerType !== 'system',
    );
    return (
        <StyledFooter>
            {ownersWithoutSystem ? (
                <ProjectOwners
                    owners={ownersWithoutSystem as ProjectSchemaOwners}
                />
            ) : null}
            {children}
        </StyledFooter>
    );
};
