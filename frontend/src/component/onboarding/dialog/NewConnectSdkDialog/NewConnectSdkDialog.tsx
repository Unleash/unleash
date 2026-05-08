import { Box, Dialog, DialogContent, IconButton, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Truncator } from 'component/common/Truncator/Truncator.tsx';
import { NewConnectSdkDialogAside } from './NewConnectSdkDialogAside';

interface IConnectSDKDialogProps {
    open: boolean;
    onClose: () => void;
    onFinish: (sdkName: string) => void;
    project: string;
    environments: string[];
    feature?: string;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: theme.spacing(170),
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.sidebar,
    },
}));

const StyledDialogHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexShrink: 0,
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledDialogHeaderMain = styled(Box)(({ theme }) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.paper,
    paddingRight: theme.spacing(1.5),
    '& .closeButton': {
        display: 'none',
        [theme.breakpoints.down('md')]: {
            display: 'flex',
        },
    },
}));

const StyledDialogHeaderTitle = styled('h2')(({ theme }) => ({
    padding: theme.spacing(1.5, 3),
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.spacing(2.75),
}));

const StyledDialogHeaderAside = styled(Box)(({ theme }) => ({
    width: theme.spacing(40),
    flexShrink: 0,
    backgroundColor: theme.palette.background.sidebar,
    color: theme.palette.primary.contrastText,
    '& svg': {
        color: theme.palette.primary.contrastText,
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'end',
    paddingRight: theme.spacing(1.5),
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

const StyledDialogBody = styled(Box)({
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
});

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    backgroundColor: theme.palette.background.paper,
}));

const StyledDialogAside = styled('aside')(({ theme }) => ({
    width: theme.spacing(40),
    flexShrink: 0,
    backgroundColor: theme.palette.background.sidebar,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

const DialogHeader = ({ onClose }: Pick<IConnectSDKDialogProps, 'onClose'>) => {
    const CloseButton = () => (
        <IconButton size='small' className='closeButton' onClick={onClose}>
            <CloseIcon />
        </IconButton>
    );

    return (
        <StyledDialogHeader>
            <StyledDialogHeaderMain>
                <StyledDialogHeaderTitle>
                    <Truncator>Connect SDK</Truncator>
                </StyledDialogHeaderTitle>
                <CloseButton />
            </StyledDialogHeaderMain>
            <StyledDialogHeaderAside>
                <CloseButton />
            </StyledDialogHeaderAside>
        </StyledDialogHeader>
    );
};

const InnerDialog = ({ onClose }: Omit<IConnectSDKDialogProps, 'open'>) => {
    // TODO: Implement
    return (
        <StyledDialog open onClose={onClose}>
            <DialogHeader onClose={onClose} />
            <StyledDialogBody>
                <StyledDialogContent>Main content</StyledDialogContent>
                <StyledDialogAside>
                    <NewConnectSdkDialogAside />
                </StyledDialogAside>
            </StyledDialogBody>
        </StyledDialog>
    );
};

export const ConnectSdkDialog = ({
    open,
    ...props
}: IConnectSDKDialogProps) => {
    if (!open) return null;
    return <InnerDialog {...props} />;
};
