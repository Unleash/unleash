import { useMemo, useState, type FC } from 'react';
import {
    Autocomplete,
    Box,
    TextField,
    Typography,
    debounce,
} from '@mui/material';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import type { FeatureSearchResponseSchema } from 'openapi';

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

const FeatureOptionRow: FC<{ option: FeatureOption }> = ({ option }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant='body2'>{option.name}</Typography>
        {option.project ? (
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                {option.project}
            </Typography>
        ) : null}
    </Box>
);

// Merges the search results with any already-selected names that aren't in the
// current results (so a selected feature stays a valid option even after the
// search query changes). The orphan's project is unknown, hence empty.
const buildOptions = (
    selected: string[],
    fetched: FeatureSearchResponseSchema[],
): FeatureOption[] => {
    const fetchedNames = new Set(fetched.map((feature) => feature.name));
    const orphans: FeatureOption[] = selected
        .filter((name) => !fetchedNames.has(name))
        .map((name) => ({ name, project: '' }));

    const fetchedOptions: FeatureOption[] = fetched.map(
        ({ name, project }) => ({
            name,
            project,
        }),
    );

    return [...orphans, ...fetchedOptions];
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
        () => buildOptions(value, features),
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
            onInputChange={(_, next, reason) => {
                // Only react to typing. MUI also fires this with reason
                // 'reset'/'clear' (e.g. after a selection), which would wipe the
                // query back to the default list mid-search.
                if (reason !== 'input') return;
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
                    <FeatureOptionRow option={option} />
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
