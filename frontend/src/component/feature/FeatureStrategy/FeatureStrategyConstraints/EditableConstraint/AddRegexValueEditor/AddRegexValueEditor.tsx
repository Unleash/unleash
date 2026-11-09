import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    styled,
    TextField,
    Typography,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import ErrorOutline from '@mui/icons-material/ErrorOutlineOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlineOutlined';
import Delete from '@mui/icons-material/Delete';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import {
    type FC,
    type MutableRefObject,
    memo,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { RE2JS } from 're2js';

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(0, 2, 2),
}));

const StyledTestValuesBox = styled(Box)(({ theme }) => ({
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

const StyledTestInputBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    width: '100%',
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

const StyledMatchIcon = styled(CheckCircleOutline)(({ theme }) => ({
    color: theme.palette.success.main,
    fontSize: theme.fontSizes.mainHeader,
}));

const StyledNoMatchIcon = styled(ErrorOutline)(({ theme }) => ({
    color: theme.palette.warning.main,
    fontSize: theme.fontSizes.mainHeader,
}));

const MatchIndicator: FC<{ match: boolean; testString: string }> = ({
    match,
    testString,
}) => {
    const isEmptyTestString = testString === '';
    const message = match
        ? `Your regular expression matches${isEmptyTestString ? ' an empty string.' : '.'}`
        : `Your regular expression does not match${isEmptyTestString ? ' empty strings.' : '.'}`;
    return (
        <HtmlTooltip title={message} arrow>
            <InputAdornment position='end'>
                {match ? (
                    <StyledMatchIcon role='img' aria-label={message} />
                ) : (
                    <StyledNoMatchIcon role='img' aria-label={message} />
                )}
            </InputAdornment>
        </HtmlTooltip>
    );
};

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

        const preventEnterSubmit = useCallback((e: React.KeyboardEvent) => {
            if (e.key === 'Enter') e.preventDefault();
        }, []);

        return (
            <StyledListItem>
                <StyledTestInputBox>
                    <StyledTextField
                        type='text'
                        placeholder='Enter test value'
                        size='large'
                        fullWidth
                        value={input.testString}
                        id={`test-input-${input.id}`}
                        slotProps={{
                            htmlInput: {
                                'aria-describedby': 'test-strings-description',
                            },
                            input: {
                                endAdornment: (
                                    <MatchIndicator
                                        match={input.match}
                                        testString={input.testString}
                                    />
                                ),
                            },
                        }}
                        inputRef={setInputRef}
                        onChange={handleChange}
                        onKeyDown={preventEnterSubmit}
                    />
                    {totalCount > 1 && (
                        <HtmlTooltip title='Remove test string' arrow>
                            <IconButton
                                type='button'
                                size='medium'
                                aria-label={`Remove test string ${index}: ${input.testString === '' ? 'empty string' : ''}`}
                                onClick={() => onRemove(input.id)}
                            >
                                <Delete />
                            </IconButton>
                        </HtmlTooltip>
                    )}
                </StyledTestInputBox>
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
    const [pendingFocus, setPendingFocus] = useState<number | null>(null);

    useEffect(() => {
        setRegexTestInputs((prev) =>
            prev.map((input) => ({
                ...input,
                match: matchesRegex(input.testString),
            })),
        );
    }, [matchesRegex]);

    useEffect(() => {
        if (pendingFocus !== null) {
            if (pendingFocus > -1) {
                regexTestInputRefs.current[pendingFocus]?.focus();
            }
            setPendingFocus(null);
        }
    }, [pendingFocus]);

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
        setPendingFocus(regexTestInputs.length);
        setRegexTestInputs((prev) => {
            const maxId = prev.reduce(
                (max, input) => Math.max(max, input.id),
                0,
            );
            const testString = '';
            return [
                ...prev,
                { id: maxId + 1, testString, match: matchesRegex(testString) },
            ];
        });
    }, [regexTestInputs.length, matchesRegex]);

    const handleRemoveTestString = useCallback(
        (id: number) => {
            const idx = regexTestInputs.findIndex((input) => input.id === id);
            if (regexTestInputs.length <= 1) return;
            setPendingFocus(Math.min(idx, regexTestInputs.length - 2));
            setRegexTestInputs((prev) =>
                prev.filter((input) => input.id !== id),
            );
        },
        [regexTestInputs],
    );

    return (
        <StyledTestValuesBox>
            <Typography variant='h3'>Test regex</Typography>
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
                    size='medium'
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
    value: string;
    caseInsensitive: boolean;
};

export const AddRegexValueEditor: FC<AddRegexValueEditorProps> = ({
    value,
    caseInsensitive,
}) => {
    const matchesRegex = useCallback(
        (testString: string): boolean => {
            try {
                return RE2JS.compile(
                    value,
                    caseInsensitive ? RE2JS.CASE_INSENSITIVE : undefined,
                )
                    .matcher(testString)
                    .find();
            } catch (_e) {
                return false;
            }
        },
        [value, caseInsensitive],
    );

    return (
        <StyledBox>
            <RegexTestValues matchesRegex={matchesRegex} />
        </StyledBox>
    );
};
