import type { FC } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import type { ImpactMetricsLabels } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { LabelFilterItem } from './LabelFilterItem/LabelFilterItem.tsx';

export type LabelsFilterProps = {
    selectedLabels: Record<string, string[]>;
    onChange: (labels: Record<string, string[]>) => void;
    availableLabels: ImpactMetricsLabels;
};

export const LabelsFilter: FC<LabelsFilterProps> = ({
    selectedLabels,
    onChange,
    availableLabels,
}) => {
    const handleLabelChange = (labelKey: string, values: string[]) => {
        const newLabels = { ...selectedLabels };
        if (values.length === 0) {
            delete newLabels[labelKey];
        } else {
            newLabels[labelKey] = values;
        }
        onChange(newLabels);
    };

    const handleAllToggle = (labelKey: string, checked: boolean) => {
        const newLabels = { ...selectedLabels };
        if (checked) {
            newLabels[labelKey] = ['*'];
        } else {
            delete newLabels[labelKey];
        }
        onChange(newLabels);
    };

    const clearAllLabels = () => {
        onChange({});
    };

    if (!availableLabels || Object.keys(availableLabels).length === 0) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    width: '100%',
                }}
            >
                <Typography variant='subtitle2'>Filter by labels</Typography>
                {Object.keys(selectedLabels).length > 0 && (
                    <Chip
                        label='Clear all'
                        size='small'
                        variant='outlined'
                        onClick={clearAllLabels}
                    />
                )}
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns:
                        'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 2,
                    flexGrow: 1,
                }}
            >
                {Object.entries(availableLabels).map(([labelKey, values]) => {
                    const currentSelection = selectedLabels[labelKey] || [];

                    return (
                        <Box
                            key={labelKey}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                flexGrow: 1,
                            }}
                        >
                            <LabelFilterItem
                                labelKey={labelKey}
                                options={values}
                                value={currentSelection}
                                onChange={(newValues) =>
                                    handleLabelChange(labelKey, newValues)
                                }
                                handleAllToggle={handleAllToggle}
                            />
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};
