import type { FC } from 'react';
import { ButtonBase, styled } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useIsAppleDevice } from 'hooks/useIsAppleDevice';

const StyledSearchButton = styled(ButtonBase)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing(0.75),
    height: 30,
    width: '100%',
    padding: theme.spacing(0, 1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.elevation1,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    '& svg': { fontSize: theme.spacing(2.25) },
    '&:hover': { borderColor: theme.palette.text.disabled },
}));

const StyledHotkey = styled('kbd')(({ theme }) => ({
    marginLeft: 'auto',
    fontFamily: 'inherit',
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.disabled,
}));

export const SearchButton: FC = () => {
    const isAppleDevice = useIsAppleDevice();

    return (
        <StyledSearchButton>
            <SearchIcon />
            Search
            <StyledHotkey>{isAppleDevice ? '⌘+K' : 'Ctrl+K'}</StyledHotkey>
        </StyledSearchButton>
    );
};
