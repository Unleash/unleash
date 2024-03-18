import { useEffect, useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { SignalEndpointTokenPayload } from 'hooks/api/actions/useSignalEndpointTokensApi/useSignalEndpointTokensApi';
import type { ISignalEndpointToken } from 'interfaces/signal';
import { styled } from '@mui/material';
import Input from 'component/common/Input/Input';

const StyledForm = styled('div')(({ theme }) => ({
    minHeight: theme.spacing(12),
}));

const StyledInputSecondaryDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
}));

interface ISignalEndpointsTokensCreateDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    tokens: ISignalEndpointToken[];
    onCreateClick: (newToken: SignalEndpointTokenPayload) => void;
}

export const SignalEndpointsTokensCreateDialog = ({
    open,
    setOpen,
    tokens,
    onCreateClick,
}: ISignalEndpointsTokensCreateDialogProps) => {
    const [name, setName] = useState('');

    const [nameError, setNameError] = useState('');

    useEffect(() => {
        setName('');
        setNameError('');
    }, [open]);

    const isNameUnique = (name: string) =>
        !tokens?.some((token) => token.name === name);

    const validateName = (name: string) => {
        if (!name.length) {
            setNameError('Name is required');
        } else if (!isNameUnique(name)) {
            setNameError('Name must be unique');
        } else {
            setNameError('');
        }
    };

    const isValid = name.length && isNameUnique(name);

    return (
        <Dialogue
            open={open}
            primaryButtonText='Create token'
            secondaryButtonText='Cancel'
            onClick={() =>
                onCreateClick({
                    name,
                })
            }
            disabledPrimaryButton={!isValid}
            onClose={() => {
                setOpen(false);
            }}
            title='New token'
        >
            <StyledForm>
                <StyledInputSecondaryDescription>
                    What is your new token name?
                </StyledInputSecondaryDescription>
                <StyledInput
                    autoFocus
                    label='Token name'
                    error={Boolean(nameError)}
                    errorText={nameError}
                    value={name}
                    onChange={(e) => {
                        validateName(e.target.value);
                        setName(e.target.value);
                    }}
                    autoComplete='off'
                />
            </StyledForm>
        </Dialogue>
    );
};
