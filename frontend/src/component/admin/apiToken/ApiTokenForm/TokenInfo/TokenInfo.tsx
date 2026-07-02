import type React from 'react';
import { TextField } from '@mui/material';
import { FormField } from 'component/common/FormField/FormField';
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
        <FormField
            label='Token name'
            description='What would you like to call this token?'
        >
            <TextField
                fullWidth
                value={tokenName}
                name='tokenName'
                onChange={(e) => setTokenName(e.target.value)}
                error={errors.tokenName !== undefined}
                helperText={errors.tokenName}
                onFocus={() => clearErrors('tokenName')}
                autoFocus
            />
        </FormField>
    );
};
