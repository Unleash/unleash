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
import { useUiFlag } from 'hooks/useUiFlag';
import InviteLinkButton from './InviteLink/InviteLinkButton/InviteLinkButton.tsx';
import { CommandBar } from 'component/commandBar/CommandBar';
import { HelpResources } from './HelpResources/HelpResources';
import { PendingAccessRequestsIndicator } from 'component/admin/users/AccessRequestsNotifications/PendingAccessRequestsIndicator';

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

const Header = () => {
    const { onSetThemeMode } = useThemeMode();
    const newProfileDropdown = useUiFlag('newProfileDropdown');
    const showThemeButton = !newProfileDropdown;
    const theme = useTheme();

    const mediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const [openDrawer, setOpenDrawer] = useState(false);
    const toggleDrawer = () => setOpenDrawer((prev) => !prev);
    const hideTopmenuDocumentation = useUiFlag('hideTopmenuDocumentation');

    const headerItems = (
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
            {showThemeButton && (
                <Tooltip
                    title={
                        theme.mode === 'dark'
                            ? 'Switch to light theme'
                            : 'Switch to dark theme'
                    }
                    arrow
                >
                    <IconButton onClick={onSetThemeMode} size='large'>
                        <ConditionallyRender
                            condition={theme.mode === 'dark'}
                            show={<DarkModeOutlined />}
                            elseShow={<LightModeOutlined />}
                        />
                    </IconButton>
                </Tooltip>
            )}
            {hideTopmenuDocumentation && <HelpResources />}
            {!hideTopmenuDocumentation && (
                <Tooltip title='Documentation' arrow>
                    <IconButton
                        component='a'
                        nativeButton={false}
                        href='https://docs.getunleash.io/'
                        target='_blank'
                        rel='noopener noreferrer'
                        size='large'
                        sx={(theme) => ({
                            marginRight: theme.spacing(1),
                        })}
                    >
                        <MenuBookIcon />
                    </IconButton>
                </Tooltip>
            )}
            <Divider
                orientation='vertical'
                variant='middle'
                flexItem
                sx={{ ml: 1 }}
            />
            <UserProfile />
        </StyledUserContainer>
    );

    if (mediumScreen) {
        return (
            <HeaderComponent position='static'>
                <ContainerComponent>
                    <Box
                        sx={{
                            position: 'relative',
                            display: 'inline-flex',
                        }}
                    >
                        <Tooltip title='Menu' arrow>
                            <IconButton
                                sx={{
                                    color: (theme) =>
                                        theme.palette.text.primary,
                                }}
                                onClick={toggleDrawer}
                                aria-controls='header-drawer'
                                aria-expanded={openDrawer}
                                size='large'
                            >
                                <MenuIcon />
                            </IconButton>
                        </Tooltip>
                        <Box
                            sx={(theme) => ({
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                pointerEvents: 'none',
                            })}
                        >
                            <PendingAccessRequestsIndicator
                                showTooltip={false}
                            />
                        </Box>
                    </Box>
                    <DrawerMenu open={openDrawer} toggleDrawer={toggleDrawer} />
                    {headerItems}
                </ContainerComponent>
            </HeaderComponent>
        );
    }

    return (
        <HeaderComponent position='static'>
            <ContainerComponent>
                <StyledNav>{headerItems}</StyledNav>
            </ContainerComponent>
        </HeaderComponent>
    );
};

export default Header;
