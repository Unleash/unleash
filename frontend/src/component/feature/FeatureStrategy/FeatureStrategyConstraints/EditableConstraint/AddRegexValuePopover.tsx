import {
    Box,
    Button,
    ClickAwayListener,
    IconButton,
    Popover,
    styled,
    TextField,
    Typography,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Cancel from '@mui/icons-material/Cancel';
import CheckCircle from '@mui/icons-material/CheckCircle';
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
import { ToggleConstraintCaseSensitivity } from './ToggleConstraintCaseSensitivity';
import {
    ConstrainInversionIcon,
    ToggleConstraintInverted,
} from '../ToggleConstraintInverted';

const StyledPopover = styled(Popover)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: theme.shape.borderRadiusLarge,
        border: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(2),
        maxWidth: '80%',
        minWidth: '500px',
    },

    '&.MuiPopover-root': {
        pointerEvents: 'none',
    },

    '& .MuiPopover-paper': {
        pointerEvents: 'all',
    },
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
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    flexGrow: 1,
    display: 'flex',
    width: '100%',
}));

const InputRow = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'start',
    width: '100%',
}));

const StyledMatchIcon = styled(CheckCircle)(({ theme }) => ({
    color: theme.palette.success.main,
}));

const StyledNoMatchIcon = styled(Cancel)(({ theme }) => ({
    color: theme.palette.error.main,
}));

const MatchIndicator: FC<{ passes: boolean; label: string }> = ({
    passes,
    label,
}) => (
    <HtmlTooltip title={label} arrow>
        {passes ? (
            <StyledMatchIcon aria-label={label} />
        ) : (
            <StyledNoMatchIcon aria-label={label} />
        )}
    </HtmlTooltip>
);

const ConstraintInvertedMatchIndicator: FC<{
    passes: boolean;
    label: string;
    inverted: boolean;
}> = ({ passes, label, inverted }) => (
    <HtmlTooltip title={label} arrow>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <ConstrainInversionIcon inverted={inverted} />
            {passes ? (
                <StyledMatchIcon aria-label={label} />
            ) : (
                <StyledNoMatchIcon aria-label={label} />
            )}
        </Box>
    </HtmlTooltip>
);

export type OnAddActions = {
    setError: (error: string) => void;
    clearInput: () => void;
};

type AddRegexValuePopoverProps = {
    onAdd: (newValue: string, actions: OnAddActions) => void;
    initialValue?: string;
    open: boolean;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    helpText?: ReactNode;
    caseInsensitive: boolean;
    onToggleCaseSensitivity: () => void;
    inverted: boolean;
    onToggleInverted: () => void;
};

const HelpText = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    margin: 0,
}));

const AddButton = styled(Button)(({ theme }) => ({
    minWidth: theme.spacing(4),
}));

