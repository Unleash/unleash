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
    type ReactNode,
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
    shouldForwardProp: (prop) => prop !== 'passes',
})<{ passes: boolean }>(({ theme, passes }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontSize: theme.fontSizes.smallBody,
    color: passes ? theme.palette.success.main : theme.palette.warning.main,
}));

const StyledMatchIcon = styled(CheckCircleOutline)(({ theme }) => ({
    color: theme.palette.success.main,
    fontSize: 'inherit',
}));

const StyledNoMatchIcon = styled(HighlightOff)(({ theme }) => ({
    color: theme.palette.warning.main,
    fontSize: 'inherit',
}));

const MatchIndicator: FC<{ passes: boolean; testString: string }> = ({
    passes,
    testString,
}) => {
    const isEmptyTestString = testString === '';
    return passes ? (
        <StyledMatchIndicatorBox passes={passes}>
            <StyledMatchIcon aria-hidden />
            Your regular expression matches
            {isEmptyTestString ? ' an empty string.' : ''}
        </StyledMatchIndicatorBox>
    ) : (
        <StyledMatchIndicatorBox passes={passes}>
            <StyledNoMatchIcon aria-hidden />
            Your regular expression does not match
            {isEmptyTestString ? ' empty strings.' : ''}
        </StyledMatchIndicatorBox>
    );
};

export type OnAddActions = {
    setError: (error: string) => void;
    clearInput: () => void;
};

const HelpText = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    margin: 0,
}));

type AddRegexValueEditorProps = {
    addValue: (newValue: string) => void;
    initialValue?: string;
    helpText?: ReactNode;
    caseInsensitive: boolean;
    setEditingOpen: (open: boolean) => void;
    validator: (value: string) => ConstraintValidatorOutput;
};

