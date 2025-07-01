import type { FC } from 'react';
import { Box, Autocomplete, TextField, Typography, Chip } from '@mui/material';
import type { ImpactMetricsLabels } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';

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

    const clearAllLabels = () => {
        onChange({});
    };

    if (!availableLabels || Object.keys(availableLabels).length === 0) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

            {Object.entries(availableLabels).map(([labelKey, values]) => (
                <Autocomplete
                    key={labelKey}
                    multiple
                    options={values}
                    value={selectedLabels[labelKey] || []}
                    onChange={(_, newValues) =>
                        handleLabelChange(labelKey, newValues)
                    }
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                            const { key, ...chipProps } = getTagProps({
                                index,
                            });
                            return (
                                <Chip
                                    {...chipProps}
                                    key={key}
                                    label={option}
                                    size='small'
                                />
                            );
                        })
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={labelKey}
                            placeholder='Select values...'
                            variant='outlined'
                            size='small'
                        />
                    )}
                    sx={{ minWidth: 300 }}
                />
            ))}
        </Box>
    );
};
