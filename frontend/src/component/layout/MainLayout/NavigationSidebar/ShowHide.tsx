import { Box, IconButton, styled, Tooltip } from '@mui/material';
import type { NavigationMode } from './NavigationMode';
import type { FC } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const ShowHideWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'mode',
})<{ mode: NavigationMode }>(({ theme, mode }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: theme.spacing(2, 1, 0, mode === 'mini' ? 1.5 : 2),
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
                    <ChevronLeftIcon />
                ) : (
                    <Tooltip title='Expand (⌘ + B)' placement='right'>
                        <ChevronRightIcon data-testid='expand-navigation' />
                    </Tooltip>
                )}
            </IconButton>
        </ShowHideWrapper>
    );
};