export const AddRegexValueEditor: FC<AddRegexValueEditorProps> = ({
    initialValue,
    addValue,
    helpText,
    caseInsensitive,
    validator,
    setEditingOpen,
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
    const [regexTestInputs, setRegexTestInputs] = useState<
        {
            id: number;
            testString: string;
            match: boolean;
        }[]
    >([{ id: 1, testString: '', match: false }]);
    const regexTestInputRefs = useRef<
        Array<HTMLTextAreaElement | HTMLInputElement | null>
    >([]);
    const pendingFocusIndex = useRef<number | null>(null);
    const addTestStringButtonRef = useRef<HTMLButtonElement>(null);
    const arrowDownSelectionStart = useRef<number | null>(null);

    const validateValue = (newValue) => {
        if (newValue.length > 100) {
            return `Values cannot be longer than 100 characters (current: ${newValue.length})`;
        }

        const [isValid, errorMessage] = validator(newValue);
        if (isValid) {
            return '';
        } else {
            return errorMessage;
        }
    };

    useEffect(() => {
        if (!open) return;
        // Reset state when opening the popover.
        // Reset button could be better, but we're not using it in other popoovers.
        setInputValue(initialValue || '');
        setError(validateValue(initialValue || ''));
    }, [open, initialValue]);

    const handleOnEnterInRegexInput = () => {
        if (!inputValue?.trim()) {
            setError('Value cannot be empty or whitespace');
            return;
        }
        // othewrise move to the test input
        regexTestInputRefs.current[0]?.focus();
    };

    const handleRegexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        addValue(newValue);
    };

    useEffect(() => {
        setRegexTestInputs((prev) =>
            prev.map((input) => {
                const match = matchesRegex(input.testString);
                return { ...input, match };
            }),
        );
    }, [matchesRegex]);

    const handleEditTestString = (id: number, testString: string) => {
        setRegexTestInputs((prev) =>
            prev.map((input) => {
                if (input.id !== id) return input;
                const match = matchesRegex(testString);
                return {
                    ...input,
                    testString,
                    match,
                };
            }),
        );
    };
    useEffect(() => {
        if (pendingFocusIndex.current !== null) {
            if (pendingFocusIndex.current === -1) {
                addTestStringButtonRef.current?.focus();
            } else {
                regexTestInputRefs.current[pendingFocusIndex.current]?.focus();
            }
            pendingFocusIndex.current = null;
        }
    }, [regexTestInputs]);

    const handleAddTestString = () => {
        setRegexTestInputs((prev) => {
            const maxId = prev.reduce(
                (max, input) => Math.max(max, input.id),
                0,
            );
            return [
                ...prev,
                {
                    id: maxId + 1,
                    testString: '',
                    match: false,
                },
            ];
        });
    };

    const handleAddTestStringAfter = (afterIndex: number) => {
        pendingFocusIndex.current = afterIndex + 1;
        setRegexTestInputs((prev) => {
            const maxId = prev.reduce(
                (max, input) => Math.max(max, input.id),
                0,
            );
            const newItem = {
                id: maxId + 1,
                testString: '',
                match: false,
            };
            const next = [...prev];
            next.splice(afterIndex + 1, 0, newItem);
            return next;
        });
    };
    const handleRemoveTestString = (id: number) => {
        setRegexTestInputs((prev) => prev.filter((input) => input.id !== id));
    };

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
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowUp') {
                                e.stopPropagation();
                                return;
                            }
                            if (e.key === 'ArrowDown') {
                                e.stopPropagation();
                                // Save position before the browser moves the
                                // cursor. We compare in onKeyUp: if it hasn't
                                // moved, we were on the last visual line.
                                arrowDownSelectionStart.current =
                                    inputRef.current?.selectionStart ?? null;
                                return;
                            }
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleOnEnterInRegexInput();
                            }
                        }}
                        onKeyUp={(e) => {
                            if (e.key === 'ArrowDown') {
                                const textarea = inputRef.current;
                                const before = arrowDownSelectionStart.current;
                                arrowDownSelectionStart.current = null;
                                if (
                                    textarea &&
                                    before !== null &&
                                    textarea.selectionStart === before
                                ) {
                                    // Cursor didn't move → already on last visual line
                                    regexTestInputRefs.current[0]?.focus();
                                }
                            }
                        }}
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

            <StyledTestValuesBox>
                <Typography variant='h3'>Test regex</Typography>

                <Typography id='test-strings-description' variant='body2'>
                    Enter test values to check Regex matching.
                </Typography>
                <StyledList>
                    {regexTestInputs.map((regexTestInput, index) => (
                        <StyledListItem key={regexTestInput.id}>
                            <StyledTestInputBox>
                                <StyledTextField
                                    type='text'
                                    placeholder='Enter test value'
                                    size='small'
                                    fullWidth
                                    value={regexTestInput.testString}
                                    id={`test-input-${regexTestInput.id}`}
                                    inputProps={{
                                        'aria-describedby':
                                            'test-strings-description',
                                    }}
                                    inputRef={(el) => {
                                        regexTestInputRefs.current[index] = el;
                                    }}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === 'ArrowDown' ||
                                            e.key === 'Enter'
                                        ) {
                                            e.preventDefault();
                                            if (
                                                index + 1 <
                                                regexTestInputs.length
                                            ) {
                                                regexTestInputRefs.current[
                                                    index + 1
                                                ]?.focus();
                                            } else if (
                                                regexTestInput.testString.trim()
                                            ) {
                                                handleAddTestStringAfter(index);
                                            }
                                        } else if (e.key === 'ArrowUp') {
                                            e.preventDefault();
                                            if (index === 0) {
                                                const textarea =
                                                    inputRef.current;
                                                if (textarea) {
                                                    textarea.focus();
                                                    const len =
                                                        textarea.value.length;
                                                    textarea.setSelectionRange(
                                                        len,
                                                        len,
                                                    );
                                                }
                                            } else {
                                                regexTestInputRefs.current[
                                                    index - 1
                                                ]?.focus();
                                            }
                                        }
                                    }}
                                    onChange={(e) => {
                                        handleEditTestString(
                                            regexTestInput.id,
                                            e.target.value,
                                        );
                                    }}
                                />
                                {regexTestInputs.length > 1 && (
                                    <HtmlTooltip
                                        title='Remove test string'
                                        arrow
                                    >
                                        <IconButton
                                            type='button'
                                            size='small'
                                            aria-label={`Remove test string ${index}: ${regexTestInput.testString === '' ? 'empty string' : ''}`}
                                            sx={{ ml: 'auto' }}
                                            onClick={() => {
                                                const newLength =
                                                    regexTestInputs.length - 1;
                                                if (newLength === 0) {
                                                    return;
                                                }
                                                pendingFocusIndex.current =
                                                    newLength === 0
                                                        ? -1
                                                        : Math.min(
                                                              index,
                                                              newLength - 1,
                                                          );
                                                handleRemoveTestString(
                                                    regexTestInput.id,
                                                );
                                            }}
                                        >
                                            <Delete fontSize='inherit' />
                                        </IconButton>
                                    </HtmlTooltip>
                                )}
                            </StyledTestInputBox>
                            <MatchIndicator
                                passes={regexTestInput.match}
                                testString={regexTestInput.testString}
                            />
                        </StyledListItem>
                    ))}
                </StyledList>
                <Box>
                    <Button
                        ref={addTestStringButtonRef}
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
        </StyledBox>
    );
};
