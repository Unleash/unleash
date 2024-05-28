import { Box, IconButton, styled, Tooltip } from '@mui/material';
import type { NavigationMode } from './NavigationMode';
import type { FC } from 'react';
import HideIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import ExpandIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

const ShowHideWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'mode',
})<{ mode: NavigationMode }>(({ theme, mode }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2, 1, 0, mode === 'mini' ? 1.5 : 2),
    marginTop: 'auto',
    cursor: 'pointer',
}));

export const ShowHide: FC<{ mode: NavigationMode; onChange: () => void }> = ({
    mode,
    onChange,
}) => {
    return (
        <ShowHideWrapper onClick={onChange} mode={mode}>
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
            <IconButton>
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
        </ShowHideWrapper>
    );
};
