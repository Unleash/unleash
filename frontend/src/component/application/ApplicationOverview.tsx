import { usePageTitle } from 'hooks/usePageTitle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    Alert,
    Box,
    Divider,
    styled,
    Typography,
    useTheme,
} from '@mui/material';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useNavigate } from 'react-router-dom';
import Check from '@mui/icons-material/CheckCircle';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { useLayoutEffect, useRef, useState } from 'react';

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
    padding: theme.spacing(1.5, 0, 1.5, 1),
    minWidth: '270px',
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
}));

const StyledEnvironmentsContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'start',
    gap: '20px',
});

const useElementWidth = () => {
    const elementRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState('100%');

    useLayoutEffect(() => {
        setWidth(`${elementRef.current?.scrollWidth}px`);
    }, [elementRef, setWidth]);

    return { elementRef, width };
};

export const ApplicationOverview = () => {
    usePageTitle('Applications - Overview');
    const applicationName = useRequiredPathParam('name');
    const navigate = useNavigate();
    const theme = useTheme();

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

    const { elementRef, width } = useElementWidth();

    return (
        <ConditionallyRender
            condition={1 === 2 + 1}
            show={<Alert severity='warning'>No data available.</Alert>}
            elseShow={
                <Box sx={{ width }}>
                    <ArcherContainer
                        strokeColor={theme.palette.secondary.border}
                        endMarker={false}
                    >
                        <StyleApplicationContainer>
                            <ArcherElement
                                id='application'
                                relations={app.environments.map(
                                    (environment) => ({
                                        targetId: environment.name,
                                        targetAnchor: 'top',
                                        sourceAnchor: 'bottom',
                                    }),
                                )}
                            >
                                <StyledApplicationBox>
                                    <Typography
                                        sx={(theme) => ({
                                            fontSize:
                                                theme.fontSizes.smallerBody,
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
                                                color: theme.palette.success
                                                    .main,
                                            })}
                                        />{' '}
                                        Everything looks good!
                                    </StyledOkStatus>
                                </StyledApplicationBox>
                            </ArcherElement>
                        </StyleApplicationContainer>

                        <StyledEnvironmentsContainer ref={elementRef}>
                            {app.environments.map((environment, index) => (
                                <ArcherElement id={environment.name}>
                                    <StyledEnvironmentBox
                                        key={environment.name}
                                    >
                                        <Typography
                                            sx={(theme) => ({
                                                fontSize:
                                                    theme.fontSizes.smallerBody,
                                                fontWeight:
                                                    theme.fontWeight.bold,
                                            })}
                                        >
                                            {environment.name} environment
                                        </Typography>

                                        <StyledTable>
                                            <tr>
                                                <StyledCell>
                                                    Instances:
                                                </StyledCell>
                                                <StyledCell>
                                                    {environment.instanceCount}
                                                </StyledCell>
                                            </tr>
                                            <tr>
                                                <StyledCell>SDK:</StyledCell>
                                                <StyledCell>
                                                    {environment.sdks.map(
                                                        (sdk) => (
                                                            <div>{sdk}</div>
                                                        ),
                                                    )}
                                                </StyledCell>
                                            </tr>
                                            <tr>
                                                <StyledCell>
                                                    Last seen:
                                                </StyledCell>
                                                <StyledCell>
                                                    {environment.lastSeen}
                                                </StyledCell>
                                            </tr>
                                        </StyledTable>
                                    </StyledEnvironmentBox>
                                </ArcherElement>
                            ))}
                        </StyledEnvironmentsContainer>
                    </ArcherContainer>
                </Box>
            }
        />
    );
};

export default ApplicationOverview;
