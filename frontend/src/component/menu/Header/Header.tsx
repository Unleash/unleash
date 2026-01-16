import { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {
    AppBar,
    Box,
    Divider,
    IconButton,
    styled,
    Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import UserProfile from 'component/user/UserProfile';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import { DrawerMenu } from './DrawerMenu/DrawerMenu.tsx';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { useThemeMode } from 'hooks/useThemeMode';
import InviteLinkButton from './InviteLink/InviteLinkButton/InviteLinkButton.tsx';
import { CommandBar } from 'component/commandBar/CommandBar';

const HeaderComponent = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.background.application,
    padding: theme.spacing(1),
    boxShadow: 'none',
    position: 'relative',
    paddingRight: theme.spacing(9),
    [theme.breakpoints.down('lg')]: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
    [theme.breakpoints.down(1024)]: {
        marginLeft: 0,
        marginRight: 0,
    },
    [theme.breakpoints.down('sm')]: {
        minWidth: '100%',
    },
    margin: '0 auto',
}));

const ContainerComponent = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    '&&&': { padding: 0 },
}));

const StyledUserContainer = styled('div')({
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
});

const StyledNav = styled('nav')({
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
});

const StyledIconButton = styled(IconButton)<{
    component?: 'a' | 'button';
    href?: string;
    target?: string;
}>(({ theme }) => ({
    borderRadius: 100,
    '&:focus-visible': {
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineColor: theme.palette.primary.main,
        borderRadius: '100%',
    },
}));

const Header = () => {
    const { onSetThemeMode, themeMode } = useThemeMode();
    const theme = useTheme();

    const mediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [openDrawer, setOpenDrawer] = useState(false);
    const toggleDrawer = () => setOpenDrawer((prev) => !prev);

    if (mediumScreen) {
        return (
            <HeaderComponent position='static'>
                <ContainerComponent>
                    <Tooltip title='Menu' arrow>
                        <IconButton
                            sx={{
                                color: (theme) => theme.palette.text.primary,
                            }}
                            onClick={toggleDrawer}
                            aria-controls='header-drawer'
                            aria-expanded={openDrawer}
                            size='large'
                        >
                            <MenuIcon />
                        </IconButton>
                    </Tooltip>
                    <DrawerMenu open={openDrawer} toggleDrawer={toggleDrawer} />
                    <StyledUserContainer>
                        {!smallScreen && <CommandBar />}
                        <UserProfile />
                    </StyledUserContainer>
                </ContainerComponent>
            </HeaderComponent>
        );
    }

    return (
        <HeaderComponent position='static'>
            <ContainerComponent>
                <StyledNav>
                    <StyledUserContainer>
                        <CommandBar />
                        <Divider
                            orientation='vertical'
                            variant='middle'
                            flexItem
                            sx={(theme) => ({
                                marginLeft: theme.spacing(1),
                                border: 'transparent',
                            })}
                        />
                        <InviteLinkButton />
                        <Tooltip
                            title={
                                themeMode === 'dark'
                                    ? 'Switch to light theme'
                                    : 'Switch to dark theme'
                            }
                            arrow
                        >
                            <StyledIconButton
                                onClick={onSetThemeMode}
                                size='large'
                            >
                                <ConditionallyRender
                                    condition={themeMode === 'dark'}
                                    show={<DarkModeOutlined />}
                                    elseShow={<LightModeOutlined />}
                                />
                            </StyledIconButton>
                        </Tooltip>
                        <Tooltip title='Documentation' arrow>
                            <StyledIconButton
                                component='a'
                                href='https://docs.getunleash.io/'
                                target='_blank'
                                rel='noopener noreferrer'
                                size='large'
                                sx={(theme) => ({
                                    marginRight: theme.spacing(1),
                                })}
                            >
                                <MenuBookIcon />
                            </StyledIconButton>
                        </Tooltip>
                        <Divider
                            orientation='vertical'
                            variant='middle'
                            flexItem
                            sx={{ ml: 1 }}
                        />
                        <UserProfile />
                    </StyledUserContainer>
                </StyledNav>
            </ContainerComponent>
        </HeaderComponent>
    );
};

export default Header;
