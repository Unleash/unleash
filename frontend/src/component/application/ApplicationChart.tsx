import { Box, Divider, styled, Typography, useTheme } from '@mui/material';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { useNavigate } from 'react-router-dom';
import type React from 'react';
import { type FC, useLayoutEffect, useRef, useState } from 'react';
import type {
    ApplicationOverviewEnvironmentSchema,
    ApplicationOverviewSchema,
} from 'openapi';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { HelpIcon } from '../common/HelpIcon/HelpIcon.tsx';
import CheckCircle from '@mui/icons-material/CheckCircle';
import CloudCircle from '@mui/icons-material/CloudCircle';
import Flag from '@mui/icons-material/Flag';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { getApplicationIssues } from './ApplicationIssues/ApplicationIssues.tsx';

const StyledTable = styled('table')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    marginTop: theme.spacing(1),
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

const StyledApplicationBox = styled(Box)<{
    mode: 'success' | 'warning';
}>(({ theme, mode }) => ({
    borderRadius: theme.shape.borderRadiusMedium,
    border: '1px solid',
    borderColor: theme.palette[mode].border,
    backgroundColor: theme.palette[mode].light,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(1.5, 3, 2, 3),
}));

const StyledEnvironmentBox = styled(Box)<{
    mode: 'success' | 'warning';
}>(({ theme, mode }) => ({
    borderRadius: theme.shape.borderRadiusMedium,
    border: '1px solid',
    borderColor:
        theme.palette[mode === 'success' ? 'secondary' : 'warning'].border,
    backgroundColor:
        theme.palette[mode === 'success' ? 'secondary' : 'warning'].light,
    display: 'inline-block',
    padding: theme.spacing(1.5, 1.5, 1.5, 1.5),
    zIndex: 1,
    opacity: 0.9,
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
}));

const StyledEnvironmentsContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '60px 20px',
});

const EnvironmentHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.fontWeight.bold,
}));

const StyledStatus = styled(Typography)<{
    mode: 'success' | 'warning';
}>(({ theme, mode }) => ({
    gap: theme.spacing(1),
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette[mode].dark,
    display: 'flex',
    alignItems: 'center',
}));

const StyledIconRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(3),
    color: theme.palette.secondary.main,
    paddingTop: theme.spacing(2),
}));

const StyledIconContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(0.5),
}));
const StyledText = styled(Box)(({ theme }) => ({
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
}));

interface IApplicationChartProps {
    data: ApplicationOverviewSchema;
}

interface IApplicationCountersProps {
    environmentCount: number;
    featureCount: number;
}

const useElementWidth = () => {
    const elementRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState('100%');

    useLayoutEffect(() => {
        setWidth(`${elementRef.current?.scrollWidth}px`);
    }, [elementRef, setWidth]);

    return {
        elementRef,
        width,
    };
};
const SuccessStatus = () => (
    <StyledStatus mode='success'>
        <CheckCircle
            sx={(theme) => ({
                color: theme.palette.success.main,
            })}
        />{' '}
        Everything looks good!
    </StyledStatus>
);

const WarningStatus: FC<{ children?: React.ReactNode }> = ({ children }) => (
    <StyledStatus mode='warning'>
        <WarningAmberRounded
            sx={(theme) => ({
                color: theme.palette.warning.main,
            })}
        />{' '}
        {children}
    </StyledStatus>
);

const ApplicationCounters = ({
    environmentCount,
    featureCount,
}: IApplicationCountersProps) => {
    return (
        <StyledIconRow>
            <StyledIconContainer>
                <CloudCircle />
                <StyledText>{environmentCount}</StyledText>
            </StyledIconContainer>
            <StyledIconContainer>
                <Flag />
                <StyledText>{featureCount}</StyledText>
            </StyledIconContainer>
        </StyledIconRow>
    );
};

const useTracking = () => {
    const { trackEvent } = usePlausibleTracker();
    return () => {
        trackEvent('sdk-reporting', {
            props: {
                eventType: 'environment box clicked',
            },
        });
    };
};

