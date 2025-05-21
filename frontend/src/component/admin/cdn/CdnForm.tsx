import type React from 'react';
import { useState, useEffect } from 'react';
import { Box, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import { useUiConfigApi } from 'hooks/api/actions/useUiConfigApi/useUiConfigApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useId } from 'hooks/useId';
import { ADMIN } from '@server/types/permissions';
import { useApiTokens } from 'hooks/api/getters/useApiTokens/useApiTokens';

interface ICdnFormProps {
    availableTokens?: string[];
}

export const CdnForm = ({ availableTokens = [] }: ICdnFormProps) => {
    const { setCdnTokens } = useUiConfigApi();
    const { setToastData, setToastApiError } = useToast();
    const { tokens, loading } = useApiTokens();
    const [selectedTokens, setSelectedTokens] = useState<string[]>(
        availableTokens || [],
    );
    const helpTextId = useId();

    useEffect(() => {
        if (availableTokens) {
            setSelectedTokens(availableTokens);
        }
    }, [availableTokens]);

    const frontendTokens = tokens.filter(
        (token) => token.type.toLowerCase() === 'frontend',
    );

    const onSubmit = async (event: React.FormEvent) => {
        try {
            event.preventDefault();
            await setCdnTokens(selectedTokens);
            setToastData({ text: 'CDN tokens updated', type: 'success' });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const handleTokenChange =
        (secret: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
            const checked = event.target.checked;
            setSelectedTokens((prev) =>
                checked
                    ? [...prev, secret]
                    : prev.filter((token) => token !== secret),
            );
        };

    return (
        <form onSubmit={onSubmit}>
            <Box sx={{ display: 'grid', gap: 3 }}>
                <Typography variant='h3' id={helpTextId}>
                    Select tokens to make available on CDN:
                </Typography>

                {loading ? (
                    <Typography>Loading tokens...</Typography>
                ) : frontendTokens.length === 0 ? (
                    <Typography>
                        No <code>FRONTEND</code> tokens available. Create a
                        token in API access to make it available on the CDN.
                    </Typography>
                ) : (
                    <Box sx={{ display: 'grid', gap: 1 }}>
                        {frontendTokens.map((token) => (
                            <FormControlLabel
                                key={token.secret}
                                control={
                                    <Checkbox
                                        checked={selectedTokens.includes(
                                            token.secret,
                                        )}
                                        onChange={handleTokenChange(
                                            token.secret,
                                        )}
                                    />
                                }
                                label={`${token.tokenName} (${token.secret})`}
                            />
                        ))}
                    </Box>
                )}

                <UpdateButton permission={[ADMIN]} />
            </Box>
        </form>
    );
};
