import { Grid, styled, Paper, useMediaQuery, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import { Sticky } from 'component/common/Sticky/Sticky';
import { AdminMenuNavigation } from './AdminNavigationItems';
import { useNewAdminMenu } from '../../../../hooks/useNewAdminMenu';

const breakpointLgMinusPadding = 1250;
const breakpointLgMinusPaddingAdmin = 1550;
const breakpointXlMinusPadding = 1512;
const breakpointXlAdmin = 1812;
const breakpointXxl = 1856;
const breakpointXxlAdmin = 2156;

const MainLayoutContent = styled(Grid)(({ theme }) => ({
    minWidth: 0, // this is a fix for overflowing flex
    maxWidth: `${breakpointXlMinusPadding}px`,
    margin: '0 auto',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up(breakpointXxl)]: {
        width: '100%',
    },
    [theme.breakpoints.down(breakpointXxl)]: {
        marginLeft: theme.spacing(7),
        marginRight: theme.spacing(7),
    },
    [theme.breakpoints.down('lg')]: {
        maxWidth: `${breakpointLgMinusPadding}px`,
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
    maxWidth: `${breakpointXlMinusPadding}px`,
    margin: '0 auto',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up(breakpointXxl)]: {
        width: '100%',
    },
    [theme.breakpoints.down(breakpointXxl)]: {
        marginLeft: 0,
        marginRight: 0,
    },
    [theme.breakpoints.down('lg')]: {
        maxWidth: `${breakpointLgMinusPadding}px`,
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
    maxWidth: `${breakpointXlAdmin}px`,
    margin: '0 auto',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up(breakpointXxlAdmin)]: {
        width: '100%',
    },
    [theme.breakpoints.down(breakpointXxlAdmin)]: {
        marginLeft: 0,
        marginRight: 0,
    },
    [theme.breakpoints.down('lg')]: {
        maxWidth: `${breakpointLgMinusPaddingAdmin}px`,
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
    const showOnlyAdminMenu = useNewAdminMenu();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const showAdminMenu = !isSmallScreen && showOnlyAdminMenu;

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
    const isBreakpoint = useMediaQuery(theme.breakpoints.down(1352));
    const breakpointedSize = isBreakpoint ? 8 : 9;
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
            <Grid item md={breakpointedSize}>
                {children}
            </Grid>
        </StyledAdminMainGrid>
    );
};
