import type { ReactNode } from 'react';
import { Box, styled } from '@mui/material';
import {
    ProjectOwners,
    type IProjectOwnersProps,
} from './ProjectCardFooter/ProjectOwners/ProjectOwners.tsx';
import type { ProjectSchemaOwners } from 'openapi';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo.tsx';

interface INewProjectCardFooterProps {
    children?: ReactNode;
    owners?: IProjectOwnersProps['owners'];
    lastUpdatedAt?: string | null;
    createdAt?: string;
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

const StyledRightGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginLeft: 'auto',
}));

const StyledSubtitle = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
}));

export const NewProjectCardFooter = ({
    children,
    owners,
    lastUpdatedAt,
    createdAt,
}: INewProjectCardFooterProps) => {
    const ownersWithoutSystem = owners?.filter(
        (owner) => owner.ownerType !== 'system',
    );
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
            <StyledRightGroup>
                {ownersWithoutSystem ? (
                    <ProjectOwners
                        owners={ownersWithoutSystem as ProjectSchemaOwners}
                    />
                ) : null}
                {children}
            </StyledRightGroup>
        </StyledFooter>
    );
};
