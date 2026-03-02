import {
    Box,
    Button,
    IconButton,
    styled,
    TextField,
    Typography,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import HighlightOff from '@mui/icons-material/HighlightOff';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import Delete from '@mui/icons-material/Delete';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import {
    type FC,
    type MutableRefObject,
    type ReactNode,
    memo,
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
} from 'react';
import { RE2JS } from 're2js';
import type { ConstraintValidatorOutput } from './ConstraintValidatorOutput';

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
}));

const StyledTestValuesBox = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledList = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    padding: 0,
    margin: theme.spacing(1, 0, 0),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const StyledListItem = styled('li')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

const StyledTestInputBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    flexGrow: 1,
    display: 'flex',
    width: '100%',
    '& .MuiFormHelperText-root': {
        marginLeft: 0,
        marginTop: theme.spacing(1),
    },
}));

const InputRow = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'start',
    width: '100%',
    marginBlock: theme.spacing(0.5),
}));

const StyledMatchIndicatorBox = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'match',
})<{ match: boolean }>(({ theme, match }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontSize: theme.fontSizes.smallBody,
    color: match ? theme.palette.success.main : theme.palette.warning.main,
}));

const StyledMatchIcon = styled(CheckCircleOutline)(({ theme }) => ({
    color: theme.palette.success.main,
    fontSize: 'inherit',
}));

const StyledNoMatchIcon = styled(HighlightOff)(({ theme }) => ({
    color: theme.palette.warning.main,
    fontSize: 'inherit',
}));

const MatchIndicator: FC<{ match: boolean; testString: string }> = ({
    match,
    testString,
}) => {
    const isEmptyTestString = testString === '';
    return match ? (
        <StyledMatchIndicatorBox match={match}>
            <StyledMatchIcon aria-hidden />
            Your regular expression matches
            {isEmptyTestString ? ' an empty string.' : ''}
        </StyledMatchIndicatorBox>
    ) : (
        <StyledMatchIndicatorBox match={match}>
            <StyledNoMatchIcon aria-hidden />
            Your regular expression does not match
            {isEmptyTestString ? ' empty strings.' : ''}
        </StyledMatchIndicatorBox>
    );
};

const HelpText = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    margin: 0,
}));

type RegexTestInput = {
    id: number;
    testString: string;
    match: boolean;
};

type RegexTestInputItemProps = {
    input: RegexTestInput;
    index: number;
    totalCount: number;
    onEdit: (id: number, testString: string) => void;
    onRemove: (id: number) => void;
    inputRefs: MutableRefObject<
        Array<HTMLTextAreaElement | HTMLInputElement | null>
    >;
};

const RegexTestInputItem: FC<RegexTestInputItemProps> = memo(
    ({ input, index, totalCount, onEdit, onRemove, inputRefs }) => {
        const setInputRef = useCallback(
            (el: HTMLTextAreaElement | HTMLInputElement | null) => {
                inputRefs.current[index] = el;
            },
            [inputRefs, index],
        );

        const handleChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                onEdit(input.id, e.target.value);
            },
            [input.id, onEdit],
        );

        return (
            <StyledListItem>
                <StyledTestInputBox>
                    <StyledTextField
                        type='text'
                        placeholder='Enter test value'
                        size='small'
                        fullWidth
                        value={input.testString}
                        id={`test-input-${input.id}`}
                        inputProps={{
                            'aria-describedby': 'test-strings-description',
                        }}
                        inputRef={setInputRef}
                        onChange={handleChange}
                    />
                    {totalCount > 1 && (
                        <HtmlTooltip title='Remove test string' arrow>
                            <IconButton
                                type='button'
                                size='small'
                                aria-label={`Remove test string ${index}: ${input.testString === '' ? 'empty string' : ''}`}
                                sx={{ ml: 'auto' }}
                                onClick={() => onRemove(input.id)}
                            >
                                <Delete fontSize='inherit' />
                            </IconButton>
                        </HtmlTooltip>
                    )}
                </StyledTestInputBox>
                <MatchIndicator
                    match={input.match}
                    testString={input.testString}
                />
            </StyledListItem>
        );
    },
);

