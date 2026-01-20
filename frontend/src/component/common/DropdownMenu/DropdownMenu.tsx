import {
    type CSSProperties,
    type FC,
    type MouseEventHandler,
    type ReactNode,
    useState,
} from 'react';
import { Menu, type SxProps, type Theme } from '@mui/material';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import { DropdownButton } from './DropdownButton/DropdownButton.tsx';

export interface IDropdownMenuProps {
    renderOptions: () => ReactNode | ReactNode[];
    id: string;
    title?: string;
    callback?: MouseEventHandler;
    icon?: ReactNode;
    label: string;
    startIcon?: ReactNode;
    selected?: ReactNode;
    layout?: DropdownMenuLayout;
}

type DropdownMenuLayout = {
    width?: number | string;
    button?: React.CSSProperties;
    menu?: SxProps<Theme>;
};

export const DropdownMenu: FC<IDropdownMenuProps> = ({
    renderOptions,
    id,
    title,
    callback,
    icon = <ArrowDropDown titleAccess='Toggle' />,
    label,
    startIcon,
    selected,
    layout,
    ...rest
}) => {
    const [anchor, setAnchor] = useState<Element | null>(null);

    const handleOpen: MouseEventHandler<HTMLButtonElement> = (e) => {
        setAnchor(e.currentTarget);
    };

    const handleClose: MouseEventHandler<HTMLDivElement> = (e) => {
        if (callback && typeof callback === 'function') {
            callback(e);
        }

        setAnchor(null);
    };

    return (
        <>
            <DropdownButton
                id={id}
                label={selected || label}
                title={title}
                startIcon={startIcon}
                onClick={handleOpen}
                aria-controls={id}
                aria-expanded={Boolean(anchor)}
                icon={icon}
                style={{
                    width: layout?.width,
                    ...layout?.button,
                }}
                {...rest}
            />
            <Menu
                id={id}
                onClick={handleClose}
                anchorEl={anchor}
                open={Boolean(anchor)}
                sx={{
                    ...layout?.menu,
                    '& .MuiPaper-root': {
                        width: layout?.width,
                    },
                }}
            >
                {renderOptions()}
            </Menu>
        </>
    );
};
