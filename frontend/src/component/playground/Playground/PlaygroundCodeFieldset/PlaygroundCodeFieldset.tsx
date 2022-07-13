import {
    Dispatch,
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
} from '@mui/material';
import { debounce } from 'debounce';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';

interface IPlaygroundCodeFieldsetProps {
    value: string | undefined;
    setValue: Dispatch<SetStateAction<string | undefined>>;
}

export const PlaygroundCodeFieldset: VFC<IPlaygroundCodeFieldsetProps> = ({
    value,
    setValue,
}) => {
    const theme = useTheme();
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
        debounceJsonParsing(value);
    }, [debounceJsonParsing, value]);

    const onAddField = () => {
        try {
            const currentValue = JSON.parse(value || '{}');
            setValue(
                JSON.stringify(
                    {
                        ...currentValue,
                        [contextField]: contextValue,
                    },
                    null,
                    2
                )
            );
            setContextValue('');
        } catch (error) {
            setToastData({
                type: 'error',
                title: `Error parsing context: ${formatUnknownError(error)}`,
            });
        }
    };

    return (
        <Box>
            <Typography
                variant="body2"
                sx={{ mb: 2 }}
                color={theme.palette.text.secondary}
            >
                Unleash context
            </Typography>
            <TextField
                error={Boolean(error)}
                helperText={error}
                autoCorrect="off"
                spellCheck={false}
                multiline
                label="JSON"
                placeholder={JSON.stringify(
                    {
                        currentTime: '2022-07-04T14:13:03.929Z',
                        appName: 'playground',
                        userId: 'test',
                        remoteAddress: '127.0.0.1',
                    },
                    null,
                    2
                )}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{ minRows: 5 }}
                value={value}
                onChange={event => setValue(event.target.value)}
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                <FormControl>
                    <InputLabel id="context-field-label" size="small">
                        Context field
                    </InputLabel>
                    <Select
                        label="Context field"
                        labelId="context-field-label"
                        id="context-field"
                        value={contextField}
                        onChange={event =>
                            setContextField(event.target.value || '')
                        }
                        variant="outlined"
                        size="small"
                        sx={{ width: 300, maxWidth: '100%' }}
                    >
                        {contextOptions.map(option => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Value"
                    id="context-value"
                    sx={{ width: 300, maxWidth: '100%' }}
                    size="small"
                    value={contextValue}
                    onChange={event =>
                        setContextValue(event.target.value || '')
                    }
                />
                <Button
                    variant="outlined"
                    disabled={!contextField || Boolean(error)}
                    onClick={onAddField}
                >
                    {`${
                        !fieldExist
                            ? 'Add context field'
                            : 'Replace context field value'
                    } `}
                </Button>
            </Box>
        </Box>
    );
};
