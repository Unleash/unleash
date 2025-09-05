import type { FC } from 'react';
import { Box } from '@mui/material';
import type { ImpactMetricsLabels } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { LabelFilterSection } from './LabelFilterSection/LabelFilterSection.tsx';

export type LabelsFilterProps = {
    labelSelectors: Record<string, string[]>;
    onChange: (labels: Record<string, string[]>) => void;
    availableLabels: ImpactMetricsLabels;
};

const STATIC_LABELS = ['environment', 'appName', 'origin'];

export const LabelsFilter: FC<LabelsFilterProps> = ({
    labelSelectors,
    onChange,
    availableLabels,
}) => {
    const handleLabelChange = (labelKey: string, values: string[]) => {
        const newLabels = { ...labelSelectors };
        if (values.length === 0) {
            delete newLabels[labelKey];
        } else {
            newLabels[labelKey] = values;
        }
        onChange(newLabels);
    };

    const handleAllToggle = (labelKey: string, checked: boolean) => {
        const newLabels = { ...labelSelectors };
        if (checked) {
            newLabels[labelKey] = ['*'];
        } else {
            delete newLabels[labelKey];
        }
        onChange(newLabels);
    };

    if (!availableLabels || Object.keys(availableLabels).length === 0) {
        return null;
    }

    const staticLabels = Object.entries(availableLabels)
        .filter(([key]) => STATIC_LABELS.includes(key))
        .sort();
    const dynamicLabels = Object.entries(availableLabels)
        .filter(([key]) => !STATIC_LABELS.includes(key))
        .sort();

    return (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {staticLabels.length > 0 && (
                <LabelFilterSection
                    title='Filter by labels'
                    labels={staticLabels}
                    labelSelectors={labelSelectors}
                    onLabelChange={handleLabelChange}
                    onAllToggle={handleAllToggle}
                    onChange={onChange}
                />
            )}

            {dynamicLabels.length > 0 && (
                <LabelFilterSection
                    title='Flag specific filters'
                    labels={dynamicLabels}
                    labelSelectors={labelSelectors}
                    onLabelChange={handleLabelChange}
                    onAllToggle={handleAllToggle}
                    onChange={onChange}
                />
            )}
        </Box>
    );
};
