import React from 'react';
import { StyledInput, StyledInputDescription } from '../ApiTokenForm.styles';
import { ApiTokenFormErrorType } from '../useApiTokenForm';

interface ITokenInfoProps {
    username: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;

    errors: { [key: string]: string };
    clearErrors: (error?: ApiTokenFormErrorType) => void;
}
export const TokenInfo = ({
    username,
    setUsername,
    errors,
    clearErrors,
}: ITokenInfoProps) => {
    return (
        <>
            <StyledInputDescription>
                What would you like to call this token?
            </StyledInputDescription>
            <StyledInput
                value={username}
                name="username"
                onChange={e => setUsername(e.target.value)}
                label="Token name"
                error={errors.username !== undefined}
                errorText={errors.username}
                onFocus={() => clearErrors('username')}
                autoFocus
            />
        </>
    );
};
