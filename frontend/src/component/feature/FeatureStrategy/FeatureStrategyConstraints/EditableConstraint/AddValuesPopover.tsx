import {
    Button,
    ClickAwayListener,
    type InputBaseComponentProps,
    Popover,
    styled,
    TextField,
} from '@mui/material';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import { type FC, useId, useRef, useState } from 'react';

const StyledPopover = styled(Popover)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: theme.shape.borderRadiusLarge,
        border: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(2),
        width: '250px',
    },

    '&.MuiPopover-root': {
        pointerEvents: 'none',
    },

    '& .MuiPopover-paper': {
        pointerEvents: 'all',
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

export type OnAddActions = {
    setError: (error: string) => void;
    clearInput: () => void;
};

type AddValuesProps = {
    onAdd: (newValue: string, actions: OnAddActions) => void;
    initialValue?: string;
    open: boolean;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    helpText?: string;
    inputProps?: InputBaseComponentProps;
};

const HelpText = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
}));

const AddButton = styled(Button)(({ theme }) => ({
    minWidth: theme.spacing(4),
}));

export const AddValuesPopover: FC<AddValuesProps> = ({
    initialValue,
    onAdd,
    anchorEl,
    open,
    onClose,
    helpText,
    inputProps,
}) => {
    const [inputValue, setInputValue] = useState(initialValue || '');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = useId();
    const helpTextId = useId();

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
                            error={!!error}
                            helperText={error}
                            aria-describedby={helpTextId}
                            inputProps={{
                                ...inputProps,
                            }}
                            data-testid='CONSTRAINT_VALUES_INPUT'
                        />
                        <AddButton
                            variant='text'
                            type='submit'
                            size='small'
                            color='primary'
                            disabled={!inputValue?.trim()}
                            data-testid='CONSTRAINT_VALUES_ADD_BUTTON'
                        >
                            Add
                        </AddButton>
                    </InputRow>
                    <HelpText id={helpTextId}>{helpText}</HelpText>
                </form>
            </ClickAwayListener>
        </StyledPopover>
    );
};