const getEnvironmentMode = (
    environment: ApplicationOverviewEnvironmentSchema,
) => {
    return environment.issues.missingFeatures.length +
        environment.issues.outdatedSdks.length ===
        0
        ? 'success'
        : 'warning';
};

export const ApplicationChart = ({ data }: IApplicationChartProps) => {
    const trackClick = useTracking();
    const applicationName = useRequiredPathParam('name');
    const { elementRef, width } = useElementWidth();
    const navigate = useNavigate();
    const theme = useTheme();

    const mode = getApplicationIssues(data);

    return (
        <Box sx={{ width }}>
            <ArcherContainer
                strokeColor={theme.palette.secondary.border}
                endMarker={false}
            >
                <StyleApplicationContainer>
                    <ArcherElement
                        id='application'
                        relations={data.environments.map((environment) => ({
                            targetId: environment.name,
                            targetAnchor: 'top',
                            sourceAnchor: 'bottom',
                            style: {
                                strokeColor:
                                    getEnvironmentMode(environment) ===
                                    'success'
                                        ? theme.palette.secondary.border
                                        : theme.palette.warning.border,
                            },
                        }))}
                    >
                        <StyledApplicationBox mode={mode.applicationMode}>
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
                            <ApplicationCounters
                                environmentCount={data.environments.length}
                                featureCount={data.featureCount}
                            />
                            <StyledDivider />
                            {mode.applicationMode === 'success' ? (
                                <SuccessStatus />
                            ) : (
                                <WarningStatus>
                                    {mode.issueCount} issues detected
                                </WarningStatus>
                            )}
                        </StyledApplicationBox>
                    </ArcherElement>
                </StyleApplicationContainer>

                <StyledEnvironmentsContainer ref={elementRef}>
                    {data.environments.map((environment) => (
                        <ArcherElement
                            id={environment.name}
                            key={environment.name}
                        >
                            <StyledEnvironmentBox
                                mode={getEnvironmentMode(environment)}
                                key={environment.name}
                                sx={{ cursor: 'pointer' }}
                                onClick={(_e) => {
                                    trackClick();
                                    navigate(
                                        `/applications/${applicationName}/instances?environment=${environment.name}`,
                                    );
                                }}
                            >
                                <EnvironmentHeader>
                                    {environment.name} environment
                                </EnvironmentHeader>

                                <StyledTable>
                                    <tbody>
                                        <tr>
                                            <StyledCell
                                                sx={{ display: 'flex' }}
                                            >
                                                Instances:{' '}
                                                <HelpIcon
                                                    size={
                                                        theme.fontSizes
                                                            .smallBody
                                                    }
                                                    tooltip='Active instances in the last 24 hours'
                                                />
                                            </StyledCell>
                                            <StyledCell>
                                                {environment.instanceCount}
                                            </StyledCell>
                                        </tr>

                                        {environment.backendSdks.length > 0 ? (
                                            <tr>
                                                <StyledCell>
                                                    Backend SDK:
                                                </StyledCell>
                                                <StyledCell>
                                                    {environment.backendSdks.map(
                                                        (sdk) => (
                                                            <div key={sdk}>
                                                                {sdk}
                                                            </div>
                                                        ),
                                                    )}
                                                </StyledCell>
                                            </tr>
                                        ) : null}

                                        {environment.frontendSdks.length > 0 ? (
                                            <tr>
                                                <StyledCell>
                                                    Frontend SDK:
                                                </StyledCell>
                                                <StyledCell>
                                                    {environment.frontendSdks.map(
                                                        (sdk) => (
                                                            <div key={sdk}>
                                                                {sdk}
                                                            </div>
                                                        ),
                                                    )}
                                                </StyledCell>
                                            </tr>
                                        ) : null}

                                        <tr>
                                            <StyledCell>Last seen:</StyledCell>
                                            <StyledCell>
                                                <TimeAgo
                                                    date={environment.lastSeen}
                                                />
                                            </StyledCell>
                                        </tr>
                                    </tbody>
                                </StyledTable>
                            </StyledEnvironmentBox>
                        </ArcherElement>
                    ))}
                </StyledEnvironmentsContainer>
            </ArcherContainer>
        </Box>
    );
};
