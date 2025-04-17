import Add from '@mui/icons-material/Add';
import Clear from '@mui/icons-material/Clear';
import {
    Button,
    Chip,
    type ChipProps,
    Popover,
    styled,
    TextField,
} from '@mui/material';
import {
    type FC,
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { parseParameterStrings } from 'utils/parseParameter';

const ValueListWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(1),
}));

const StyledList = styled('ul')({
    listStyle: 'none',
    padding: 0,
    display: 'contents',
});

const ValueChipBase = styled(
    forwardRef<HTMLDivElement, ChipProps>((props, ref) => (
        <Chip size='small' {...props} ref={ref} />
    )),
)(({ theme }) => ({
    transition: 'all 0.3s ease',
    outline: `1px solid #0000`,
    background: theme.palette.background.elevation1,
    ':hover, :focus-visible': {
        background: theme.palette.background.elevation1,
    },
    ':focus-visible': {
        outlineColor: theme.palette.secondary.dark,
    },
}));

const ValueChip = styled(ValueChipBase)(({ theme }) => ({
    svg: {
        fill: theme.palette.secondary.dark,
        borderRadius: '50%',
        outline: `2px solid #0000`,
        transition: 'inherit',
        ':focus-visible,:hover': {
            backgroundColor: theme.palette.table.headerHover,
            outlineColor: theme.palette.table.headerHover,
        },
    },
}));

const AddValuesButton = styled('button')(({ theme }) => ({
    color: theme.palette.primary.main,
    svg: {
        fill: theme.palette.primary.main,
        height: theme.fontSizes.smallerBody,
        width: theme.fontSizes.smallerBody,
    },
    border: 'none',
    borderRadius: theme.shape.borderRadiusExtraLarge,
    display: 'flex',
    flexFlow: 'row nowrap',
    whiteSpace: 'nowrap',
    gap: theme.spacing(0.25),
    alignItems: 'center',
    paddingInline: theme.spacing(1.5),
    height: theme.spacing(3),
    transition: 'all 0.3s ease',
    outline: `1px solid #0000`,
    background: theme.palette.background.elevation1,
    ':hover, :focus-visible': {
        background: theme.palette.background.elevation1,
        outlineColor: theme.palette.secondary.dark,
    },
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: theme.shape.borderRadiusLarge,
        border: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(2),
        width: '300px',
    },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    flexGrow: 1,
}));

const InputRow = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'start',
    width: '100%',
}));

const ErrorMessage = styled('div')(({ theme }) => ({
    color: theme.palette.error.main,
    fontSize: theme.typography.caption.fontSize,
    marginBottom: theme.spacing(1),
}));

interface AddValuesProps {
    onAddValues: (values: string[]) => void;
}

const AddValues = forwardRef<HTMLButtonElement, AddValuesProps>(
    ({ onAddValues }, ref) => {
        const [open, setOpen] = useState(false);
        const [inputValues, setInputValues] = useState('');
        const [error, setError] = useState('');
        const positioningRef = useRef<HTMLButtonElement>(null);
        useImperativeHandle(
            ref,
            () => positioningRef.current as HTMLButtonElement,
        );

        const handleAdd = () => {
            const newValues = parseParameterStrings(inputValues);

            if (newValues.length === 0) {
                setError('Values cannot be empty');
                return;
            }

            if (newValues.some((v) => v.length > 100)) {
                setError('Values cannot be longer than 100 characters');
                return;
            }

            onAddValues(newValues);
            setInputValues('');
            setError('');
            setOpen(false);
        };

        const handleKeyPress = (event: React.KeyboardEvent) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleAdd();
            }
        };

        return (
            <>
                <AddValuesButton
                    ref={positioningRef}
                    onClick={() => setOpen(true)}
                    type='button'
                >
                    <Add />
                    <span>Add values</span>
                </AddValuesButton>
                <StyledPopover
                    open={open}
                    disableScrollLock
                    anchorEl={positioningRef.current}
                    onClose={() => setOpen(false)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <div>
                        {error && <ErrorMessage>{error}</ErrorMessage>}
                        <InputRow>
                            <StyledTextField
                                label='Values'
                                placeholder='value1, value2, value3...'
                                value={inputValues}
                                onChange={(e) => {
                                    setInputValues(e.target.value);
                                    setError('');
                                }}
                                onKeyPress={handleKeyPress}
                                size='small'
                                fullWidth
                                autoFocus
                            />
                            <Button
                                variant='contained'
                                color='primary'
                                onClick={handleAdd}
                                disabled={!inputValues.trim()}
                            >
                                Add
                            </Button>
                        </InputRow>
                    </div>
                </StyledPopover>
            </>
        );
    },
);

type Props = {
    values: string[] | undefined;
    removeValue: (index: number) => void;
    setValues: (values: string[]) => void;
};

export const ValueList: FC<Props> = ({
    values = [],
    removeValue,
    setValues,
}) => {
    const constraintElementRefs: React.MutableRefObject<
        (HTMLDivElement | null)[]
    > = useRef([]);
    const addValuesButtonRef = useRef<HTMLButtonElement>(null);

    const nextFocusTarget = (deletedIndex: number) => {
        if (deletedIndex === values.length - 1) {
            if (deletedIndex === 0) {
                return addValuesButtonRef.current;
            } else {
                return constraintElementRefs.current[deletedIndex - 1];
            }
        } else {
            return constraintElementRefs.current[deletedIndex + 1];
        }
    };

    const handleAddValues = (newValues: string[]) => {
        const combinedValues = uniqueValues([...(values || []), ...newValues]);
        setValues(combinedValues);
    };

    return (
        <ValueListWrapper>
            <StyledList>
                {values.map((value, index) => (
                    <li key={value}>
                        <ValueChip
                            ref={(el) => {
                                constraintElementRefs.current[index] = el;
                            }}
                            deleteIcon={<Clear />}
                            label={value}
                            onDelete={() => {
                                nextFocusTarget(index)?.focus();
                                removeValue(index);
                            }}
                        />
                    </li>
                ))}
            </StyledList>
            <AddValues ref={addValuesButtonRef} onAddValues={handleAddValues} />
        </ValueListWrapper>
    );
};

const uniqueValues = <T,>(values: T[]): T[] => {
    return Array.from(new Set(values));
};
