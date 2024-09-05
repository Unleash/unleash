import { Box, styled, type Theme } from '@mui/material';
import { ProjectIcon } from '../common/ProjectIcon/ProjectIcon';
import EnvironmentsIcon from '@mui/icons-material/CloudCircle';
import CodeIcon from '@mui/icons-material/Code';

export const ConceptsDefinitionsWrapper = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.sidebar,
    padding: theme.spacing(12, 6, 6, 6),
    flex: 0,
    minWidth: '400px',
}));

const ConceptDetails = styled('p')(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    fontSize: theme.typography.caption.fontSize,
    marginBottom: theme.spacing(2),
}));

const IconStyle = ({ theme }: { theme: Theme }) => ({
    color: theme.palette.primary.contrastText,
    fontSize: theme.typography.body2.fontSize,
    marginTop: theme.spacing(0.5),
});

const StyledProjectIcon = styled(ProjectIcon)(IconStyle);
const StyledEnvironmentsIcon = styled(EnvironmentsIcon)(IconStyle);
const StyledCodeIcon = styled(CodeIcon)(IconStyle);

const ConceptItem = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'flex-start',
    marginTop: theme.spacing(3),
}));

const ConceptSummary = styled('div')(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(2),
}));

export const GenerateApiKeyConcepts = () => (
    <ConceptsDefinitionsWrapper>
        <ConceptItem>
            <StyledProjectIcon />
            <Box>
                <ConceptSummary>Flags live in projects</ConceptSummary>
                <ConceptDetails>
                    Projects are containers for feature flags. When you create a
                    feature flag it will belong to the project you create it in.
                </ConceptDetails>
            </Box>
        </ConceptItem>
        <ConceptItem>
            <StyledEnvironmentsIcon />
            <Box>
                <ConceptSummary>
                    Flags have configuration in environments
                </ConceptSummary>
                <ConceptDetails>
                    In Unleash you can have multiple environments. Each feature
                    flag will have different configuration in every environment.
                </ConceptDetails>
            </Box>
        </ConceptItem>
        <ConceptItem>
            <StyledCodeIcon />
            <Box>
                <ConceptSummary>
                    SDKs connect to Unleash to retrieve configuration
                </ConceptSummary>
                <ConceptDetails>
                    When you connect an SDK to Unleash it will use the API key
                    to deduce which feature flags to retrieve and from which
                    environment to retrieve configuration.
                </ConceptDetails>
            </Box>
        </ConceptItem>
    </ConceptsDefinitionsWrapper>
);

export const SelectSdkConcepts = () => (
    <ConceptsDefinitionsWrapper>
        <ConceptItem>
            <StyledCodeIcon />
            <Box>
                <ConceptSummary>SDKs and Unleash</ConceptSummary>
                <ConceptDetails>
                    SDKs serve to bind your application to Unleash. The SDK will
                    connect to Unleash via HTTP and retrieve feature flag
                    configuration that is then cached in your application.
                    Making sure none of your application data ever leaves your
                    servers.
                </ConceptDetails>
            </Box>
        </ConceptItem>
    </ConceptsDefinitionsWrapper>
);
