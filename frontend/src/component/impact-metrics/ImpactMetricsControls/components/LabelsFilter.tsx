import type { FC } from 'react';
import {
    Box,
    Autocomplete,
    TextField,
    Typography,
    Chip,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
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

            {Object.entries(availableLabels).map(([labelKey, values]) => {
                const currentSelection = selectedLabels[labelKey] || [];
                const isAllSelected = currentSelection.includes('*');

                return (
                    <Box
                        key={labelKey}
                        sx={(theme) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: theme.spacing(3),
                        })}
                    >
                        <Autocomplete
                            multiple
                            options={values}
                            value={isAllSelected ? [] : currentSelection}
                            onChange={(_, newValues) => {
                                handleLabelChange(labelKey, newValues);
                            }}
                            disabled={isAllSelected}
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
                                    placeholder={
                                        isAllSelected
                                            ? 'All values selected'
                                            : 'Select values…'
                                    }
                                    variant='outlined'
                                    size='small'
                                />
                            )}
                            sx={{ minWidth: 300, flexGrow: 1 }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isAllSelected}
                                    onChange={(e) =>
                                        handleAllToggle(
                                            labelKey,
                                            e.target.checked,
                                        )
                                    }
                                />
                            }
                            label='All'
                        />
                    </Box>
                );
            })}
        </Box>
    );
};
