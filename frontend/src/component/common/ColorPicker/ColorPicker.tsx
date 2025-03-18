import { Box, TextField, styled } from '@mui/material';
import type React from 'react';

interface IColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    error?: boolean;
    errorText?: string;
}

const StyledColorPicker = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

const ColorPreview = styled(Box)<{ color: string }>(({ theme, color }) => ({
    width: 40,
    height: 40,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: color || '#FFFFFF',
    border: `1px solid ${theme.palette.divider}`,
}));

export const ColorPicker: React.FC<IColorPickerProps> = ({
    value,
    onChange,
    error,
    errorText,
}) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        if (newValue.match(/^#[0-9A-Fa-f]{6}$/) || newValue === '') {
            onChange(newValue);
        }
    };

    return (
        <StyledColorPicker>
            <ColorPreview color={value || '#FFFFFF'} />
            <TextField
                label='Color'
                value={value}
                onChange={handleChange}
                error={error}
                helperText={errorText}
                placeholder='#FFFFFF'
                fullWidth
            />
        </StyledColorPicker>
    );
};
