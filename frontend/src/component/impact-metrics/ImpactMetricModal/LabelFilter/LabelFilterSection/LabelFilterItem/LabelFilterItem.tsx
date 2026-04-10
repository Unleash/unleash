import {
    Alert,
    Autocomplete,
    Checkbox,
    Chip,
    TextField,
    Typography,
} from '@mui/material';
import { METRIC_LABELS_SELECT_ALL } from 'component/impact-metrics/hooks/useImpactMetricsState';
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
    const isAllSelected = value.includes(METRIC_LABELS_SELECT_ALL);
    const autocompleteId = `autocomplete-${labelKey}`;
    const isTruncated = options.length >= 1_000;

    const optionsWithSelectAll = [METRIC_LABELS_SELECT_ALL, ...options];

    return (
        <Autocomplete
            multiple
            disableCloseOnSelect
            id={autocompleteId}
            options={optionsWithSelectAll}
            value={isAllSelected ? options : value}
            getOptionLabel={(option) =>
                option === METRIC_LABELS_SELECT_ALL ? '(Select all)' : option
            }
            onChange={(_, newValues, _reason, details) => {
                if (details?.option === METRIC_LABELS_SELECT_ALL) {
                    onChange(isAllSelected ? [] : [METRIC_LABELS_SELECT_ALL]);
                    return;
                }
                onChange(
                    newValues.filter((v) => v !== METRIC_LABELS_SELECT_ALL),
                );
            }}
            renderOption={(props, option, { selected }) => {
                const { key, ...listItemProps } = props as any;

                return (
                    <li key={key || option} {...listItemProps}>
                        <Checkbox
                            size='small'
                            checked={
                                option === METRIC_LABELS_SELECT_ALL
                                    ? isAllSelected
                                    : selected
                            }
                            style={{ marginRight: 8 }}
                        />
                        {option === METRIC_LABELS_SELECT_ALL ? (
                            <Typography
                                component='span'
                                sx={{ color: 'text.secondary' }}
                            >
                                Select all
                            </Typography>
                        ) : (
                            option
                        )}
                    </li>
                );
            }}
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
