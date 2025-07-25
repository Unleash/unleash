import {
    Alert,
    Autocomplete,
    Checkbox,
    Chip,
    FormControlLabel,
    styled,
    TextField,
    Typography,
} from '@mui/material';
import type { FC } from 'react';

const StyledSelectAllLabel = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

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
    const isTruncated = options.length >= 1_000;

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
                label={<StyledSelectAllLabel>Select all</StyledSelectAllLabel>}
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
                renderTags={(value, getTagProps) => {
                    const overflowCount = 5;
                    const displayedValues = value.slice(-overflowCount);
                    const remainingCount = value.length - overflowCount;

                    return (
                        <>
                            {displayedValues.map((option, index) => {
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
                            })}
                            {remainingCount > 0 ? (
                                <Typography
                                    component='span'
                                    sx={{ color: 'text.secondary' }}
                                >
                                    {' '}
                                    (+{remainingCount})
                                </Typography>
                            ) : null}
                        </>
                    );
                }}
                renderInput={(params) => (
                    <>
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
                        {isTruncated && (
                            <Alert
                                severity='warning'
                                sx={(theme) => ({
                                    padding: theme.spacing(1, 2),
                                    marginTop: theme.spacing(1),
                                })}
                            >
                                Maximum of 1000 values loaded due to
                                performance.
                            </Alert>
                        )}
                    </>
                )}
            />
        </>
    );
};