const RegexTestValues: FC<{
    matchesRegex: (testString: string) => boolean;
}> = ({ matchesRegex }) => {
    const [regexTestInputs, setRegexTestInputs] = useState<RegexTestInput[]>([
        { id: 1, testString: '', match: false },
    ]);
    const regexTestInputRefs = useRef<
        Array<HTMLTextAreaElement | HTMLInputElement | null>
    >([]);
    const pendingFocusIndex = useRef<number | null>(null);

    useEffect(() => {
        setRegexTestInputs((prev) =>
            prev.map((input) => ({
                ...input,
                match: matchesRegex(input.testString),
            })),
        );
    }, [matchesRegex]);

    useEffect(() => {
        if (pendingFocusIndex.current !== null) {
            if (pendingFocusIndex.current > -1) {
                regexTestInputRefs.current[pendingFocusIndex.current]?.focus();
            }
            pendingFocusIndex.current = null;
        }
    }, [regexTestInputs]);

    const handleEditTestString = useCallback(
        (id: number, testString: string) => {
            setRegexTestInputs((prev) =>
                prev.map((input) => {
                    if (input.id !== id) return input;
                    return {
                        ...input,
                        testString,
                        match: matchesRegex(testString),
                    };
                }),
            );
        },
        [matchesRegex],
    );

    const handleAddTestString = useCallback(() => {
        setRegexTestInputs((prev) => {
            const maxId = prev.reduce(
                (max, input) => Math.max(max, input.id),
                0,
            );
            pendingFocusIndex.current = prev.length;
            return [...prev, { id: maxId + 1, testString: '', match: false }];
        });
    }, []);

    const handleRemoveTestString = useCallback((id: number) => {
        setRegexTestInputs((prev) => {
            if (prev.length <= 1) return prev;
            const idx = prev.findIndex((input) => input.id === id);
            pendingFocusIndex.current = Math.min(idx, prev.length - 2);
            return prev.filter((input) => input.id !== id);
        });
    }, []);

    return (
        <StyledTestValuesBox>
            <Typography variant='h3'>Test regex</Typography>
            <Typography id='test-strings-description' variant='body2'>
                Enter test values to check Regex matching.
            </Typography>
            <StyledList>
                {regexTestInputs.map((regexTestInput, index) => (
                    <RegexTestInputItem
                        key={regexTestInput.id}
                        input={regexTestInput}
                        index={index}
                        totalCount={regexTestInputs.length}
                        onEdit={handleEditTestString}
                        onRemove={handleRemoveTestString}
                        inputRefs={regexTestInputRefs}
                    />
                ))}
            </StyledList>
            <Box>
                <Button
                    type='button'
                    variant='text'
                    size='small'
                    startIcon={<Add />}
                    onClick={handleAddTestString}
                >
                    Add test string
                </Button>
            </Box>
        </StyledTestValuesBox>
    );
};

type AddRegexValueEditorProps = {
    addValue: (newValue: string) => void;
    initialValue?: string;
    helpText?: ReactNode;
    caseInsensitive: boolean;
    editingOpen: boolean;
    validator: (value: string) => ConstraintValidatorOutput;
};

export const AddRegexValueEditor: FC<AddRegexValueEditorProps> = ({
    initialValue,
    addValue,
    helpText,
    caseInsensitive,
    validator,
    editingOpen,
}) => {
    const [inputValue, setInputValue] = useState(initialValue || '');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = useId();
    const helpTextId = useId();
    const matchesRegex = useCallback(
        (testString: string): boolean => {
            try {
                return RE2JS.compile(
                    inputValue,
                    caseInsensitive ? RE2JS.CASE_INSENSITIVE : undefined,
                )
                    .matcher(testString)
                    .find();
            } catch (_e) {
                return false;
            }
        },
        [inputValue, caseInsensitive],
    );

    const validateValue = useCallback(
        (newValue: string): string => {
            if (newValue.length > 100) {
                return `Values cannot be longer than 100 characters (current: ${newValue.length})`;
            }
            const [isValid, errorMessage] = validator(newValue);
            return isValid ? '' : errorMessage;
        },
        [validator],
    );

    const handleRegexKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!inputValue?.trim()) {
                    setError('Value cannot be empty or whitespace');
                    return;
                }
            }
        },
        [inputValue],
    );

    const handleRegexInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value);
            addValue(e.target.value);
        },
        [addValue],
    );

    useEffect(() => {
        if (!editingOpen) return;
        setInputValue(initialValue || '');
        setError(validateValue(initialValue || ''));
    }, [editingOpen, initialValue, validateValue]);

    return (
        <StyledBox>
            <Typography variant='h2'>Regular expression</Typography>
            <InputRow>
                <ScreenReaderOnly>
                    <label htmlFor={inputId}>Constraint Value</label>
                </ScreenReaderOnly>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                    }}
                >
                    <StyledTextField
                        id={inputId}
                        multiline
                        placeholder='Enter RE2 regex value e.g.: [xyz]'
                        value={inputValue}
                        onChange={handleRegexInputChange}
                        onKeyDown={handleRegexKeyDown}
                        size='small'
                        variant='outlined'
                        fullWidth
                        inputRef={inputRef}
                        autoFocus
                        error={!!error}
                        helperText={error}
                        aria-describedby={helpTextId}
                        data-testid='CONSTRAINT_VALUES_INPUT'
                    />
                    <HelpText id={helpTextId}>{helpText}</HelpText>
                </Box>
            </InputRow>

            <RegexTestValues matchesRegex={matchesRegex} />
        </StyledBox>
    );
};