export const AddRegexValuePopover: FC<AddRegexValuePopoverProps> = ({
    initialValue,
    onAdd,
    anchorEl,
    open,
    onClose,
    helpText,
    caseInsensitive,
    onToggleCaseSensitivity,
    inverted,
    onToggleInverted,
}) => {
    const [inputValue, setInputValue] = useState(initialValue || '');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = useId();
    const helpTextId = useId();
    const matchesRegex = useCallback(
        (testString: string) => {
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
        { id: number; testString: string; matches: boolean }[]
    >([{ id: 1, testString: '', matches: false }]);
    const regexTestInputRefs = useRef<
        Array<HTMLTextAreaElement | HTMLInputElement | null>
    >([]);
    const pendingFocusIndex = useRef<number | null>(null);
    const addTestStringButtonRef = useRef<HTMLButtonElement>(null);
    const arrowDownSelectionStart = useRef<number | null>(null);

    useEffect(() => {
        if (!open) return;
        // Reset state when opening the popover.
        // Reset button could be better, but we're not using it in other popoovers.
        setInputValue(initialValue || '');
        setError('');
    }, [open, initialValue]);

    useEffect(() => {
        setRegexTestInputs((prev) =>
            prev.map((input) => ({
                ...input,
                matches: matchesRegex(input.testString),
            })),
        );
    }, [matchesRegex]);

    const handleRegexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleEditTestString = (id: number, testString: string) => {
        setRegexTestInputs((prev) =>
            prev.map((input) =>
                input.id === id
                    ? {
                          ...input,
                          testString,
                          matches: matchesRegex(testString),
                      }
                    : input,
            ),
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
            return [...prev, { id: maxId + 1, testString: '', matches: false }];
        });
    };

    const handleAddTestStringAfter = (afterIndex: number) => {
        pendingFocusIndex.current = afterIndex + 1;
        setRegexTestInputs((prev) => {
            const maxId = prev.reduce(
                (max, input) => Math.max(max, input.id),
                0,
            );
            const newItem = { id: maxId + 1, testString: '', matches: false };
            const next = [...prev];
            next.splice(afterIndex + 1, 0, newItem);
            return next;
        });
    };
    const handleRemoveTestString = (id: number) => {
        setRegexTestInputs((prev) => prev.filter((input) => input.id !== id));
    };

    return (
        <StyledPopover
            open={open}
            onTransitionEnter={() => {
                inputRef?.current?.select();
            }}
            disableScrollLock
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            <ClickAwayListener onClickAway={onClose}>
                <div>
                    <form
                        onSubmit={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!inputValue?.trim()) {
                                setError('Value cannot be empty or whitespace');
                                return;
                            } else {
                                onAdd(inputValue, {
                                    setError,
                                    clearInput: () => setInputValue(''),
                                });
                            }
                        }}
                    >
                        <InputRow>
                            <ToggleConstraintInverted
                                inverted={inverted}
                                onToggleInverted={onToggleInverted}
                            />
                            <ToggleConstraintCaseSensitivity
                                caseInsensitive={caseInsensitive}
                                onToggleCaseSensitivity={
                                    onToggleCaseSensitivity
                                }
                            />
                            <ScreenReaderOnly>
                                <label htmlFor={inputId}>
                                    Constraint Value
                                </label>
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
                                    placeholder='Enter RE2 regex value'
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
                                                inputRef.current?.selectionStart ??
                                                null;
                                            return;
                                        }
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            e.currentTarget
                                                .closest('form')
                                                ?.requestSubmit();
                                        }
                                    }}
                                    onKeyUp={(e) => {
                                        if (e.key === 'ArrowDown') {
                                            const textarea = inputRef.current;
                                            const before =
                                                arrowDownSelectionStart.current;
                                            arrowDownSelectionStart.current =
                                                null;
                                            if (
                                                textarea &&
                                                before !== null &&
                                                textarea.selectionStart ===
                                                    before
                                            ) {
                                                // Cursor didn't move → already on last visual line
                                                regexTestInputRefs.current[0]?.focus();
                                            }
                                        }
                                    }}
                                    size='small'
                                    variant='standard'
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

                            <AddButton
                                variant='text'
                                type='submit'
                                size='small'
                                color='primary'
                                disabled={!inputValue?.trim()}
                                data-testid='CONSTRAINT_VALUES_ADD_BUTTON'
                            >
                                {initialValue ? 'Save' : 'Add'}
                            </AddButton>
                        </InputRow>
                    </form>

                    <StyledTestValuesBox>
                        <Typography variant='h3'>Test regex</Typography>

                        <Typography
                            id='test-strings-description'
                            variant='body2'
                        >
                            Enter context field values to check Regex matching.
                        </Typography>
                        <StyledList>
                            {regexTestInputs.map((regexInput, index) => (
                                <StyledListItem key={regexInput.id}>
                                    <StyledTextField
                                        type='text'
                                        placeholder='Enter test context field value'
                                        size='small'
                                        fullWidth
                                        value={regexInput.testString}
                                        id={`test-input-${regexInput.id}`}
                                        inputProps={{
                                            'aria-describedby':
                                                'test-strings-description',
                                        }}
                                        inputRef={(el) => {
                                            regexTestInputRefs.current[index] =
                                                el;
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
                                                    regexInput.testString.trim()
                                                ) {
                                                    handleAddTestStringAfter(
                                                        index,
                                                    );
                                                }
                                            } else if (e.key === 'ArrowUp') {
                                                e.preventDefault();
                                                if (index === 0) {
                                                    const textarea =
                                                        inputRef.current;
                                                    if (textarea) {
                                                        textarea.focus();
                                                        const len =
                                                            textarea.value
                                                                .length;
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
                                                regexInput.id,
                                                e.target.value,
                                            );
                                        }}
                                    />
                                    {regexInput.matches ? (
                                        <MatchIndicator
                                            passes
                                            label='Regex matches'
                                        />
                                    ) : (
                                        <MatchIndicator
                                            passes={false}
                                            label='Regex does not match'
                                        />
                                    )}
                                    {inverted && (
                                        <ConstraintInvertedMatchIndicator
                                            inverted={inverted}
                                            passes={!regexInput.matches}
                                            label={
                                                regexInput.matches
                                                    ? 'Exclusive constraint operator: does not match'
                                                    : 'Exclusive constraint operator: matches'
                                            }
                                        />
                                    )}
                                    <HtmlTooltip
                                        title='Remove test string'
                                        arrow
                                    >
                                        <IconButton
                                            type='button'
                                            size='small'
                                            aria-label={`Remove test string ${index}: ${regexInput.testString ?? 'empty string'}`}
                                            sx={{ ml: 'auto' }}
                                            onClick={() => {
                                                const newLength =
                                                    regexTestInputs.length - 1;
                                                pendingFocusIndex.current =
                                                    newLength === 0
                                                        ? -1
                                                        : Math.min(
                                                              index,
                                                              newLength - 1,
                                                          );
                                                handleRemoveTestString(
                                                    regexInput.id,
                                                );
                                            }}
                                        >
                                            <Delete fontSize='inherit' />
                                        </IconButton>
                                    </HtmlTooltip>
                                </StyledListItem>
                            ))}
                        </StyledList>
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
                    </StyledTestValuesBox>
                </div>
            </ClickAwayListener>
        </StyledPopover>
    );
};
