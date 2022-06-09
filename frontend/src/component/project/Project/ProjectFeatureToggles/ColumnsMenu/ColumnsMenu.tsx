import { useEffect, useState, VFC } from 'react';
import {
    Box,
    Checkbox,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    MenuList,
    Popover,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import ColumnIcon from '@mui/icons-material/ViewWeek';
import CloseIcon from '@mui/icons-material/Close';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './ColumnsMenu.styles';

interface IColumnsMenuProps {
    allColumns: {
        Header?: string | any;
        id: string;
        isVisible: boolean;
        toggleHidden: (state: boolean) => void;
    }[];
    staticColumns?: string[];
    dividerBefore?: string[];
    dividerAfter?: string[];
    isCustomized?: boolean;
    setHiddenColumns: (
        hiddenColumns:
            | string[]
            | ((previousHiddenColumns: string[]) => string[])
    ) => void;
}

export const ColumnsMenu: VFC<IColumnsMenuProps> = ({
    allColumns,
    staticColumns = [],
    dividerBefore = [],
    dividerAfter = [],
    isCustomized = false,
    setHiddenColumns,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { classes } = useStyles();
    const theme = useTheme();
    const isTinyScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));

    useEffect(() => {
        if (isCustomized) {
            return;
        }

        const setVisibleColumns = (
            columns: string[],
            environmentsToShow: number = 0
        ) => {
            const visibleEnvColumns = allColumns
                .filter(({ id }) => id.startsWith('environments.') !== false)
                .map(({ id }) => id)
                .slice(0, environmentsToShow);
            const hiddenColumns = allColumns
                .map(({ id }) => id)
                .filter(id => !columns.includes(id))
                .filter(id => !staticColumns.includes(id))
                .filter(id => !visibleEnvColumns.includes(id));
            setHiddenColumns(hiddenColumns);
        };

        if (isTinyScreen) {
            return setVisibleColumns(['createdAt']);
        }
        if (isSmallScreen) {
            return setVisibleColumns(['createdAt'], 1);
        }
        if (isMediumScreen) {
            return setVisibleColumns(['type', 'createdAt'], 1);
        }
        setVisibleColumns(['lastSeenAt', 'type', 'createdAt'], 3);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTinyScreen, isSmallScreen, isMediumScreen]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const isOpen = Boolean(anchorEl);
    const id = `columns-menu`;
    const menuId = `columns-menu-list-${id}`;

    return (
        <Box className={classes.container}>
            <Tooltip title="Select columns" arrow describeChild>
                <IconButton
                    id={id}
                    aria-controls={isOpen ? menuId : undefined}
                    aria-haspopup="true"
                    aria-expanded={isOpen ? 'true' : undefined}
                    onClick={handleClick}
                    type="button"
                    size="large"
                    className={classes.button}
                    data-loading
                >
                    <ColumnIcon />
                </IconButton>
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
                    className: classes.menuContainer,
                }}
            >
                <Box className={classes.menuHeader}>
                    <Typography variant="body2">
                        <strong>Columns</strong>
                    </Typography>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <MenuList>
                    {allColumns.map(column => [
                        <ConditionallyRender
                            condition={dividerBefore.includes(column.id)}
                            show={<Divider className={classes.divider} />}
                        />,
                        <MenuItem
                            onClick={() =>
                                column.toggleHidden(column.isVisible)
                            }
                            disabled={staticColumns.includes(column.id)}
                            className={classes.menuItem}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={column.isVisible}
                                    disableRipple
                                    inputProps={{
                                        'aria-labelledby': column.id,
                                    }}
                                    size="medium"
                                    className={classes.checkbox}
                                />
                            </ListItemIcon>
                            <ListItemText
                                id={column.id}
                                primary={
                                    <Typography variant="body2">
                                        <ConditionallyRender
                                            condition={Boolean(
                                                typeof column.Header ===
                                                    'string' && column.Header
                                            )}
                                            show={() => <>{column.Header}</>}
                                            elseShow={() => column.id}
                                        />
                                    </Typography>
                                }
                            />
                        </MenuItem>,
                        <ConditionallyRender
                            condition={dividerAfter.includes(column.id)}
                            show={<Divider className={classes.divider} />}
                        />,
                    ])}
                </MenuList>
            </Popover>
        </Box>
    );
};
