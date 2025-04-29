import { Button, Popover, styled, TextField } from '@mui/material';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import { type FC, useId, useRef, useState } from 'react';

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

export type OnAddActions = {
    setError: (error: string) => void;
    clearInput: () => void;
};

type AddValuesProps = {
    onAdd: (newValue: string, actions: OnAddActions) => void;
    currentValue?: string;
    open: boolean;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    error?: string;
};

export const AddValuesPopover: FC<AddValuesProps> = ({
    currentValue,
    onAdd,
    anchorEl,
    open,
    onClose,
}) => {
    const [inputValue, setInputValue] = useState(currentValue);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = useId();

    return (
        <StyledPopover
            open={open}
            onTransitionEnter={() => {
                if (inputValue && !currentValue?.trim()) {
                    // if the input value is not empty and the current value is empty or whitespace ()
                    setInputValue('');
                }
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
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <InputRow>
                    <ScreenReaderOnly>
                        <label htmlFor={inputId}>Constraint Value</label>
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
    );
};
