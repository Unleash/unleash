import type { FC } from 'react';
import { styled, Typography, Box, useTheme } from '@mui/material';

interface IColorPickerProps {
    selectedColor: string;
    onChange: (color: string) => void;
}

interface IColorOption {
    name: string;
    value: string;
}

const StyledColorContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
}));

const StyledColorsWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
}));

const StyledColorCircle = styled('button')<{
    $color: string;
    $selected: boolean;
}>(({ theme, $color, $selected }) => ({
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: $selected
        ? `2px solid ${theme.palette.primary.main}`
        : $color === '#FFFFFF'
          ? `1px solid ${theme.palette.divider}`
          : `1px solid ${$color}`,
    backgroundColor: $color,
    cursor: 'pointer',
    padding: 0,
    '&:hover': {
        boxShadow: theme.boxShadows.elevated,
    },
}));

export const ColorPicker: FC<IColorPickerProps> = ({
    selectedColor,
    onChange,
}) => {
    const theme = useTheme();

    // Define fallback colors in case theme properties are undefined
    const getColorWithFallback = (color: string | undefined): string =>
        color || '#FFFFFF';

    // Use the requested colors from the material UI theme
    const colorOptions: IColorOption[] = [
        { name: 'Common white', value: theme.palette.common.white },
        {
            name: 'Success border',
            value: getColorWithFallback(theme.palette.success.border),
        },
        {
            name: 'Warning border',
            value: getColorWithFallback(theme.palette.warning.border),
        },
        { name: 'Error main', value: theme.palette.error.main },
        {
            name: 'Info border',
            value: getColorWithFallback(theme.palette.info.border),
        },
        {
            name: 'Secondary border',
            value: getColorWithFallback(theme.palette.secondary.border),
        },
        {
            name: 'Neutral border',
            value: getColorWithFallback(theme.palette.neutral.border),
        },
    ];

    return (
        <StyledColorContainer>
            <StyledColorsWrapper>
                {colorOptions.map((color) => (
                    <Box
                        key={color.value}
                        title={color.name}
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <StyledColorCircle
                            $color={color.value}
                            $selected={selectedColor === color.value}
                            onClick={() => onChange(color.value)}
                            type='button'
                            aria-label={`Select ${color.name} color`}
                        />
                    </Box>
                ))}
            </StyledColorsWrapper>
        </StyledColorContainer>
    );
};
