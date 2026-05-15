import { useMemo, useState, type FC } from 'react';
import {
    Autocomplete,
    Box,
    TextField,
    Typography,
    debounce,
} from '@mui/material';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';

type FeatureOption = {
    name: string;
    project: string;
};

export type FeaturePickerProps = {
    value: string[];
    onChange: (featureNames: string[]) => void;
    disabled?: boolean;
};

const PICKER_LIMIT = '50';

const buildOptions = (
    selected: string[],
    fetched: FeatureOption[],
): FeatureOption[] => {
    const fetchedNames = new Set(fetched.map((feature) => feature.name));
    const orphans: FeatureOption[] = selected
        .filter((name) => !fetchedNames.has(name))
        .map((name) => ({ name, project: '' }));
    return [...orphans, ...fetched];
};

export const FeaturePicker: FC<FeaturePickerProps> = ({
    value,
    onChange,
    disabled,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const updateQuery = useMemo(
        () =>
            debounce((next: string) => {
                setDebouncedQuery(next);
            }, 250),
        [],
    );

    const { features, loading } = useFeatureSearch({
        query: debouncedQuery || undefined,
        limit: PICKER_LIMIT,
    });

    const options = useMemo(
        () => buildOptions(value, features as FeatureOption[]),
        [value, features],
    );

    const selectedOptions = useMemo(
        () =>
            value.map(
                (name) =>
                    options.find((option) => option.name === name) ?? {
                        name,
                        project: '',
                    },
            ),
        [options, value],
    );

    return (
        <Autocomplete
            multiple
            disableCloseOnSelect
            disabled={disabled}
            loading={loading}
            options={options}
            value={selectedOptions}
            inputValue={inputValue}
            onInputChange={(_, next) => {
                setInputValue(next);
                updateQuery(next);
            }}
            onChange={(_, next) => {
                onChange(next.map((option) => option.name));
            }}
            isOptionEqualToValue={(option, selected) =>
                option.name === selected.name
            }
            getOptionLabel={(option) => option.name}
            renderOption={(props, option) => (
                <Box component='li' {...props} key={option.name}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant='body2'>{option.name}</Typography>
                        {option.project ? (
                            <Typography
                                variant='caption'
                                sx={{ color: 'text.secondary' }}
                            >
                                {option.project}
                            </Typography>
                        ) : null}
                    </Box>
                </Box>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label='Features to follow'
                    placeholder={
                        value.length === 0
                            ? 'Search for features…'
                            : 'Add another feature…'
                    }
                    size='small'
                    variant='outlined'
                    helperText='Toggle events for these features will be drawn over the chart.'
                />
            )}
        />
    );
};
