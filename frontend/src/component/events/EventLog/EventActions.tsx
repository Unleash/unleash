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
import { useTracking } from 'hooks/useTracking';
import { eventLogExportedTracking } from './eventLogTracking';

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
    const trackEventLogExported = useTracking(eventLogExportedTracking);

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const exportEvents = (format: 'csv' | 'json') => {
        const currentDate = new Date().toISOString().split('T')[0];
        const { content, mime, fileName } =
            format === 'csv'
                ? {
                      content: json2csv(events),
                      mime: 'text/csv;charset=utf-8;',
                      fileName: `data_${currentDate}.csv`,
                  }
                : {
                      content: JSON.stringify(events),
                      mime: 'application/json',
                      fileName: `events_${currentDate}.json`,
                  };
        const url = URL.createObjectURL(new Blob([content], { type: mime }));

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
        setAnchorEl(null);

        trackEventLogExported('succeeded', {
            eventCount: events.length,
            format,
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
                    <MenuItem onClick={() => exportEvents('csv')}>
                        <ListItemText>
                            <Typography variant='body2'>
                                Export as CSV
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => exportEvents('json')}>
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
