import copy from 'copy-to-clipboard';
import { IconButton, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { ApiCommandBlock } from 'component/common/FormTemplate/ApiCommandBlock';
import useToast from 'hooks/useToast';

const StyledSidebarHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: theme.spacing(8),
    margin: theme.spacing(-4, -4, 0, -4),
    padding: theme.spacing(0, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    boxSizing: 'border-box',
    [theme.breakpoints.down(500)]: {
        margin: theme.spacing(-4, -2, 0, -2),
    },
}));

const StyledSidebarCloseButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.common.white,
}));

const StyledSidebarLinkContainer = styled('div')(({ theme }) => ({
    margin: theme.spacing(3, 0),
    display: 'flex',
    alignItems: 'center',
    width: '100%',
}));

const StyledSidebarLinkIcon = styled(MenuBookIcon)(({ theme }) => ({
    marginRight: theme.spacing(1),
    color: theme.palette.primary.contrastText,
}));

const StyledSidebarLink = styled('a')(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    display: 'block',
    '&:hover': {
        textDecoration: 'none',
    },
}));

type CreateFeatureDialogSidebarProps = {
    apiCommand: string;
    onClose: () => void;
};

export const CreateFeatureDialogSidebar = ({
    apiCommand,
    onClose,
}: CreateFeatureDialogSidebarProps) => {
    const { setToastData } = useToast();

    const copyApiCommand = () => {
        if (copy(apiCommand)) {
            setToastData({ text: 'Command copied', type: 'success' });
        } else {
            setToastData({ text: 'Could not copy the command', type: 'error' });
        }
    };

    return (
        <>
            <StyledSidebarHeader>
                <StyledSidebarCloseButton
                    onClick={onClose}
                    size='small'
                    aria-label='Close'
                >
                    <CloseIcon />
                </StyledSidebarCloseButton>
            </StyledSidebarHeader>
            <StyledSidebarLinkContainer>
                <StyledSidebarLinkIcon />
                <StyledSidebarLink
                    href='https://docs.getunleash.io/concepts/feature-flags'
                    rel='noopener noreferrer'
                    target='_blank'
                >
                    Feature flags documentation
                </StyledSidebarLink>
            </StyledSidebarLinkContainer>
            <ApiCommandBlock
                command={apiCommand}
                onCopy={copyApiCommand}
                hideDivider
            />
        </>
    );
};
