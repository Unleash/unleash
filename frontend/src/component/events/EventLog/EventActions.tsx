import { type FC, useState } from 'react';
import {
    IconButton,
    ListItemText,
    MenuItem,
    MenuList,
    Popover,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import FileDownload from '@mui/icons-material/FileDownload';
import type { EventSchema } from 'openapi';
import { json2csv } from 'json-2-csv';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const StyledActions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(1, 1.5),
}));

interface IEventActions {
    events: EventSchema[];
}

export const EventActions: FC<IEventActions> = ({ events }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { trackEvent } = usePlausibleTracker();

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const exportJson = () => {
        const jsonString = JSON.stringify(events);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const currentDate = new Date().toISOString().split('T')[0];
        const fileName = `events_${currentDate}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
        setAnchorEl(null);

        trackEvent('events-exported', {
            props: {
                eventType: 'json',
            },
        });
    };

    const exportCsv = () => {
        const csvContent = json2csv(events);
        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);

        const currentDate = new Date().toISOString().split('T')[0];
        const fileName = `data_${currentDate}.csv`;

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
        setAnchorEl(null);

        trackEvent('events-exported', {
            props: {
                eventType: 'csv',
            },
        });
    };

    return (
        <StyledActions
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <Tooltip title={'Export'} arrow describeChild>
                <div>
                    <IconButton
                        aria-label={'Export'}
                        aria-haspopup='true'
                        aria-expanded={open}
                        onClick={handleClick}
                        type='button'
                    >
                        <FileDownload />
                    </IconButton>
                </div>
            </Tooltip>
            <StyledPopover
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                disableScrollLock={true}
            >
                <MenuList>
                    <MenuItem onClick={exportCsv}>
                        <ListItemText>
                            <Typography variant='body2'>
                                Export as CSV
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                    <MenuItem onClick={exportJson}>
                        <ListItemText>
                            <Typography variant='body2'>
                                Export as JSON
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                </MenuList>
            </StyledPopover>
        </StyledActions>
    );
};
