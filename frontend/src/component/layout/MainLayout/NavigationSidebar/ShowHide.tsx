import { Box, IconButton, styled, Tooltip } from '@mui/material';
import type { NavigationMode } from './NavigationMode.tsx';
import type { FC } from 'react';
import HideIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import ExpandIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import SettingsIcon from '@mui/icons-material/Settings';

const ShowHideRow = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'mode',
})<{ mode: NavigationMode }>(({ theme, mode }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0, 1, 0, mode === 'mini' ? 1.5 : 2),
    cursor: 'pointer',
}));

export const ShowHide: FC<{ mode: NavigationMode; onChange: () => void }> = ({
    mode,
    onChange,
}) => {
    return (
        <ShowHideRow onClick={onChange} mode={mode}>
            {mode === 'full' && (
                <Box
                    sx={(theme) => ({
                        color: theme.palette.neutral.main,
                        fontSize: 'small',
                    })}
                >
                    Hide (⌘ + B)
                </Box>
            )}
            <IconButton
                aria-label={`${mode === 'full' ? 'Collapse' : 'Expand'} (⌘ + B)`}
            >
                {mode === 'full' ? (
                    <HideIcon color='primary' />
                ) : (
                    <Tooltip title='Expand (⌘ + B)' placement='right'>
                        <ExpandIcon
                            data-testid='expand-navigation'
                            color='primary'
                        />
                    </Tooltip>
                )}
            </IconButton>
        </ShowHideRow>
    );
};

const ShowAdminWrapper = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 1, 0, 1.5),
}));

export const ShowAdmin: FC<{ onChange: () => void }> = ({ onChange }) => {
    return (
        <ShowAdminWrapper onClick={onChange}>
            <IconButton>
                <Tooltip title='Expand admin settings' placement='right'>
                    <SettingsIcon data-testid='expand-admin-settings' />
                </Tooltip>
            </IconButton>
        </ShowAdminWrapper>
    );
};
