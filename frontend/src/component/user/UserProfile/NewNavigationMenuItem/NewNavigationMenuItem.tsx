import type { ReactNode } from 'react';
import { ListItemIcon, MenuItem, Switch, styled } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { useNewNavigation } from 'hooks/useNewNavigation';

const StyledLabel = styled('span')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginRight: theme.spacing(2),
}));

// The menu item is the control; the switch only shows its state.
const StyledSwitch = styled(Switch)(({ theme }) => ({
    marginLeft: 'auto',
    // Let the label set the row height, and align the thumb with the
    // other items' trailing icons.
    marginBlock: theme.spacing(-0.5),
    marginRight: theme.spacing(-0.5),
    pointerEvents: 'none',
}));

export const NewNavigationMenuItem = ({
    itemSx,
    icon,
    onClose,
}: {
    itemSx: SxProps<Theme>;
    icon?: ReactNode;
    onClose: () => void;
}) => {
    const { navigation, setEnabled } = useNewNavigation();

    if (navigation === 'unavailable') {
        return null;
    }

    const enabled = navigation === 'new';

    return (
        <MenuItem
            role='menuitemcheckbox'
            aria-checked={enabled}
            onClick={() => {
                onClose();
                setEnabled(!enabled);
            }}
            sx={itemSx}
        >
            {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
            <StyledLabel>
                New navigation
                <Badge color='info'>Beta</Badge>
            </StyledLabel>
            <StyledSwitch
                checked={enabled}
                size='small'
                disableRipple
                slotProps={{
                    input: { tabIndex: -1, 'aria-hidden': true },
                }}
            />
        </MenuItem>
    );
};
