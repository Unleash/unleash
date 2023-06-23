import {
    Dispatch,
    FormEvent,
    SetStateAction,
    useEffect,
    useMemo,
    useState,
    VFC,
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
    SelectChangeEvent,
} from '@mui/material';

import { debounce } from 'debounce';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import { PlaygroundEditor } from './PlaygroundEditor/PlaygroundEditor';
import { GuidanceIndicator } from 'component/common/GuidanceIndicator/GuidanceIndicator';
import { parseDateValue, parseValidDate } from 'component/common/util';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { isStringOrStringArray } from '../../playground.utils';
interface IPlaygroundCodeFieldsetProps {
    context: string | undefined;
    setContext: Dispatch<SetStateAction<string | undefined>>;
}

export const PlaygroundCodeFieldset: VFC<IPlaygroundCodeFieldsetProps> = ({
    context,
    setContext,
}) => {
    const theme = useTheme();
    const { uiConfig } = useUiConfig();
    const isAdvancedPlayground = Boolean(uiConfig.flags.advancedPlayground);

    const { setToastData } = useToast();
    const { context: contextData } = useUnleashContext();
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

                    setFieldExist(contextValue[contextField] !== undefined);
                } catch (error: unknown) {
                    return setError(formatUnknownError(error));
                }

                return setError(undefined);
            }, 250),
        [setError, contextField, setFieldExist]
    );

    useEffect(() => {
        debounceJsonParsing(context);
    }, [debounceJsonParsing, context]);

    const onAddField = () => {
        try {
            const currentValue = JSON.parse(context || '{}');
            setContext(
                JSON.stringify(
                    {
                        ...currentValue,
                        [contextField]: contextValue,
                    },
                    null,
                    2
                )
            );

            const foundContext = contextData.find(
                context => context.name === contextField
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
                title: `Error parsing context: ${formatUnknownError(error)}`,
            });
        }
    };

    const changeContextValue = (
        e: FormEvent,
        newValue: string | (string | string[])[] | null
    ) => {
        if (!isStringOrStringArray(newValue)) return;

        if (Array.isArray(newValue)) {
            const temp =
                (newValue || []).length > 1 ? newValue.join(',') : newValue[0];
            return setContextValue(temp);
        }

        setContextValue(newValue);
    };

    const resolveAutocompleteValue = (): string | string[] | null => {
        //This is needed for clearing the Autocomplete Chips when changing the context field
        //and the new field also has legal values
        if (!contextValue || contextValue === '') {
            return [];
        }

        if (isAdvancedPlayground) {
            // Split comma separated strings to array for fields with legal values
            const foundField = contextData.find(
                contextData => contextData.name === contextField
            );
            const hasLegalValues = (foundField?.legalValues || []).length > 1;
            if (contextValue.includes(',') && hasLegalValues) {
                return contextValue.split(',');
            }

            return [contextValue as string];
        }

        return contextValue;
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
                    id="date"
                    label="Date"
                    size="small"
                    type="datetime-local"
                    value={value}
                    sx={{ width: 200, maxWidth: '100%' }}
                    onChange={e => {
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
            contextData => contextData.name === contextField
        );
        if (
            foundField &&
            foundField.legalValues &&
            foundField.legalValues.length > 0
        ) {
            const options = foundField.legalValues.map(({ value }) => value);
            return (
                <Autocomplete
                    disablePortal
                    id="context-legal-values"
                    freeSolo
                    filterSelectedOptions
                    size="small"
                    value={resolveAutocompleteValue()}
                    onChange={changeContextValue}
                    options={options}
                    multiple={isAdvancedPlayground}
                    sx={{ width: 200, maxWidth: '100%' }}
                    renderInput={(params: any) => (
                        <TextField {...params} label="Value" />
                    )}
                />
            );
        }

        return (
            <TextField
                label="Value"
                id="context-value"
                sx={{ width: 200, maxWidth: '100%' }}
                size="small"
                value={contextValue}
                onChange={event => setContextValue(event.target.value || '')}
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
                <GuidanceIndicator type="secondary">2</GuidanceIndicator>
                <Typography
                    variant="body2"
                    color={theme.palette.text.secondary}
                    sx={{ ml: 1 }}
                >
                    Unleash context
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <FormControl>
                    <InputLabel id="context-field-label" size="small">
                        Context field
                    </InputLabel>
                    <Select
                        label="Context field"
                        labelId="context-field-label"
                        id="context-field"
                        value={contextField}
                        onChange={changeContextField}
                        variant="outlined"
                        size="small"
                        sx={{ width: 200, maxWidth: '100%' }}
                    >
                        {contextOptions.map(option => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {resolveInput()}
                <Button
                    variant="outlined"
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
