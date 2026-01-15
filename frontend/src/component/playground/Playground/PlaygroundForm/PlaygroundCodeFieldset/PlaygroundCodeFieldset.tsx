import {
    type Dispatch,
    type FormEvent,
    type SetStateAction,
    useEffect,
    useMemo,
    useState,
    type VFC,
} from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    useTheme,
    Autocomplete,
    type SelectChangeEvent,
    Checkbox,
} from '@mui/material';

import debounce from 'debounce';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import { PlaygroundEditor } from './PlaygroundEditor/PlaygroundEditor.tsx';
import { parseDateValue, parseValidDate } from 'component/common/util';
import {
    isStringOrStringArray,
    normalizeCustomContextProperties,
} from '../../playground.utils';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useFullUnleashContext } from 'hooks/api/getters/useUnleashContext/useFullUnleashContext.ts';

interface IPlaygroundCodeFieldsetProps {
    context: string | undefined;
    setContext: Dispatch<SetStateAction<string | undefined>>;
}

export const PlaygroundCodeFieldset: VFC<IPlaygroundCodeFieldsetProps> = ({
    context,
    setContext,
}) => {
    const theme = useTheme();

    const { setToastData } = useToast();
    const { context: contextData } = useFullUnleashContext();
    const contextOptions = contextData
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(({ name }) => name);
    const [error, setError] = useState<string>();
    const [fieldExist, setFieldExist] = useState<boolean>(false);
    const [contextField, setContextField] = useState<string>('');
    const [contextValue, setContextValue] = useState<string>('');
    const debounceJsonParsing = useMemo(
        () =>
            debounce((input?: string) => {
                if (!input) {
                    return setError(undefined);
                }

                try {
                    const contextValue = JSON.parse(input);

                    setFieldExist(
                        contextValue[contextField] !== undefined ||
                            contextValue?.properties?.[contextField] !==
                                undefined,
                    );
                } catch (error: unknown) {
                    return setError(formatUnknownError(error));
                }

                return setError(undefined);
            }, 250),
        [setError, contextField, setFieldExist],
    );

    useEffect(() => {
        debounceJsonParsing(context);
    }, [debounceJsonParsing, context]);

    const onAddField = () => {
        try {
            const currentValue = JSON.parse(context || '{}');

            setContext(
                JSON.stringify(
                    normalizeCustomContextProperties({
                        ...currentValue,
                        [contextField]: contextValue,
                    }),
                    null,
                    2,
                ),
            );

            const foundContext = contextData.find(
                (context) => context.name === contextField,
            );

            if (
                (foundContext?.legalValues &&
                    foundContext.legalValues.length > 0) ||
                contextField === 'currentTime'
            ) {
                return setContextValue('');
            }
        } catch (error) {
            setToastData({
                type: 'error',
                text: `Error parsing context: ${formatUnknownError(error)}`,
            });
        }
    };

    const changeContextValue = (
        _e: FormEvent,
        newValue: string | (string | string[])[] | null,
    ) => {
        if (!isStringOrStringArray(newValue)) return;

        if (Array.isArray(newValue)) {
            const temp =
                (newValue || []).length > 1 ? newValue.join(',') : newValue[0];
            return setContextValue(temp);
        }

        setContextValue(newValue);
    };

    const resolveAutocompleteValue = (): string[] => {
        //This is needed for clearing the Autocomplete Chips when changing the context field
        //and the new field also has legal values
        if (!contextValue || contextValue === '') {
            return [];
        }

        // Split comma separated strings to array for fields with legal values
        const foundField = contextData.find(
            (contextData) => contextData.name === contextField,
        );
        const hasLegalValues = (foundField?.legalValues || []).length > 1;
        if (contextValue.includes(',') && hasLegalValues) {
            return contextValue.split(',');
        }

        return [contextValue as string];
    };

    const resolveInput = () => {
        if (contextField === 'currentTime') {
            const validDate = parseValidDate(contextValue);
            const now = new Date();

            const value = validDate
                ? parseDateValue(validDate.toISOString())
                : parseDateValue(now.toISOString());
            return (
                <TextField
                    id='date'
                    label='Date'
                    size='small'
                    type='datetime-local'
                    value={value}
                    sx={{ width: 200, maxWidth: '100%' }}
                    onChange={(e) => {
                        const parsedDate = parseValidDate(e.target.value);
                        const dateString = parsedDate?.toISOString();
                        dateString && setContextValue(dateString);
                    }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    required
                />
            );
        }
        const foundField = contextData.find(
            (contextData) => contextData.name === contextField,
        );
        if (foundField?.legalValues && foundField.legalValues.length > 0) {
            const options = foundField.legalValues.map(({ value }) => value);

            return (
                <Autocomplete
                    disablePortal
                    limitTags={3}
                    id='context-legal-values'
                    multiple={true}
                    options={options}
                    disableCloseOnSelect
                    size='small'
                    value={resolveAutocompleteValue()}
                    onChange={changeContextValue}
                    getOptionLabel={(option) => option}
                    renderOption={(props, option, { selected }) => {
                        return (
                            <li {...props}>
                                <Checkbox
                                    icon={
                                        <CheckBoxOutlineBlank fontSize='small' />
                                    }
                                    checkedIcon={
                                        <CheckBoxIcon fontSize='small' />
                                    }
                                    sx={(theme) => ({
                                        marginRight: theme.spacing(0.5),
                                    })}
                                    checked={selected}
                                />
                                {option}
                            </li>
                        );
                    }}
                    sx={{ width: 370, maxWidth: '100%' }}
                    renderInput={(params) => (
                        <TextField {...params} label='Value' />
                    )}
                />
            );
        }

        return (
            <TextField
                label='Value'
                id='context-value'
                sx={{ width: 370, maxWidth: '100%' }}
                placeholder={'value1,value2,value3'}
                size='small'
                value={contextValue}
                onChange={(event) => setContextValue(event.target.value || '')}
            />
        );
    };

    const changeContextField = (event: SelectChangeEvent) => {
        setContextField(event.target.value || '');

        if (event.target.value === 'currentTime') {
            return setContextValue(new Date().toISOString());
        }

        setContextValue('');
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography
                    variant='body2'
                    color={theme.palette.text.primary}
                    sx={{ ml: 1 }}
                >
                    Unleash context
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <FormControl>
                    <InputLabel id='context-field-label' size='small'>
                        Context field
                    </InputLabel>
                    <Select
                        label='Context field'
                        labelId='context-field-label'
                        id='context-field'
                        value={contextField}
                        onChange={changeContextField}
                        variant='outlined'
                        size='small'
                        sx={{ width: 200, maxWidth: '100%' }}
                    >
                        {contextOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {resolveInput()}
                <Button
                    variant='outlined'
                    disabled={!contextField || Boolean(error)}
                    onClick={onAddField}
                    sx={{ width: '95px', maxHeight: '40px' }}
                >
                    {`${!fieldExist ? 'Add' : 'Replace'} `}
                </Button>
            </Box>

            <PlaygroundEditor
                context={context}
                setContext={setContext}
                error={error}
            />
        </Box>
    );
};
