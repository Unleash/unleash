import { useState } from 'react';
import {
    Autocomplete,
    TextField,
    Typography,
    Box,
    Button,
} from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import type { MetricSource } from 'component/impact-metrics/types';
import { useTrackFlagpageImpactMetrics } from 'component/impact-metrics/useImpactMetricsFunnel';
import { useUiFlag } from 'hooks/useUiFlag';
import { RegisterMetricDialog } from 'component/impact-metrics/RegisterMetricDialog/RegisterMetricDialog';
import { useTrackRegisterImpactMetrics } from 'component/impact-metrics/RegisterMetricDialog/useTrackRegisterImpactMetrics';

type MetricOption = {
    name: string;
    displayName: string;
    help: string;
    source: MetricSource;
};

const matchesSelection = (
    option: Pick<MetricOption, 'name' | 'source'>,
    name: string,
    source?: MetricSource,
) => option.name === name && option.source === (source ?? 'internal');

export type MetricSelection = {
    metricName: string;
    source?: MetricSource;
};

export type MetricSelectorProps = {
    value: string;
    valueSource?: MetricSource;
    onChange: (selection: MetricSelection) => void;
    options: MetricOption[];
    loading?: boolean;
    label?: string;
    entryPoint?:
        | 'impact-metrics-page'
        | 'flag-impact-metrics-accordion'
        | 'flag-safeguards';
};

const NoOptionsMessage = ({
    onRegisterClick,
}: {
    onRegisterClick?: () => void;
}) => {
    const { trackEvent } = usePlausibleTracker();
    const { trackDocsClicked } = useTrackFlagpageImpactMetrics();

    const buttonProps = onRegisterClick
        ? {
              onClick: () => {
                  trackEvent('impact-metrics', {
                      props: {
                          eventType: 'No option setup form opened',
                      },
                  });
                  onRegisterClick();
              },
          }
        : {
              href: 'https://docs.getunleash.io/reference/impact-metrics',
              target: '_blank',
              rel: 'noopener noreferrer',
              onClick: () => {
                  trackEvent('impact-metrics', {
                      props: {
                          eventType: 'No options docs clicked',
                      },
                  });
                  trackDocsClicked();
              },
          };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant='body2' fontWeight='bold'>
                No impact metrics found
            </Typography>
            <Typography variant='body2' color='text.secondary'>
                Impact metrics need to be implemented in your code before they
                can be used in safeguards.
            </Typography>
            <Button
                variant='contained'
                size='small'
                sx={{ alignSelf: 'flex-start', mt: 1 }}
                {...buttonProps}
            >
                Set up your first metric
            </Button>
        </Box>
    );
};

const withSelectedValue = (
    options: MetricOption[],
    value: string,
    valueSource?: MetricSource,
): MetricOption[] => {
    if (
        value &&
        !options.some((option) => matchesSelection(option, value, valueSource))
    ) {
        const orphan: MetricOption = {
            name: value,
            displayName: value,
            help: '',
            source: valueSource ?? 'internal',
        };
        return valueSource === 'external'
            ? [...options, orphan]
            : [orphan, ...options];
    }
    return options;
};

const groupLabel = (source?: MetricSource) =>
    source === 'external' ? 'External metrics' : 'Internal metrics';

export const MetricSelector = ({
    value,
    valueSource,
    onChange,
    options,
    loading = false,
    label = 'Metric name',
    entryPoint,
}: MetricSelectorProps) => {
    const allOptions = withSelectedValue(options, value, valueSource);
    const registerImpactMetricsEnabled = useUiFlag('registerImpactMetrics');
    const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
    const { trackFormOpened } = useTrackRegisterImpactMetrics(entryPoint);

    return (
        <>
            <Autocomplete
                options={allOptions}
                groupBy={(option) => groupLabel(option.source)}
                getOptionLabel={(option) => option.displayName}
                value={
                    allOptions.find((option) =>
                        matchesSelection(option, value, valueSource),
                    ) || null
                }
                onChange={(_, newValue) => {
                    const selected = newValue || options[0];
                    onChange({
                        metricName: selected?.name || '',
                        source: selected?.source,
                    });
                }}
                disabled={loading}
                renderOption={(props, option, { inputValue }) => (
                    <Box
                        component='li'
                        {...props}
                        key={`${option.source}__${option.name}`}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant='body2'>
                                <Highlighter search={inputValue}>
                                    {option.displayName}
                                </Highlighter>
                            </Typography>
                            <Typography
                                variant='caption'
                                color='text.secondary'
                            >
                                <Highlighter search={inputValue}>
                                    {option.help}
                                </Highlighter>
                            </Typography>
                        </Box>
                    </Box>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={label}
                        placeholder='Search for a metric…'
                        variant='outlined'
                        size='small'
                        required
                    />
                )}
                noOptionsText={
                    <NoOptionsMessage
                        onRegisterClick={
                            registerImpactMetricsEnabled
                                ? () => {
                                      setRegisterDialogOpen(true);
                                      trackFormOpened();
                                  }
                                : undefined
                        }
                    />
                }
                sx={{ minWidth: 300 }}
            />
            <RegisterMetricDialog
                open={registerDialogOpen}
                onClose={() => setRegisterDialogOpen(false)}
            />
        </>
    );
};
