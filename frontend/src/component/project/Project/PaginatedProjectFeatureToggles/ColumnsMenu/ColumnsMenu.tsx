import { useState, type FC } from 'react';
import {
    IconButton,
    ListItemIcon,
    ListItemText,
    MenuList,
    Popover,
    Tooltip,
    Typography,
} from '@mui/material';
import ColumnIcon from '@mui/icons-material/ViewWeek';
import CloseIcon from '@mui/icons-material/Close';
import {
    StyledBoxContainer,
    StyledBoxMenuHeader,
    StyledCheckbox,
    StyledDivider,
    StyledIconButton,
    StyledMenuItem,
} from './ColumnsMenu.styles';

interface IColumnsMenuProps {
    columns: {
        header?: string;
        id: string;
        isStatic?: boolean;
        isVisible?: boolean;
    }[];
    onToggle?: (id: string) => void;
}

export const ColumnsMenu: FC<IColumnsMenuProps> = ({ columns, onToggle }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const onIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const isOpen = Boolean(anchorEl);
    const id = `columns-menu`;
    const menuId = `columns-menu-list-${id}`;

    return (
        <StyledBoxContainer>
            <Tooltip title='Select columns' arrow describeChild>
                <StyledIconButton
                    id={id}
                    aria-controls={isOpen ? menuId : undefined}
                    aria-haspopup='true'
                    aria-expanded={isOpen ? 'true' : undefined}
                    onClick={onIconClick}
                    type='button'
                    size='large'
                    data-loading
                >
                    <ColumnIcon />
                </StyledIconButton>
            </Tooltip>

            <Popover
                id={menuId}
                open={isOpen}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                disableScrollLock={true}
                PaperProps={{
                    sx: (theme) => ({
                        borderRadius: theme.shape.borderRadius,
                        paddingBottom: theme.spacing(2),
                    }),
                }}
            >
                <StyledBoxMenuHeader>
                    <Typography variant='body2'>
                        <strong>Columns</strong>
                    </Typography>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </StyledBoxMenuHeader>
                <MenuList>
                    {columns.map((column) =>
                        column.id === 'divider' ? (
                            <StyledDivider key='divider' />
                        ) : (
                            <StyledMenuItem
                                key={column.id}
                                onClick={() => {
                                    onToggle?.(column.id);
                                }}
                                disabled={
                                    column.isStatic === true &&
                                    column.isVisible === true
                                }
                            >
                                <ListItemIcon>
                                    <StyledCheckbox
                                        edge='start'
                                        checked={column.isVisible}
                                        disableRipple
                                        inputProps={{
                                            'aria-labelledby': column.id,
                                        }}
                                        size='medium'
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    id={column.id}
                                    primary={
                                        <Typography variant='body2'>
                                            {column.header}
                                        </Typography>
                                    }
                                />
                            </StyledMenuItem>
                        ),
                    )}
                </MenuList>
            </Popover>
        </StyledBoxContainer>
    );
};
