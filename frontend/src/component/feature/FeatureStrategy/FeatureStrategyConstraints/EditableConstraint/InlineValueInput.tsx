import {
    alpha,
    ButtonBase,
    InputAdornment,
    Popover,
    type InputBaseComponentProps,
    styled,
    TextField,
    type Theme,
} from '@mui/material';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import { type FC, type KeyboardEvent, useId, useState } from 'react';

export type OnAddActions = {
    setError: (error: string) => void;
    clearInput: () => void;
};

type Props = {
    value: string;
    onChange: (value: string) => void;
    onAdd: (newValue: string, actions: OnAddActions) => void;
    onClose: () => void;
    helpText?: string;
    htmlInputProps?: InputBaseComponentProps;
    ValuePreview?: FC<{ value: string }>;
    multiValue?: boolean;
};

const Container = styled('div')({
    display: 'flex',
});

const inputSx = (theme: Theme) => ({
    width: 150,
    '& fieldset': {
        borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
        borderWidth: '1.5px',
        borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused': {
        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
});

const AddAdornmentButton = styled(ButtonBase)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.body2.fontSize,
    borderRadius: theme.shape.borderRadiusSmall,
    '&.Mui-disabled': {
        color: theme.palette.text.disabled,
    },
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
    '& > .MuiPaper-root': {
        borderRadius: `${theme.shape.borderRadiusLarge}px`,
        border: `1px solid ${theme.palette.divider}`,
        width: theme.spacing(40),
        marginTop: theme.spacing(1),
    },
    '&.MuiPopover-root': {
        pointerEvents: 'none',
    },
    '& > .MuiPopover-paper': {
        pointerEvents: 'all',
    },
}));

const PopoverBody = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 2),
}));

const HelpText = styled('p')(({ theme }) => ({
    margin: 0,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

const ErrorText = styled('p')(({ theme }) => ({
    margin: 0,
    color: theme.palette.error.main,
    fontSize: theme.typography.body2.fontSize,
}));

const Footer = styled('div')(({ theme }) => ({
    padding: theme.spacing(1, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

export const InlineValueInput: FC<Props> = ({
    value,
    onChange,
    onAdd,
    onClose,
    helpText,
    htmlInputProps,
    ValuePreview,
    multiValue,
}) => {
    const [error, setError] = useState('');
    const [announcement, setAnnouncement] = useState('');
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const inputId = useId();
    const descriptionId = useId();
    const footerId = useId();

    const submit = () => {
        if (!value?.trim()) {
            setError('Value cannot be empty or whitespace');
            return;
        }
        onAdd(value, {
            setError,
            clearInput: () => {
                onChange('');
                setAnnouncement(`"${value}" added`);
            },
        });
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submit();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <Container
            ref={setAnchorEl}
            onBlur={(e) => {
                if (!anchorEl?.contains(e.relatedTarget as Node | null)) {
                    onClose();
                }
            }}
        >
            <ScreenReaderOnly>
                <label htmlFor={inputId}>Constraint Value</label>
            </ScreenReaderOnly>
            <ScreenReaderOnly aria-live='polite'>
                {announcement}
            </ScreenReaderOnly>
            <TextField
                id={inputId}
                placeholder='Enter value'
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setError('');
                }}
                onKeyDown={onKeyDown}
                size='medium'
                variant='outlined'
                autoFocus
                error={Boolean(error)}
                slotProps={{
                    htmlInput: {
                        ...htmlInputProps,
                        'aria-describedby': `${descriptionId} ${footerId}`,
                    },
                    input: {
                        sx: inputSx,
                        endAdornment: (
                            <InputAdornment position='end'>
                                <AddAdornmentButton
                                    disabled={!value?.trim()}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={submit}
                                    data-testid='CONSTRAINT_VALUES_ADD_BUTTON'
                                >
                                    Add
                                </AddAdornmentButton>
                            </InputAdornment>
                        ),
                    },
                }}
                data-testid='CONSTRAINT_VALUES_INPUT'
            />
            <StyledPopover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                disableAutoFocus
                disableEnforceFocus
                disableRestoreFocus
                hideBackdrop
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <PopoverBody id={descriptionId}>
                    {error ? <ErrorText role='alert'>{error}</ErrorText> : null}
                    {helpText && !error ? (
                        <HelpText>{helpText}</HelpText>
                    ) : null}
                    {ValuePreview ? <ValuePreview value={value} /> : null}
                </PopoverBody>
                <Footer id={footerId}>
                    Enter to add
                    {multiValue ? ' · comma for many' : ''}
                </Footer>
            </StyledPopover>
        </Container>
    );
};
