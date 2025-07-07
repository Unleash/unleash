import type React from 'react';
import { StyledInput, StyledInputDescription } from '../ApiTokenForm.styles';
import type { ApiTokenFormErrorType } from '../useApiTokenForm.ts';

interface ITokenInfoProps {
    tokenName: string;
    setTokenName: React.Dispatch<React.SetStateAction<string>>;

    errors: { [key: string]: string };
    clearErrors: (error?: ApiTokenFormErrorType) => void;
}
export const TokenInfo = ({
    tokenName,
    setTokenName,
    errors,
    clearErrors,
}: ITokenInfoProps) => {
    return (
        <>
            <StyledInputDescription>
                What would you like to call this token?
            </StyledInputDescription>
            <StyledInput
                value={tokenName}
                name='tokenName'
                onChange={(e) => setTokenName(e.target.value)}
                label='Token name'
                error={errors.tokenName !== undefined}
                errorText={errors.tokenName}
                onFocus={() => clearErrors('tokenName')}
                autoFocus
            />
        </>
    );
};
