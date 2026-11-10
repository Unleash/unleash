import { useTheme } from '@mui/material/styles';
import type { JSX } from 'react';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender.tsx';

interface IThemeModeProps {
    darkmode: JSX.Element;
    lightmode: JSX.Element;
}

export const ThemeMode = ({ darkmode, lightmode }: IThemeModeProps) => {
    const theme = useTheme();

    return (
        <ConditionallyRender
            condition={theme.mode === 'dark'}
            show={darkmode}
            elseShow={lightmode}
        />
    );
};
