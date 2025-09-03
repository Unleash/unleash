import {
    Alert,
    Autocomplete,
    Checkbox,
    Chip,
    TextField,
    Typography,
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
    const SELECT_ALL = '*';
    const isAllSelected = value.includes(SELECT_ALL);
    const autocompleteId = `autocomplete-${labelKey}`;
    const isTruncated = options.length >= 1_000;

    const optionsWithSelectAll = [SELECT_ALL, ...options];

    return (
        <Autocomplete
            multiple
            disableCloseOnSelect
            id={autocompleteId}
            options={optionsWithSelectAll}
            value={isAllSelected ? options : value}
            getOptionLabel={(option) =>
                option === SELECT_ALL ? 'Select all' : option
            }
            onChange={(_, newValues, reason, details) => {
                if (details?.option === SELECT_ALL) {
                    onChange(isAllSelected ? [] : [SELECT_ALL]);
                    return;
                }
                onChange(newValues.filter((v) => v !== SELECT_ALL));
            }}
            renderOption={(props, option, { selected }) => (
                <li {...props}>
                    <Checkbox
                        size='small'
                        checked={
                            option === SELECT_ALL ? isAllSelected : selected
                        }
                        style={{ marginRight: 8 }}
                    />
                    {option === SELECT_ALL ? 'Select all' : option}
                </li>
            )}
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
                        inputProps={{ ...params.inputProps }}
                    />
                    {isTruncated && (
                        <Alert
                            severity='warning'
                            sx={(theme) => ({
                                padding: theme.spacing(1, 2),
                                marginTop: theme.spacing(1),
                            })}
                        >
                            Maximum of 1000 values loaded due to performance.
                        </Alert>
                    )}
                </>
            )}
        />
    );
};
