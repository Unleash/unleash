import { ADMIN } from 'component/providers/AccessProvider/permissions';
import React, { useState } from 'react';
import { TextField, Box } from '@mui/material';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import { useUiConfigApi } from 'hooks/api/actions/useUiConfigApi/useUiConfigApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useId } from 'hooks/useId';

interface ICorsFormProps {
    frontendApiOrigins: string[] | undefined;
}

export const CorsForm = ({ frontendApiOrigins }: ICorsFormProps) => {
    const { setFrontendSettings } = useUiConfigApi();
    const { setToastData, setToastApiError } = useToast();
    const [value, setValue] = useState(formatInputValue(frontendApiOrigins));
    const inputFieldId = useId();
    const helpTextId = useId();

    const onSubmit = async (event: React.FormEvent) => {
        try {
            const split = parseInputValue(value);
            event.preventDefault();
            await setFrontendSettings(split);
            setValue(formatInputValue(split));
            setToastData({ title: 'Settings saved', type: 'success' });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <Box sx={{ display: 'grid', gap: 1 }}>
                <label htmlFor={inputFieldId}>
                    Which origins should be allowed to call the Frontend API?
                    Add only one origin per line.
                </label>
                <TextField
                    id={inputFieldId}
                    aria-describedby={helpTextId}
                    placeholder={textareaDomainsPlaceholder}
                    value={value}
                    onChange={event => setValue(event.target.value)}
                    multiline
                    rows={12}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                        style: { fontFamily: 'monospace', fontSize: '0.8em' },
                    }}
                />
                <UpdateButton permission={ADMIN} />
            </Box>
        </form>
    );
};

export const parseInputValue = (value: string): string[] => {
    return value
        .split(/[,\n\s]+/) // Split by commas/newlines/spaces.
        .map(value => value.replace(/\/$/, '')) // Remove trailing slashes.
        .filter(Boolean); // Remove empty values from (e.g.) double newlines.
};

export const formatInputValue = (values: string[] | undefined): string => {
    return values?.join('\n') ?? '';
};

const textareaDomainsPlaceholder = [
    'https://example.com',
    'https://example.org',
].join('\n');
