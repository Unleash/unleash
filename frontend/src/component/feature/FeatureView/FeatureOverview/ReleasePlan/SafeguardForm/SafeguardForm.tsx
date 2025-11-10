import { Button } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useImpactMetricsNames } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import {
    StyledFormContainer,
    StyledTopRow,
    StyledLabel,
    StyledButtonGroup,
    StyledSelect,
    StyledMenuItem,
    StyledTextField,
    createStyledIcon,
} from '../shared/SharedFormComponents.tsx';

const StyledIcon = createStyledIcon(ShieldIcon);

interface ISafeguardFormProps {
    onSubmit: (data: {
        metric: string;
        application: string;
        aggregation: string;
        comparison: string;
        threshold: number;
    }) => void;
    onCancel: () => void;
}

export const SafeguardForm = ({ onSubmit, onCancel }: ISafeguardFormProps) => {
    const { metricSeries, loading } = useImpactMetricsNames();

    // Hardcoded values for now
    const aggregationModes = ['rps', 'count'];
    const applicationNames = ['web', 'mobile', 'api', 'backend'];

    const [selectedMetric, setSelectedMetric] = useState('');
    const [application, setApplication] = useState('web');
    const [aggregationMode, setAggregationMode] = useState('rps');
    const [operator, setOperator] = useState('>');
    const [threshold, setThreshold] = useState(0);

    // Set initial metric when data loads
    useEffect(() => {
        if (metricSeries.length > 0 && !selectedMetric) {
            setSelectedMetric(metricSeries[0].name);
        }
    }, [metricSeries, selectedMetric]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (threshold && !Number.isNaN(Number(threshold))) {
            const metric = metricSeries.find((m) => m.name === selectedMetric);
            onSubmit({
                metric: metric?.displayName || selectedMetric,
                application,
                aggregation: aggregationMode,
                comparison: operator,
                threshold: Number(threshold),
            });
        }
    };

    return (
        <StyledFormContainer onSubmit={handleSubmit}>
            <StyledTopRow>
                <StyledIcon />
                <StyledSelect
                    value={selectedMetric}
                    onChange={(e) =>
                        setSelectedMetric(e.target.value as string)
                    }
                    variant='outlined'
                    size='small'
                >
                    {metricSeries.map((metric) => (
                        <StyledMenuItem key={metric.name} value={metric.name}>
                            {metric.displayName}
                        </StyledMenuItem>
                    ))}
                </StyledSelect>

                <StyledLabel>filtered by</StyledLabel>
                <StyledSelect
                    value={application}
                    onChange={(e) => setApplication(e.target.value)}
                    variant='outlined'
                    size='small'
                >
                    {applicationNames.map((app) => (
                        <StyledMenuItem key={app} value={app}>
                            {app}
                        </StyledMenuItem>
                    ))}
                </StyledSelect>

                <StyledLabel>aggregated by</StyledLabel>
                <StyledSelect
                    value={aggregationMode}
                    onChange={(e) => setAggregationMode(e.target.value)}
                    variant='outlined'
                    size='small'
                >
                    {aggregationModes.map((mode) => (
                        <StyledMenuItem key={mode} value={mode}>
                            {mode}
                        </StyledMenuItem>
                    ))}
                </StyledSelect>

                <StyledLabel>is</StyledLabel>
                <StyledSelect
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    variant='outlined'
                    size='small'
                >
                    <StyledMenuItem value='>'>More than</StyledMenuItem>
                    <StyledMenuItem value='<'>Less than</StyledMenuItem>
                </StyledSelect>

                <StyledTextField
                    type='number'
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    placeholder='Value'
                    variant='outlined'
                    size='small'
                    required
                />
            </StyledTopRow>
            <StyledButtonGroup>
                <Button variant='outlined' onClick={onCancel} size='small'>
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    type='submit'
                    disabled={!threshold || Number.isNaN(Number(threshold))}
                >
                    Save
                </Button>
            </StyledButtonGroup>
        </StyledFormContainer>
    );
};
