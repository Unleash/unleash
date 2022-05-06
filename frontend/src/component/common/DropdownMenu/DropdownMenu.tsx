import {
    CSSProperties,
    MouseEventHandler,
    ReactNode,
    useState,
    VFC,
} from 'react';
import { Menu } from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';
import { DropdownButton } from './DropdownButton/DropdownButton';

export interface IDropdownMenuProps {
    renderOptions: () => ReactNode;
    id: string;
    title?: string;
    callback?: MouseEventHandler;
    icon?: ReactNode;
    label: string;
    startIcon?: ReactNode;
    style?: CSSProperties;
}

const DropdownMenu: VFC<IDropdownMenuProps> = ({
    renderOptions,
    id,
    title,
    callback,
    icon = <ArrowDropDown titleAccess="Toggle" />,
    label,
    style,
    startIcon,
    ...rest
}) => {
    const [anchor, setAnchor] = useState<Element | null>(null);

    const handleOpen: MouseEventHandler<HTMLButtonElement> = e => {
        setAnchor(e.currentTarget);
    };

    const handleClose: MouseEventHandler<HTMLDivElement> = e => {
        if (callback && typeof callback === 'function') {
            callback(e);
        }

        setAnchor(null);
    };

    return (
        <>
            <DropdownButton
                id={id}
                label={label}
                title={title}
                startIcon={startIcon}
                onClick={handleOpen}
                style={style}
                aria-controls={id}
                aria-expanded={Boolean(anchor)}
                icon={icon}
                {...rest}
            />
            <Menu
                id={id}
                onClick={handleClose}
                anchorEl={anchor}
                open={Boolean(anchor)}
            >
                {renderOptions()}
            </Menu>
        </>
    );
};

export default DropdownMenu;
