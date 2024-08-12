import UIContext from 'contexts/UIContext';
import { useContext } from 'react';

interface IThemeModeProps {
    darkmode: JSX.Element;
    lightmode: JSX.Element;
}

export const ThemeMode = ({ darkmode, lightmode }: IThemeModeProps) => {
    const { themeMode } = useContext(UIContext);

    return themeMode === 'dark' ? darkmode : lightmode;
};
