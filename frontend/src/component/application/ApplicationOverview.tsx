import { usePageTitle } from 'hooks/usePageTitle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Alert, Box, Divider, styled, Typography } from '@mui/material';
import { useThemeMode } from 'hooks/useThemeMode';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useNavigate } from 'react-router-dom';
import Check from '@mui/icons-material/CheckCircle';

const StyledTable = styled('table')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    marginTop: theme.spacing(2),
}));

const StyledCell = styled('td')(({ theme }) => ({
    verticalAlign: 'top',
    paddingLeft: 0,
    paddingRight: theme.spacing(1),
}));

const StyleApplicationContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(18),
    display: 'flex',
    justifyContent: 'center',
}));

const StyledApplicationBox = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusMedium,
    border: '1px solid',
    borderColor: theme.palette.success.border,
    backgroundColor: theme.palette.success.light,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(1.5, 3, 2, 3),
}));

const StyledOkStatus = styled(Typography)(({ theme }) => ({
    gap: theme.spacing(0.5),
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.success.dark,
    display: 'flex',
    alignItems: 'center',
}));

const StyledEnvironmentBox = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusMedium,
    border: '1px solid',
    borderColor: theme.palette.secondary.border,
    backgroundColor: theme.palette.secondary.light,
    display: 'inline-block',
    padding: theme.spacing(1.5, 2, 1.5, 2),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
}));

export const ApplicationOverview = () => {
    usePageTitle('Applications - Overview');
    const applicationName = useRequiredPathParam('name');
    const { themeMode } = useThemeMode();
    const navigate = useNavigate();

    const app = {
        projects: ['default', 'dx'],
        featureCount: 12,
        environments: [
            {
                name: 'production',
                instanceCount: 34,
                sdks: [
                    'unleash-client-node:5.4.0',
                    'unleash-client-node:5.4.1',
                ],
                lastSeen: '2021-10-01T12:00:00Z',
            },
            {
                name: 'development',
                instanceCount: 16,
                sdks: ['unleash-client-java:5.4.0'],
                lastSeen: '2021-10-01T12:00:00Z',
            },
        ],
    };

    // @ts-ignore
    window.navigateToInstances = (environment: string) => {
        navigate(
            `/applications/${applicationName}/instances?environment=${environment}`,
        );
    };

    return (
        <ConditionallyRender
            condition={1 === 2 + 1}
            show={<Alert severity='warning'>No data available.</Alert>}
            elseShow={
                <Box>
                    <StyleApplicationContainer>
                        <StyledApplicationBox>
                            <Typography
                                sx={(theme) => ({
                                    fontSize: theme.fontSizes.smallerBody,
                                })}
                                color='text.secondary'
                            >
                                Application
                            </Typography>
                            <Typography
                                sx={(theme) => ({
                                    fontSize: theme.fontSizes.bodySize,
                                    fontWeight: theme.fontWeight.bold,
                                })}
                            >
                                {applicationName}
                            </Typography>

                            <StyledDivider />

                            <StyledOkStatus>
                                <Check
                                    sx={(theme) => ({
                                        color: theme.palette.success.main,
                                    })}
                                />{' '}
                                Everything looks good!
                            </StyledOkStatus>
                        </StyledApplicationBox>
                    </StyleApplicationContainer>

                    <Box
                        sx={{ display: 'flex', justifyContent: 'space-evenly' }}
                    >
                        {app.environments.map((environment) => (
                            <StyledEnvironmentBox>
                                <Typography
                                    sx={(theme) => ({
                                        fontSize: theme.fontSizes.smallerBody,
                                        fontWeight: theme.fontWeight.bold,
                                    })}
                                >
                                    {environment.name} environment
                                </Typography>

                                <StyledTable>
                                    <tr>
                                        <StyledCell>Instances:</StyledCell>
                                        <StyledCell>
                                            {environment.instanceCount}
                                        </StyledCell>
                                    </tr>
                                    <tr>
                                        <StyledCell>SDK:</StyledCell>
                                        <StyledCell>
                                            {environment.sdks.map((sdk) => (
                                                <div>{sdk}</div>
                                            ))}
                                        </StyledCell>
                                    </tr>
                                    <tr>
                                        <StyledCell>Last seen:</StyledCell>
                                        <StyledCell>
                                            {environment.lastSeen}
                                        </StyledCell>
                                    </tr>
                                </StyledTable>
                            </StyledEnvironmentBox>
                        ))}
                    </Box>
                </Box>
            }
        />
    );
};

export default ApplicationOverview;
