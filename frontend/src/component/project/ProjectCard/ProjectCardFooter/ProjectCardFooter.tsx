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
    owners?: IProjectOwnersProps['owners'];
}

const StyledFooter = styled(Box)<{ disabled: boolean }>(
    ({ theme, disabled }) => ({
        display: 'flex',
        background: disabled
            ? theme.palette.background.paper
            : theme.palette.background.elevation1,
        boxShadow: theme.boxShadows.accordionFooter,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: `1px solid ${theme.palette.divider}`,
        paddingInline: theme.spacing(2),
        paddingBlock: theme.spacing(1.5),
    }),
);

export const ProjectCardFooter: FC<IProjectCardFooterProps> = ({
    children,
    owners,
    disabled = false,
}) => {
    const ownersWithoutSystem = owners?.filter(
        (owner) => owner.ownerType !== 'system',
    );
    return (
        <StyledFooter disabled={disabled}>
            {ownersWithoutSystem ? (
                <ProjectOwners owners={ownersWithoutSystem} />
            ) : null}
            {children}
        </StyledFooter>
    );
};
