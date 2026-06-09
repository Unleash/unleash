import { useCallback, useMemo, useState, type FC, type ReactNode } from 'react';
import {
    Autocomplete,
    Box,
    Checkbox,
    Divider,
    FormControlLabel,
    Paper,
    type PaperProps,
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

export const FeaturePicker: FC<FeaturePickerProps> = ({
    value,
    onChange,
    disabled,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [includeArchived, setIncludeArchived] = useState(false);

    const updateQuery = useMemo(
        () =>
            debounce((next: string) => {
                setDebouncedQuery(next);
            }, 250),
        [],
    );

    const ArchivedFilterPaper = useCallback(
        ({
            children,
            ...paperProps
        }: PaperProps & { children?: ReactNode }) => (
            <Paper {...paperProps}>
                <FormControlLabel
                    sx={{ px: 2, py: 1 }}
                    onMouseDown={(event) => event.preventDefault()}
                    control={
                        <Checkbox
                            size='small'
                            checked={includeArchived}
                            onChange={(_, checked) =>
                                setIncludeArchived(checked)
                            }
                        />
                    }
                    label={
                        <Typography variant='body2'>
                            Search archived features
                        </Typography>
                    }
                />
                <Divider />
                {children}
            </Paper>
        ),
        [includeArchived],
    );

    const { features, loading } = useFeatureSearch({
        query: debouncedQuery || undefined,
        limit: PICKER_LIMIT,
        archived: includeArchived ? 'IS:true' : undefined,
    });

    const options: FeatureOption[] = features.map(({ name, project }) => ({
        name,
        project,
    }));

    const selectedOptions = value.map(
        (name) =>
            options.find((option) => option.name === name) ?? {
                name,
                project: '',
            },
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
            slots={{ paper: ArchivedFilterPaper }}
            onInputChange={(_, next, reason) => {
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
