import { styled, Tab } from '@mui/material';
import { FavoriteIconButton } from 'component/common/FavoriteIconButton/FavoriteIconButton';

export const StyledDiv = styled('div')(() => ({
    display: 'flex',
}));

export const StyledTopRow = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
}));

export const StyledColumn = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

export const StyledName = styled('span')(({ theme }) => ({
    fontSize: theme.typography.h1.fontSize,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

export const StyledTitle = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: 'normal',
}));

export const StyledText = styled(StyledTitle)(({ theme }) => ({
    color: theme.palette.neutral.dark,
}));

export const StyledFavoriteIconButton = styled(FavoriteIconButton)(
    ({ theme }) => ({
        marginLeft: theme.spacing(-1.5),
    })
);

export const StyledHeader = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    marginBottom: theme.spacing(2),
}));

export const StyledInnerContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(2.5, 5),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
}));

export const StyledProjectTitle = styled('span')(({ theme }) => ({
    margin: 0,
    width: '100%',
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

export const StyledSeparator = styled('div')(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.palette.divider,
    height: '1px',
}));

export const StyledTabContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 4),
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    fontSize: theme.fontSizes.bodySize,
    flexGrow: 1,
    flexBasis: 0,
    [theme.breakpoints.down('md')]: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
    [theme.breakpoints.up('md')]: {
        minWidth: 160,
    },
}));
