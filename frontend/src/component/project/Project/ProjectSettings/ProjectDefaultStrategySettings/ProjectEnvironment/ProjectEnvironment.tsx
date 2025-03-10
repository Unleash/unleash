import { Accordion, AccordionDetails, styled } from '@mui/material';
import { PROJECT_ENVIRONMENT_ACCORDION } from 'utils/testIds';
import type { ProjectEnvironmentType } from '../../../../../../interfaces/environments';
import { ProjectEnvironmentDefaultStrategy } from './ProjectEnvironmentDefaultStrategy/ProjectEnvironmentDefaultStrategy';
import { EnvironmentHeader } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentHeader/EnvironmentHeader';

interface IProjectEnvironmentProps {
    environment: ProjectEnvironmentType;
}

const StyledProjectEnvironmentOverview = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: 0,
    background: theme.palette.background.elevation1,
    borderBottomLeftRadius: theme.shape.borderRadiusLarge,
    borderBottomRightRadius: theme.shape.borderRadiusLarge,
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
                <EnvironmentHeader environmentId={name} expandable={false} />
                <StyledAccordionDetails>
                    <ProjectEnvironmentDefaultStrategy
                        environment={environment}
                    />
                </StyledAccordionDetails>
            </StyledAccordion>
        </StyledProjectEnvironmentOverview>
    );
};
