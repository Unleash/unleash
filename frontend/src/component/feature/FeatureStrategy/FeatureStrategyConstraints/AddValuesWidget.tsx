import Add from '@mui/icons-material/Add';
import { Button, Popover, styled, TextField } from '@mui/material';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import {
    forwardRef,
    useId,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { parseParameterStrings } from 'utils/parseParameter';
import { baseChipStyles } from './ValueList';

const AddValuesButton = styled('button')(({ theme }) => ({
    ...baseChipStyles(theme),
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
    padding: theme.spacing(0.5, 1.5, 0.5, 1.5),
    height: 'auto',
    cursor: 'pointer',
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: theme.shape.borderRadiusLarge,
        border: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(2),
        width: '250px',
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
    onAddValues: (newValues: string[]) => void;
}

export const AddValuesWidget = forwardRef<HTMLButtonElement, AddValuesProps>(
    ({ onAddValues }, ref) => {
        const [open, setOpen] = useState(false);
        const [inputValues, setInputValues] = useState('');
        const [error, setError] = useState('');
        const positioningRef = useRef<HTMLButtonElement>(null);
        useImperativeHandle(
            ref,
            () => positioningRef.current as HTMLButtonElement,
        );
        const inputRef = useRef<HTMLInputElement>(null);
        const inputId = useId();

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
            inputRef?.current?.focus();
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
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <form
                        onSubmit={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleAdd();
                        }}
                    >
                        {error && <ErrorMessage>{error}</ErrorMessage>}
                        <InputRow>
                            <ScreenReaderOnly>
                                <label htmlFor={inputId}>
                                    Constraint Value
                                </label>
                            </ScreenReaderOnly>
                            <StyledTextField
                                id={inputId}
                                placeholder='Enter value'
                                value={inputValues}
                                onChange={(e) => {
                                    setInputValues(e.target.value);
                                    setError('');
                                }}
                                size='small'
                                variant='standard'
                                fullWidth
                                inputRef={inputRef}
                                autoFocus
                            />
                            <Button
                                variant='text'
                                type='submit'
                                color='primary'
                                disabled={!inputValues.trim()}
                            >
                                Add
                            </Button>
                        </InputRow>
                    </form>
                </StyledPopover>
            </>
        );
    },
);
