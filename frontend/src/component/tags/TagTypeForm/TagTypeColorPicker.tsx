import type { FC } from 'react';
import { styled, Box, useTheme } from '@mui/material';

interface ITagTypeColorPickerProps {
    selectedColor: string;
    onChange: (color: string) => void;
}

interface IColorOption {
    name: string;
    value: string;
    themePath: string;
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
        : `1px solid ${theme.palette.divider}`,
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
    const theme = useTheme();

    const getThemeColor = (path: string): string => {
        const [paletteKey, colorKey] = path.split('.');
        return theme.palette[paletteKey as keyof typeof theme.palette][
            colorKey as keyof (typeof theme.palette)[keyof typeof theme.palette]
        ];
    };

    const colorOptions: IColorOption[] = [
        { name: 'White', value: 'common.white', themePath: 'common.white' },
        { name: 'Green', value: 'success.main', themePath: 'success.main' },
        { name: 'Yellow', value: 'warning.main', themePath: 'warning.main' },
        { name: 'Red', value: 'error.main', themePath: 'error.main' },
        { name: 'Blue', value: 'info.main', themePath: 'info.main' },
        {
            name: 'Purple',
            value: 'secondary.main',
            themePath: 'secondary.main',
        },
        { name: 'Gray', value: 'neutral.main', themePath: 'neutral.main' },
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
                            $color={getThemeColor(color.themePath)}
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
