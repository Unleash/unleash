import { Grid, styled, Paper, useMediaQuery, useTheme } from '@mui/material';
import { useUiFlag } from 'hooks/useUiFlag';
import type { ReactNode } from 'react';
import { Sticky } from 'component/common/Sticky/Sticky';
import { AdminMenuNavigation } from './AdminNavigationItems';

const MainLayoutContent = styled(Grid)(({ theme }) => ({
    minWidth: 0, // this is a fix for overflowing flex
    maxWidth: '1512px',
    margin: '0 auto',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up(1856)]: {
        width: '100%',
    },
    [theme.breakpoints.down(1856)]: {
        marginLeft: theme.spacing(7),
        marginRight: theme.spacing(7),
    },
    [theme.breakpoints.down('lg')]: {
        maxWidth: '1250px',
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
    minHeight: '94vh',
}));

const AdminMainLayoutContent = styled(Grid)(({ theme }) => ({
    minWidth: 0, // this is a fix for overflowing flex
    maxWidth: '1512px',
    margin: '0 auto',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up(1856)]: {
        width: '100%',
    },
    [theme.breakpoints.down(1856)]: {
        marginLeft: 0,
        marginRight: 0,
    },
    [theme.breakpoints.down('lg')]: {
        maxWidth: '1250px',
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
    minHeight: '94vh',
}));

const StyledAdminMainGrid = styled(Grid)(({ theme }) => ({
    minWidth: 0, // this is a fix for overflowing flex
    maxWidth: '1812px',
    margin: '0 auto',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up(2156)]: {
        width: '100%',
    },
    [theme.breakpoints.down(2156)]: {
        marginLeft: 0,
        marginRight: 0,
    },
    [theme.breakpoints.down('lg')]: {
        maxWidth: '1550px',
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
    minHeight: '94vh',
}));

const StyledMenuPaper = styled(Paper)(({ theme }) => ({
    width: '100%',
    minWidth: 320,
    padding: theme.spacing(3),
    marginTop: theme.spacing(6.5),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    boxShadow: 'none',
}));

const StickyContainer = styled(Sticky)(({ theme }) => ({
    position: 'sticky',
    top: 0,
    zIndex: theme.zIndex.sticky,
    background: theme.palette.background.application,
    transition: 'padding 0.3s ease',
}));

interface IWrapIfAdminSubpageProps {
    children: ReactNode;
}

export const WrapIfAdminSubpage = ({ children }: IWrapIfAdminSubpageProps) => {
    const newAdminUIEnabled = useUiFlag('adminNavUI');
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const showAdminMenu =
        !isSmallScreen &&
        newAdminUIEnabled &&
        location.pathname.indexOf('/admin') === 0;

    if (showAdminMenu) {
        return (
            <AdminMenu>
                <AdminMainLayoutContent>{children}</AdminMainLayoutContent>
            </AdminMenu>
        );
    }

    return <MainLayoutContent>{children}</MainLayoutContent>;
};

interface IAdminMenuProps {
    children: ReactNode;
}

export const AdminMenu = ({ children }: IAdminMenuProps) => {
    const theme = useTheme();
    const isBreakpoint = useMediaQuery(theme.breakpoints.down(1350));
    const onClick = () => {
        scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <StyledAdminMainGrid container spacing={1}>
            <Grid item>
                <StickyContainer>
                    <StyledMenuPaper>
                        <AdminMenuNavigation onClick={onClick} />
                    </StyledMenuPaper>
                </StickyContainer>
            </Grid>
            <Grid item md={isBreakpoint ? true : 9}>
                {children}
            </Grid>
        </StyledAdminMainGrid>
    );
};
