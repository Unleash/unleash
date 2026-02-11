import { Autocomplete, Button, Chip, styled } from '@mui/material';
import {
    StyledSignupDialogField,
    StyledSignupDialogLabel,
    StyledSignupDialogTextField,
    type SignupStepContent,
} from './SignupDialog';
import { useCallback, useMemo, useState } from 'react';

const StyledButtonRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    width: '100%',
}));

const splitTokens = (raw: string) =>
    raw
        .split(/[,\s]+/g)
        .map((s) => s.trim())
        .filter(Boolean);

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isTagFocused = () => {
    const el = document.activeElement as HTMLElement | null;
    return !!el?.closest?.('.MuiAutocomplete-tag');
};

export const SignupDialogInviteOthers: SignupStepContent = ({
    data,
    setData,
    onNext,
}) => {
    const [inputValue, setInputValue] = useState('');

    const setInviteEmails = useCallback(
        (inviteEmails: string[]) =>
            setData((prev) => ({ ...prev, inviteEmails })),
        [setData],
    );

    const addEmailsFromRaw = useCallback(
        (raw: string) => {
            const tokens = splitTokens(raw).filter(isEmail);
            if (tokens.length === 0) return;

            setInviteEmails(
                Array.from(new Set([...data.inviteEmails, ...tokens])),
            );
            setInputValue('');
        },
        [data.inviteEmails, setInviteEmails],
    );

    const removeLastChipIntoInput = useCallback(() => {
        if (data.inviteEmails.length === 0) return;
        const next = data.inviteEmails.slice(0, -1);
        const last = data.inviteEmails[data.inviteEmails.length - 1];
        setInviteEmails(next);
        setInputValue(last);
    }, [data.inviteEmails, setInviteEmails]);

    const isValidForm = useMemo(
        () =>
            data.inviteEmails.length > 0 &&
            data.inviteEmails.every((e) => isEmail(e.trim())),
        [data.inviteEmails],
    );

    const onLater = () => {
        setInviteEmails([]);
        onNext();
    };

    return (
        <>
            <StyledSignupDialogField>
                <StyledSignupDialogLabel>
                    Invite team members
                </StyledSignupDialogLabel>
                <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={data.inviteEmails}
                    onChange={(_, newValue, reason) => {
                        if (reason === 'removeOption' || reason === 'clear') {
                            setInviteEmails(newValue);
                        }
                    }}
                    inputValue={inputValue}
                    onInputChange={(_, newInputValue, reason) => {
                        if (reason === 'input') setInputValue(newInputValue);
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((email, index) => (
                            <Chip label={email} {...getTagProps({ index })} />
                        ))
                    }
                    renderInput={(params) => (
                        <StyledSignupDialogTextField
                            {...params}
                            placeholder='Enter email addresses'
                            helperText='Separate emails by comma'
                            onKeyDown={(e) => {
                                if (
                                    e.key === 'Enter' ||
                                    e.key === ',' ||
                                    e.key === ' '
                                ) {
                                    if (inputValue.trim() !== '') {
                                        e.preventDefault();
                                        addEmailsFromRaw(inputValue);
                                    } else if (e.key !== 'Enter') {
                                        e.preventDefault();
                                    }
                                    return;
                                }

                                if (
                                    e.key === 'Backspace' &&
                                    inputValue === ''
                                ) {
                                    if (isTagFocused()) return;
                                    e.preventDefault();
                                    removeLastChipIntoInput();
                                }
                            }}
                            onBlur={() => addEmailsFromRaw(inputValue)}
                            onPaste={(e) => {
                                const text = e.clipboardData.getData('text');
                                if (text && /[,\s]/.test(text)) {
                                    e.preventDefault();
                                    addEmailsFromRaw(text);
                                }
                            }}
                        />
                    )}
                />
            </StyledSignupDialogField>
            <StyledButtonRow>
                <Button variant='text' onClick={onLater}>
                    Later
                </Button>
                <Button
                    variant='contained'
                    onClick={onNext}
                    disabled={!isValidForm}
                >
                    Invite
                </Button>
            </StyledButtonRow>
        </>
    );
};
