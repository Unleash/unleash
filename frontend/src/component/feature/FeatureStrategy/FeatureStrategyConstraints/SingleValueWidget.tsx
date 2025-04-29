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
import { ValueChip } from './ValueList';

const AddValuesButton = styled(ValueChip, {
    shouldForwardProp: (prop) => prop !== 'hasValue',
})<{ hasValue: boolean }>(({ theme, hasValue }) => ({
    color: hasValue ? 'inherit' : theme.palette.primary.main,
    '.MuiChip-icon': {
        transform: 'translateX(50%)',
        fill: theme.palette.primary.main,
        height: theme.fontSizes.smallerBody,
        width: theme.fontSizes.smallerBody,
    },
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
    onAddValue: (newValue: string) => void;
    removeValue: () => void;
    currentValue?: string;
}

export const SingleValueWidget = forwardRef<HTMLDivElement, AddValuesProps>(
    ({ currentValue, onAddValue, removeValue }, ref) => {
        const [open, setOpen] = useState(false);
        const [inputValue, setInputValue] = useState(currentValue);
        const [error, setError] = useState('');
        const positioningRef = useRef<HTMLDivElement>(null);
        useImperativeHandle(
            ref,
            () => positioningRef.current as HTMLDivElement,
        );
        const inputRef = useRef<HTMLInputElement>(null);
        const inputId = useId();

        const handleAdd = () => {
            if (!inputValue) {
                setError('Values cannot be empty');
                return;
            }
            if (inputValue.length > 100) {
                setError('Values cannot be longer than 100 characters');
                return;
            }

            onAddValue(inputValue);
            setInputValue('');
            setError('');
            setOpen(false);
            // inputRef?.current?.focus();
        };

        return (
            <>
                <AddValuesButton
                    hasValue={!!currentValue}
                    ref={positioningRef}
                    label={currentValue || 'Add value'}
                    onClick={() => setOpen(true)}
                    icon={currentValue ? undefined : <Add />}
                    onDelete={currentValue ? removeValue : undefined}
                />
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
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
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
                                disabled={!inputValue?.trim()}
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
