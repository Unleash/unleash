import type { FC } from 'react';
import { styled, Box, useTheme } from '@mui/material';
import { lightTheme } from 'themes/theme';

interface ITagTypeColorPickerProps {
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

export const TagTypeColorPicker: FC<ITagTypeColorPickerProps> = ({
    selectedColor,
    onChange,
}) => {
    const _theme = useTheme();

    const getColorWithFallback = (color: string | undefined): string =>
        color || '#FFFFFF';

    const colorOptions: IColorOption[] = [
        {
            name: 'White',
            value: getColorWithFallback(lightTheme.palette.common.white),
        },
        {
            name: 'Green',
            value: getColorWithFallback(lightTheme.palette.success.border),
        },
        {
            name: 'Yellow',
            value: getColorWithFallback(lightTheme.palette.warning.border),
        },
        {
            name: 'Red',
            value: getColorWithFallback(lightTheme.palette.error.main),
        },
        {
            name: 'Blue',
            value: getColorWithFallback(lightTheme.palette.info.border),
        },
        {
            name: 'Purple',
            value: getColorWithFallback(lightTheme.palette.secondary.border),
        },
        {
            name: 'Gray',
            value: getColorWithFallback(lightTheme.palette.neutral.border),
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
