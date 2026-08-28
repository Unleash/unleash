import { Dialog, IconButton, styled } from '@mui/material';
import type { Breakpoint } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import type { ReactNode } from 'react';

const ASIDE_WIDTH = 40; // theme.spacing units = 320px
const ASIDE_BREAKPOINT: Breakpoint = 'md';

const StyledDialog = styled(Dialog, {
    shouldForwardProp: (prop) =>
        prop !== 'dialogMaxWidth' && prop !== 'fullHeight',
})<{ dialogMaxWidth?: number; fullHeight?: boolean }>(
    ({ theme, dialogMaxWidth = 170, fullHeight }) => ({
        '& .MuiDialog-paper': {
            borderRadius: theme.shape.borderRadiusLarge,
            maxWidth: theme.spacing(dialogMaxWidth),
            width: '100%',
            ...(fullHeight && { height: '100%' }),
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.background.sidebar,
        },
    }),
);

const Header = styled('div')(({ theme }) => ({
    display: 'flex',
    flexShrink: 0,
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const HeaderMain = styled('div')(({ theme }) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.paper,
    paddingRight: theme.spacing(1.5),
    '& .closeButton': {
        [theme.breakpoints.up(ASIDE_BREAKPOINT)]: {
            display: 'none',
        },
    },
}));

const HeaderTitle = styled('h2')(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(1.5, 3),
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.spacing(2.75),
}));

const HeaderAside = styled('div')(({ theme }) => ({
    width: theme.spacing(ASIDE_WIDTH),
    flexShrink: 0,
    backgroundColor: theme.palette.background.sidebar,
    color: theme.palette.primary.contrastText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: theme.spacing(1.5),
    [theme.breakpoints.down(ASIDE_BREAKPOINT)]: {
        display: 'none',
    },
}));

const Body = styled('div')({
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
});

const Content = styled('div')(({ theme }) => ({
    flex: 1,
    overflowY: 'auto',
    backgroundColor: theme.palette.background.paper,
}));

const Aside = styled('aside')(({ theme }) => ({
    width: theme.spacing(ASIDE_WIDTH),
    flexShrink: 0,
    backgroundColor: theme.palette.background.sidebar,
    color: theme.palette.primary.contrastText,
    [theme.breakpoints.down(ASIDE_BREAKPOINT)]: {
        display: 'none',
    },
}));

interface DialogWithAsideProps {
    open: boolean;
    onClose: () => void;
    title: string;
    aside: ReactNode;
    children: ReactNode;
    maxWidth?: number;
    fullHeight?: boolean;
}

export const DialogWithAside = ({
    open,
    onClose,
    title,
    aside,
    children,
    maxWidth,
    fullHeight,
}: DialogWithAsideProps) => (
    <StyledDialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        dialogMaxWidth={maxWidth}
        fullHeight={fullHeight}
    >
        <Header>
            <HeaderMain>
                <HeaderTitle>{title}</HeaderTitle>
                <IconButton
                    size='small'
                    className='closeButton'
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            </HeaderMain>
            <HeaderAside>
                <IconButton
                    size='small'
                    onClick={onClose}
                    sx={{ color: 'inherit' }}
                >
                    <CloseIcon />
                </IconButton>
            </HeaderAside>
        </Header>
        <Body>
            <Content>{children}</Content>
            <Aside>{aside}</Aside>
        </Body>
    </StyledDialog>
);
