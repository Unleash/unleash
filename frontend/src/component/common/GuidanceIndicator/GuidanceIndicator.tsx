import { styled, useTheme } from '@mui/material';
import { FC } from 'react';

const StyledIndicator = styled('div')(({ style, theme }) => ({
    width: '25px',
    height: '25px',
    borderRadius: '50%',
    color: theme.palette.text.tertiaryContrast,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    ...style,
}));

interface IGuidanceIndicatorProps {
    style?: React.CSSProperties;
    type?: guidanceIndicatorType;
}

type guidanceIndicatorType = 'primary' | 'secondary';

export const GuidanceIndicator: FC<IGuidanceIndicatorProps> = ({
    style,
    children,
    type,
}) => {
    const theme = useTheme();

    const defaults = { backgroundColor: theme.palette.primary.main };
    if (type === 'secondary') {
        defaults.backgroundColor = theme.palette.tertiary.dark;
    }

    return (
        <StyledIndicator style={{ ...defaults, ...style }}>
            {children}
        </StyledIndicator>
    );
};
