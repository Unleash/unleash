import { MenuItem } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { basePath } from 'utils/formatPath';
import { asSxArray } from 'utils/asSxArray';

export const LogOutMenuItem = ({ sx }: { sx: SxProps<Theme> }) => (
    <form method='POST' action={`${basePath}/logout`}>
        <MenuItem
            component='button'
            type='submit'
            sx={[...asSxArray(sx), { width: '100%' }]}
        >
            Log out
        </MenuItem>
    </form>
);
