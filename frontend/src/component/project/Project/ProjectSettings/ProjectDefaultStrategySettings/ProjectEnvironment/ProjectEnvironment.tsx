import { Accordion, AccordionDetails, styled } from '@mui/material';
import { PROJECT_ENVIRONMENT_ACCORDION } from 'utils/testIds';
import type { ProjectEnvironmentType } from '../../../../../../interfaces/environments.ts';
import { ProjectEnvironmentDefaultStrategy } from './ProjectEnvironmentDefaultStrategy/ProjectEnvironmentDefaultStrategy.tsx';
import { LegacyEnvironmentHeader } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentHeader/LegacyEnvironmentHeader/LegacyEnvironmentHeader';

interface IProjectEnvironmentProps {
    environment: ProjectEnvironmentType;
}

const StyledProjectEnvironmentOverview = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: 0,
    background: theme.palette.background.elevation1,
}));

export const ProjectEnvironment = ({
    environment,
}: IProjectEnvironmentProps) => {
    const { environment: name } = environment;

    return (
        <StyledProjectEnvironmentOverview>
            <StyledAccordion
                expanded={true}
                onChange={(e) => e.stopPropagation()}
                data-testid={`${PROJECT_ENVIRONMENT_ACCORDION}_${name}`}
            >
                <LegacyEnvironmentHeader
                    environmentId={name}
                    expandable={false}
                />
                <StyledAccordionDetails>
                    <ProjectEnvironmentDefaultStrategy
                        environment={environment}
                    />
                </StyledAccordionDetails>
            </StyledAccordion>
        </StyledProjectEnvironmentOverview>
    );
};
