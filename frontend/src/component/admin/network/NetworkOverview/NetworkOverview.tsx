import { usePageTitle } from 'hooks/usePageTitle';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { useInstanceMetrics } from 'hooks/api/getters/useInstanceMetrics/useInstanceMetrics';
import { Alert, Typography, styled, useTheme } from '@mui/material';
import { unknownify } from 'utils/unknownify';
import { useMemo } from 'react';
import type {
    RequestsPerSecondSchema,
    RequestsPerSecondSchemaDataResultItem,
} from 'openapi';
import { ReactComponent as LogoIcon } from 'assets/icons/logoBg.svg';
import { ReactComponent as LogoIconWhite } from 'assets/icons/logoWhiteBg.svg';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { NetworkPrometheusAPIWarning } from '../NetworkPrometheusAPIWarning.tsx';

const StyleUnleashContainer = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(18),
    display: 'flex',
    justifyContent: 'center',
}));

const StyledAppsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(4),
    flexWrap: 'wrap',
}));

const StyledElementBox = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusMedium,
    border: '1px solid',
    borderColor: theme.palette.secondary.border,
    backgroundColor: theme.palette.secondary.light,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    zIndex: 1,
    '& > svg': {
        width: theme.spacing(9),
        height: theme.spacing(9),
    },
}));

const StyledElementHeader = styled(Typography)(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledElementRPS = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

const StyledElementDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const isRecent = (value: ResultValue) => {
    const threshold = 600000; // ten minutes
    return value[0] * 1000 > Date.now() - threshold;
};

type ResultValue = [number, string];

interface INetworkApp {
    label: string;
    reqs: number;
    type: string;
}

const asNetworkAppData = (
    result: RequestsPerSecondSchemaDataResultItem & { label: string },
) => {
    const values = (result.values || []) as ResultValue[];
    const data = values.filter((value) => isRecent(value));
    const reqs = data.length ? Number.parseFloat(data[data.length - 1][1]) : 0;
    return {
        label: result.label,
        reqs,
        type: unknownify(result.metric?.endpoint?.split('/')[2]),
    };
};

const summingReqsByLabelAndType = (
    acc: {
        [group: string]: INetworkApp;
    },
    current: INetworkApp,
) => {
    const groupBy = current.label + current.type;
    acc[groupBy] = {
        ...current,
        reqs: current.reqs + (acc[groupBy]?.reqs ?? 0),
    };
    return acc;
};

const toGraphData = (metrics?: RequestsPerSecondSchema) => {
    const results =
        metrics?.data?.result
            ?.map((result) => ({
                ...result,
                label: unknownify(result.metric?.appName),
            }))
            .filter((result) => result.label !== 'unknown') || [];
    const aggregated = results
        .map(asNetworkAppData)
        .reduce(summingReqsByLabelAndType, {});
    return (
        Object.values(aggregated)
            .map((app) => ({ ...app, reqs: app.reqs.toFixed(2) }))
            .filter((app) => app.reqs !== '0.00') ?? []
    );
};

export const NetworkOverview = () => {
    usePageTitle('Network - Overview');
    const theme = useTheme();
    const { metrics } = useInstanceMetrics();
    const apps = useMemo(() => {
        return toGraphData(metrics);
    }, [metrics]);

    if (apps.length === 0) {
        return (
            <Alert severity='warning'>
                No data available.
                <NetworkPrometheusAPIWarning />
            </Alert>
        );
    }

    return (
        <ArcherContainer
            strokeColor={theme.palette.text.primary}
            endShape={{
                arrow: {
                    arrowLength: 4,
                    arrowThickness: 4,
                },
            }}
        >
            <StyleUnleashContainer>
                <ArcherElement id='unleash'>
                    <StyledElementBox>
                        <ThemeMode
                            darkmode={<LogoIconWhite />}
                            lightmode={<LogoIcon />}
                        />
                        <Typography sx={{ marginTop: theme.spacing(1) }}>
                            Unleash
                        </Typography>
                    </StyledElementBox>
                </ArcherElement>
            </StyleUnleashContainer>

            <StyledAppsContainer>
                {apps.map(({ label, reqs, type }, i) => (
                    <ArcherElement
                        id={`${i}`}
                        relations={[
                            {
                                targetId: 'unleash',
                                targetAnchor: 'bottom',
                                sourceAnchor: 'top',
                                style: {
                                    strokeColor: theme.palette.secondary.border,
                                },
                            },
                        ]}
                    >
                        <StyledElementBox>
                            <StyledElementHeader>{label}</StyledElementHeader>
                            <StyledElementRPS>{reqs} req/s</StyledElementRPS>
                            <StyledElementDescription>
                                {type} app
                            </StyledElementDescription>
                        </StyledElementBox>
                    </ArcherElement>
                ))}
            </StyledAppsContainer>
        </ArcherContainer>
    );
};

export default NetworkOverview;
