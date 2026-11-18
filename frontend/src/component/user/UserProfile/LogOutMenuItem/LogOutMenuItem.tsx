import type { ReactNode } from 'react';
import { ListItemIcon, MenuItem } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { basePath } from 'utils/formatPath';
import { asSxArray } from 'utils/asSxArray';

export const LogOutMenuItem = ({
    sx,
    icon,
}: {
    sx: SxProps<Theme>;
    icon?: ReactNode;
}) => (
    <form method='POST' action={`${basePath}/logout`}>
        <MenuItem
            component='button'
            type='submit'
            sx={[...asSxArray(sx), { width: '100%' }]}
        >
            {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
            Log out
        </MenuItem>
    </form>
);
