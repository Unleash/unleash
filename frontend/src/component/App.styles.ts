import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(theme => ({
    container: {
        '& ul': {
            margin: 0,
        },
    },
    primaryBreadcrumb: {
        color: 'white',
    },
    headerTitleLink: {
        color: 'white',
        textDecoration: 'none',
    },
    contentWrapper: {
        margin: '0 auto',
        flex: 1,
        width: '100%',
        backgroundColor: theme.palette.grey[300],
    },
    content: {
        width: '1250px',
        margin: '16px auto',
        [theme.breakpoints.down('lg')]: {
            width: '1024px',
        },
        [theme.breakpoints.down(1024)]: {
            width: '100%',
            marginLeft: 0,
            marginRight: 0,
        },
        [theme.breakpoints.down('sm')]: {
            minWidth: '100%',
        },
    },
    contentContainer: {
        padding: '2rem 0',
        height: '100%',
    },
    drawerTitle: {
        lineHeight: '1 !important',
        paddingTop: '16px',
        paddingBottom: '16px',
        paddingLeft: '24px !important',
        [theme.breakpoints.down(1024)]: {
            paddingTop: '12px',
            paddingBottom: '12px',
            paddingLeft: '16px !important',
        },
    },
    drawerTitleLogo: {
        paddingRight: '16px',
    },
    drawerTitleText: {
        display: 'inline-block',
        verticalAlign: 'middle',
        fontSize: theme.fontSizes.smallerBody,
    },
    navigation: {
        padding: '8px 5px 8px 0 !important',
    },
    navigationLink: {
        padding: '12px 20px !important',
        borderRadius: '0 50px 50px 0',
        textDecoration: 'none',
        [theme.breakpoints.down(1024)]: {
            padding: '12px 16px !important',
        },
    },
    navigationIcon: {
        marginRight: '16px',
    },
    iconGitHub: {
        width: '24px',
        height: '24px',
        background:
            'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJ3aWR0aDoyNHB4O2hlaWdodDoyNHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPgogICAgPHBhdGggZmlsbD0iIzc1NzU3NSIgZD0iTTEyLDJBMTAsMTAgMCAwLDAgMiwxMkMyLDE2LjQyIDQuODcsMjAuMTcgOC44NCwyMS41QzkuMzQsMjEuNTggOS41LDIxLjI3IDkuNSwyMUM5LjUsMjAuNzcgOS41LDIwLjE0IDkuNSwxOS4zMUM2LjczLDE5LjkxIDYuMTQsMTcuOTcgNi4xNCwxNy45N0M1LjY4LDE2LjgxIDUuMDMsMTYuNSA1LjAzLDE2LjVDNC4xMiwxNS44OCA1LjEsMTUuOSA1LjEsMTUuOUM2LjEsMTUuOTcgNi42MywxNi45MyA2LjYzLDE2LjkzQzcuNSwxOC40NSA4Ljk3LDE4IDkuNTQsMTcuNzZDOS42MywxNy4xMSA5Ljg5LDE2LjY3IDEwLjE3LDE2LjQyQzcuOTUsMTYuMTcgNS42MiwxNS4zMSA1LjYyLDExLjVDNS42MiwxMC4zOSA2LDkuNSA2LjY1LDguNzlDNi41NSw4LjU0IDYuMiw3LjUgNi43NSw2LjE1QzYuNzUsNi4xNSA3LjU5LDUuODggOS41LDcuMTdDMTAuMjksNi45NSAxMS4xNSw2Ljg0IDEyLDYuODRDMTIuODUsNi44NCAxMy43MSw2Ljk1IDE0LjUsNy4xN0MxNi40MSw1Ljg4IDE3LjI1LDYuMTUgMTcuMjUsNi4xNUMxNy44LDcuNSAxNy40NSw4LjU0IDE3LjM1LDguNzlDMTgsOS41IDE4LjM4LDEwLjM5IDE4LjM4LDExLjVDMTguMzgsMTUuMzIgMTYuMDQsMTYuMTYgMTMuODEsMTYuNDFDMTQuMTcsMTYuNzIgMTQuNSwxNy4zMyAxNC41LDE4LjI2QzE0LjUsMTkuNiAxNC41LDIwLjY4IDE0LjUsMjFDMTQuNSwyMS4yNyAxNC42NiwyMS41OSAxNS4xNywyMS41QzE5LjE0LDIwLjE2IDIyLDE2LjQyIDIyLDEyQTEwLDEwIDAgMCwwIDEyLDJaIiAvPgo8L3N2Zz4=)',
    },
}));
