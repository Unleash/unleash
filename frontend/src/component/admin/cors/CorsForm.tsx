import type React from 'react';
import { useState } from 'react';
import { TextField, Box } from '@mui/material';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import { useUiConfigApi } from 'hooks/api/actions/useUiConfigApi/useUiConfigApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useId } from 'hooks/useId';
import { ADMIN, UPDATE_CORS } from '@server/types/permissions';

interface ICorsFormProps {
    frontendApiOrigins: string[] | undefined;
}

export const CorsForm = ({ frontendApiOrigins }: ICorsFormProps) => {
    const { setCors } = useUiConfigApi();
    const { setToastData, setToastApiError } = useToast();
    const [value, setValue] = useState(formatInputValue(frontendApiOrigins));
    const inputFieldId = useId();
    const helpTextId = useId();

    const onSubmit = async (event: React.FormEvent) => {
        try {
            const split = parseInputValue(value);
            event.preventDefault();
            await setCors(split);
            setValue(formatInputValue(split));
            setToastData({ text: 'Settings saved', type: 'success' });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <Box sx={{ display: 'grid', gap: 1 }}>
                <label htmlFor={inputFieldId}>
                    Which origins should be allowed to call the Frontend API?
                    Add only one origin per line. The CORS specification does
                    not support wildcard for subdomains, it needs to be a fully
                    qualified domain, including the protocol.
                    <br />
                    <br />
                    If you specify "*" it will be the chosen origin.
                    <br />
                    <br />
                    Example:
                </label>

                <code style={{ fontSize: '0.7em' }}>
                    https://www.example.com
                    <br />
                    https://www.example2.com
                </code>

                <TextField
                    id={inputFieldId}
                    aria-describedby={helpTextId}
                    placeholder={textareaDomainsPlaceholder}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    multiline
                    rows={12}
                    variant='outlined'
                    fullWidth
                    InputProps={{
                        style: { fontFamily: 'monospace', fontSize: '0.8em' },
                    }}
                />
                <UpdateButton permission={[ADMIN, UPDATE_CORS]} />
            </Box>
        </form>
    );
};

export const parseInputValue = (value: string): string[] => {
    return value
        .split(/[,\n\s]+/) // Split by commas/newlines/spaces.
        .map((value) => value.replace(/\/$/, '')) // Remove trailing slashes.
        .filter(Boolean); // Remove empty values from (e.g.) double newlines.
};

export const formatInputValue = (values: string[] | undefined): string => {
    return values?.join('\n') ?? '';
};

const textareaDomainsPlaceholder = [
    'https://example.com',
    'https://example.org',
].join('\n');
