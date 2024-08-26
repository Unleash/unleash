import type React from 'react';
import type { FC } from 'react';
import { Box, styled } from '@mui/material';
import {
    type IProjectOwnersProps,
    ProjectOwners as LegacyProjectOwners,
} from '../ProjectOwners/LegacyProjectOwners';
import { ProjectOwners } from '../ProjectOwners/ProjectOwners';
import { useUiFlag } from 'hooks/useUiFlag';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ProjectMembers } from '../ProjectMembers/ProjectMembers';

interface IProjectCardFooterProps {
    id: string;
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
    const projectListImprovementsEnabled = useUiFlag('projectListImprovements');

    return (
        <StyledFooter disabled={disabled}>
            <ConditionallyRender
                condition={Boolean(projectListImprovementsEnabled)}
                show={<ProjectOwners owners={owners} />}
                elseShow={<LegacyProjectOwners owners={owners} />}
            />
            <ConditionallyRender
                condition={Boolean(projectListImprovementsEnabled)}
                show={
                    <ProjectMembers
                        // count={}
                        members={[]}
                    />
                }
                elseShow={children}
            />
        </StyledFooter>
    );
};
