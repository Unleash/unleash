import { Alert, styled } from '@mui/material';
import type { FC } from 'react';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    '& code': {
        fontWeight: theme.fontWeight.bold,
    },
}));
export const VariantInfoAlert: FC<{ mode: 'feature' | 'strategy' }> = ({
    mode,
}) => {
    return (
        <StyledAlert severity='info'>
            Variant allows you to return a variant object if the{' '}
            {mode === 'feature'
                ? 'feature flag is considered enabled '
                : 'this strategy is active '}
            for the current request. When using variants you should use the{' '}
            <code>getVariant()</code> method in the Client SDK.
        </StyledAlert>
    );
};
