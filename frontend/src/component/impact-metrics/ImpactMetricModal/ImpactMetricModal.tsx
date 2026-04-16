import { type FC, useEffect, useState } from 'react';
import {
    Button,
    TextField,
    Box,
    styled,
    useTheme,
    useMediaQuery,
    Dialog,
    Typography,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
} from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { ImpactMetricsControls } from './ImpactMetricsControls/ImpactMetricsControls.tsx';
import { useChartFormState } from '../hooks/useChartFormState.ts';
import type { ChartConfig } from '../types.ts';
import type { ImpactMetric } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { LabelsFilter } from './LabelFilter/LabelsFilter.tsx';
import { ImpactMetricsChart } from '../ImpactMetricsChart.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker.ts';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useUiFlag } from 'hooks/useUiFlag';
import {
    MultimetricChartFormBody,
    initialFormConfig,
    isFormValid as isMultimetricFormValid,
} from '../MultimetricChartForm/MultimetricChartFormBody.tsx';
import type { MultimetricChartFormConfig } from '../MultimetricChartForm/types.ts';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: theme.spacing(170),
        width: '100%',
        backgroundColor: 'transparent',
    },
    padding: 0,
    '& .MuiPaper-root > section': {
        overflowX: 'hidden',
    },
}));

const StyledForm = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});

const StyledTitle = styled('h1')(({ theme }) => ({
    fontWeight: 'normal',
    fontSize: theme.typography.h1.fontSize,
    margin: 0,
}));

const StyledFormContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    padding: theme.spacing(6),
    flexGrow: 1,
    minHeight: 600,
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(3),
    justifyContent: 'flex-end',
    padding: theme.spacing(4, 6),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledSidebarHeading = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.common.white,
    marginBottom: theme.spacing(1),
}));

const StyledSidebarLink = styled('a')(({ theme }) => ({
    color: theme.palette.common.white,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.5),
    textDecoration: 'underline',
    '&:hover': {
        textDecoration: 'none',
    },
}));

const StyledPreviewLabel = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.common.white,
    marginBottom: theme.spacing(1.5),
}));

const StyledPreviewContainer = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
}));

export interface ImpactMetricModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (config: Omit<ChartConfig, 'id'>) => void;
    initialConfig?: ChartConfig;
    metrics: ImpactMetric[];
    loading?: boolean;
    projectId?: string;
}

type ModalFormState =
    | { type: 'chart' }
    | { type: 'multimetric'; config: MultimetricChartFormConfig };

