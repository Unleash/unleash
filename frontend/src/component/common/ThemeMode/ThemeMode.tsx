import UIContext from 'contexts/UIContext';
import { useContext } from 'react';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';

interface IThemeModeProps {
    darkmode: JSX.Element;
    lightmode: JSX.Element;
}

export const ThemeMode = ({ darkmode, lightmode }: IThemeModeProps) => {
    const { themeMode } = useContext(UIContext);

    return (
        <ConditionallyRender
            condition={themeMode === 'dark'}
            show={darkmode}
            elseShow={lightmode}
        />
    );
};
