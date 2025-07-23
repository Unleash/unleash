import {
    Autocomplete,
    Box,
    Checkbox,
    Chip,
    FormControlLabel,
    TextField,
} from '@mui/material';
import type { FC } from 'react';

type LabelFilterItemProps = {
    labelKey: string;
    options: string[];
    value: string[];
    onChange: (values: string[]) => void;
    handleAllToggle: (labelKey: string, checked: boolean) => void;
};

export const LabelFilterItem: FC<LabelFilterItemProps> = ({
    labelKey,
    options,
    value,
    onChange,
}) => {
    const isAllSelected = value.includes('*');
    const autocompleteId = `autocomplete-${labelKey}`;
    const selectAllId = `select-all-${labelKey}`;

    return (
        <>
            <FormControlLabel
                sx={(theme) => ({
                    marginLeft: theme.spacing(0),
                })}
                control={
                    <Checkbox
                        id={selectAllId}
                        size='small'
                        checked={isAllSelected}
                        onChange={(e) =>
                            onChange(e.target.checked ? ['*'] : [])
                        }
                        inputProps={{
                            'aria-describedby': autocompleteId,
                            'aria-label': `Select all ${labelKey} options`,
                        }}
                    />
                }
                label={
                    <Box
                        component='span'
                        sx={(theme) => ({
                            fontSize: theme.fontSizes.smallBody,
                        })}
                    >
                        Select all
                    </Box>
                }
            />
            <Autocomplete
                multiple
                id={autocompleteId}
                options={options}
                value={isAllSelected ? options : value}
                onChange={(_, newValues) => {
                    onChange(newValues);
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
                            isAllSelected ? undefined : 'Select values…'
                        }
                        variant='outlined'
                        size='small'
                        inputProps={{
                            ...params.inputProps,
                            'aria-describedby': isAllSelected
                                ? `${selectAllId}-description`
                                : undefined,
                        }}
                    />
                )}
            />
        </>
    );
};