export const ImpactMetricModal: FC<ImpactMetricModalProps> = ({
    open,
    onClose,
    onSave,
    initialConfig,
    metrics,
    loading = false,
    projectId,
}) => {
    const { formData, actions, isValid, currentAvailableLabels } =
        useChartFormState({
            open,
            initialConfig,
        });
    const theme = useTheme();
    const screenBreakpoint = useMediaQuery(theme.breakpoints.down('lg'));
    const { trackEvent } = usePlausibleTracker();

    const multimetricFormEnabled = useUiFlag('multiMetricChart');
    const [formState, setFormState] = useState<ModalFormState>({
        type: 'chart',
    });

    useEffect(() => {
        if (open) {
            setFormState({ type: 'chart' });
        }
    }, [open]);

    const canShowMultimetric = multimetricFormEnabled && Boolean(projectId);
    const isMultimetric =
        canShowMultimetric && formState.type === 'multimetric';

    const submitDisabled = isMultimetric
        ? !isMultimetricFormValid(formState.config)
        : !isValid;

    const handleSave = () => {
        if (isMultimetric) {
            if (!isMultimetricFormValid(formState.config)) return;
            console.log('multimetric chart config', formState.config);
            onClose();
            return;
        }

        if (!isValid) return;
        onSave(actions.getConfigToSave());
        trackEvent('impact-metrics', {
            props: {
                eventType: 'chart added',
            },
        });
        onClose();
    };

    const sidebarDescription = (
        <>
            <StyledSidebarHeading>Did you know?</StyledSidebarHeading>
            Impact metrics let you track how your feature rollouts affect key
            outcomes like error rates, latency, and adoption — directly inside
            Unleash.
            <StyledSidebarLink
                href='https://docs.getunleash.io/reference/impact-metrics'
                target='_blank'
                rel='noopener noreferrer'
                onClick={() => {
                    trackEvent('impact-metrics', {
                        props: {
                            eventType: 'sidebar docs clicked',
                        },
                    });
                }}
            >
                <MenuBookIcon fontSize='small' />
                Learn how to use impact metrics
            </StyledSidebarLink>
            <Box sx={{ mt: 3 }}>
                <StyledPreviewLabel>Preview chart</StyledPreviewLabel>
                <StyledPreviewContainer>
                    {isMultimetric ? (
                        <Typography
                            variant='body2'
                            sx={{
                                color: 'text.secondary',
                                py: 4,
                                textAlign: 'center',
                            }}
                        >
                            Multi-metric chart preview coming soon
                        </Typography>
                    ) : (
                        <ImpactMetricsChart
                            key={screenBreakpoint ? 'small' : 'large'}
                            metricName={formData.metricName}
                            timeRange={formData.timeRange}
                            labelSelectors={formData.labelSelectors}
                            yAxisMin={formData.yAxisMin}
                            aggregationMode={formData.aggregationMode}
                            source={formData.source}
                            isPreview
                        />
                    )}
                </StyledPreviewContainer>
            </Box>
        </>
    );

    return (
        <StyledDialog open={open} onClose={onClose}>
            <FormTemplate
                compact
                disablePadding
                description={sidebarDescription}
                showLink={false}
                sidebarWidth='55%'
            >
                <StyledForm
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}
                >
                    <StyledFormContent>
                        <StyledTitle>
                            {initialConfig
                                ? 'Edit impact metric'
                                : 'Add impact metric'}
                        </StyledTitle>

                        {canShowMultimetric && !initialConfig && (
                            <FormControl>
                                <FormLabel id='visualization-type-label'>
                                    Visualization
                                </FormLabel>
                                <RadioGroup
                                    row
                                    aria-labelledby='visualization-type-label'
                                    value={formState.type}
                                    onChange={(event) => {
                                        if (
                                            event.target.value === 'multimetric'
                                        ) {
                                            setFormState({
                                                type: 'multimetric',
                                                config: initialFormConfig(),
                                            });
                                        } else {
                                            setFormState({ type: 'chart' });
                                        }
                                    }}
                                >
                                    <FormControlLabel
                                        value='chart'
                                        control={<Radio />}
                                        label='Chart'
                                    />
                                    <FormControlLabel
                                        value='multimetric'
                                        control={<Radio />}
                                        label='Multi-metric'
                                    />
                                </RadioGroup>
                            </FormControl>
                        )}

                        {isMultimetric &&
                        projectId &&
                        formState.type === 'multimetric' ? (
                            <MultimetricChartFormBody
                                projectId={projectId}
                                config={formState.config}
                                onChange={(config) =>
                                    setFormState({
                                        type: 'multimetric',
                                        config,
                                    })
                                }
                                metrics={metrics}
                                loading={loading}
                            />
                        ) : (
                            <>
                                <TextField
                                    label='Chart Title (optional)'
                                    value={formData.title}
                                    onChange={(e) =>
                                        actions.setTitle(e.target.value)
                                    }
                                    fullWidth
                                    variant='outlined'
                                    size='small'
                                />

                                <ImpactMetricsControls
                                    formData={formData}
                                    actions={actions}
                                    metrics={metrics}
                                    loading={loading}
                                    labelsFilter={
                                        currentAvailableLabels ? (
                                            <LabelsFilter
                                                labelSelectors={
                                                    formData.labelSelectors
                                                }
                                                onChange={
                                                    actions.setLabelSelectors
                                                }
                                                availableLabels={
                                                    currentAvailableLabels
                                                }
                                            />
                                        ) : null
                                    }
                                />
                            </>
                        )}
                    </StyledFormContent>
                    <StyledButtonContainer>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button
                            variant='contained'
                            type='submit'
                            disabled={submitDisabled}
                        >
                            {initialConfig
                                ? 'Update'
                                : isMultimetric
                                  ? 'Add multi-metric chart'
                                  : 'Add impact metric'}
                        </Button>
                    </StyledButtonContainer>
                </StyledForm>
            </FormTemplate>
        </StyledDialog>
    );
};
