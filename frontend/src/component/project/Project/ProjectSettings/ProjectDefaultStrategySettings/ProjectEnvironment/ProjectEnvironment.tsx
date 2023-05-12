import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    styled,
    useTheme,
} from '@mui/material';
import EnvironmentIcon from 'component/common/EnvironmentIcon/EnvironmentIcon';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { PROJECT_ENVIRONMENT_ACCORDION } from 'utils/testIds';
import { ProjectEnvironmentType } from '../../../../../../interfaces/environments';
import ProjectEnvironmentDefaultStrategy from './ProjectEnvironmentDefaultStrategy/ProjectEnvironmentDefaultStrategy';

interface IProjectEnvironmentProps {
    environment: ProjectEnvironmentType;
}

const StyledProjectEnvironmentOverview = styled('div', {
    shouldForwardProp: prop => prop !== 'enabled',
})<{ enabled: boolean }>(({ theme, enabled }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    marginBottom: theme.spacing(2),
    backgroundColor: enabled
        ? theme.palette.background.paper
        : theme.palette.envAccordion.disabled,
}));

const StyledAccordion = styled(Accordion)({
    boxShadow: 'none',
    background: 'none',
});

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    boxShadow: 'none',
    padding: theme.spacing(2, 4),
    pointerEvents: 'none',
    [theme.breakpoints.down(400)]: {
        padding: theme.spacing(1, 2),
    },
}));

const StyledAccordionDetails = styled(AccordionDetails, {
    shouldForwardProp: prop => prop !== 'enabled',
})<{ enabled: boolean }>(({ theme }) => ({
    padding: theme.spacing(3),
    background: theme.palette.envAccordion.expanded,
    borderBottomLeftRadius: theme.shape.borderRadiusLarge,
    borderBottomRightRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'inset 0px 2px 4px rgba(32, 32, 33, 0.05)', // replace this with variable

    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(2, 1),
    },
}));

const StyledAccordionBody = styled('div')(({ theme }) => ({
    width: '100%',
    position: 'relative',
    paddingBottom: theme.spacing(2),
}));

const StyledAccordionBodyInnerContainer = styled('div')(({ theme }) => ({
    [theme.breakpoints.down(400)]: {
        padding: theme.spacing(1),
    },
}));

const StyledHeader = styled('div', {
    shouldForwardProp: prop => prop !== 'enabled',
})<{ enabled: boolean }>(({ theme, enabled }) => ({
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    color: enabled ? theme.palette.text.primary : theme.palette.text.secondary,
}));

const StyledHeaderTitle = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    fontWeight: 'bold',
    [theme.breakpoints.down(560)]: {
        flexDirection: 'column',
        textAlign: 'center',
    },
}));

const StyledEnvironmentIcon = styled(EnvironmentIcon)(({ theme }) => ({
    [theme.breakpoints.down(560)]: {
        marginBottom: '0.5rem',
    },
}));

const StyledStringTruncator = styled(StringTruncator)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    fontWeight: theme.typography.fontWeightMedium,
    [theme.breakpoints.down(560)]: {
        textAlign: 'center',
    },
}));

const ProjectEnvironment = ({ environment }: IProjectEnvironmentProps) => {
    const { environment: name } = environment;
    const description = `Default strategy configuration in the ${name} environment`;
    const theme = useTheme();
    const enabled = false;
    return (
        <StyledProjectEnvironmentOverview enabled={false}>
            <StyledAccordion
                expanded={true}
                onChange={e => e.stopPropagation()}
                data-testid={`${PROJECT_ENVIRONMENT_ACCORDION}_${name}`}
                className={`environment-accordion ${
                    enabled ? '' : 'accordion-disabled'
                }`}
                style={{
                    outline: `2px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper,
                }}
            >
                <StyledAccordionSummary>
                    <StyledHeader data-loading enabled={enabled}>
                        <StyledHeaderTitle>
                            <StyledEnvironmentIcon enabled />
                            <div>
                                <StyledStringTruncator
                                    text={name}
                                    maxWidth="100"
                                    maxLength={15}
                                />
                            </div>
                        </StyledHeaderTitle>
                    </StyledHeader>
                </StyledAccordionSummary>

                <StyledAccordionDetails enabled>
                    <StyledAccordionBody>
                        <StyledAccordionBodyInnerContainer>
                            <ProjectEnvironmentDefaultStrategy
                                environment={environment}
                                description={description}
                            />
                        </StyledAccordionBodyInnerContainer>
                    </StyledAccordionBody>
                </StyledAccordionDetails>
            </StyledAccordion>
        </StyledProjectEnvironmentOverview>
    );
};

export default ProjectEnvironment;
