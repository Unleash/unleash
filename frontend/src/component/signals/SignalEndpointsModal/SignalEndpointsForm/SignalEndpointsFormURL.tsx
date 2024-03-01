import { IconButton, Tooltip, styled } from '@mui/material';
import CopyIcon from '@mui/icons-material/FileCopy';
import copy from 'copy-to-clipboard';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';

const StyledSignalEndpointUrlSection = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1.5),
    gap: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(3),
}));

const StyledSignalEndpointUrlSectionDescription = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledSignalEndpointUrl = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    backgroundColor: theme.palette.background.elevation2,
    padding: theme.spacing(0.5, 1, 0.5, 2),
    width: '100%',
    borderRadius: theme.shape.borderRadiusMedium,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    wordBreak: 'break-all',
}));

interface ISignalEndpointsFormURLProps {
    name: string;
}

export const SignalEndpointsFormURL = ({
    name,
}: ISignalEndpointsFormURLProps) => {
    const { uiConfig } = useUiConfig();
    const { setToastData } = useToast();

    const url = `${uiConfig.unleashUrl}/api/signal-endpoint/${name}`;

    const onCopyToClipboard = () => {
        copy(url);
        setToastData({
            type: 'success',
            title: 'Copied to clipboard',
        });
    };

    return (
        <StyledSignalEndpointUrlSection>
            <StyledSignalEndpointUrlSectionDescription>
                Signal endpoint URL:
            </StyledSignalEndpointUrlSectionDescription>
            <StyledSignalEndpointUrl>
                {url}
                <Tooltip title='Copy URL' arrow>
                    <IconButton onClick={onCopyToClipboard} size='large'>
                        <CopyIcon />
                    </IconButton>
                </Tooltip>
            </StyledSignalEndpointUrl>
        </StyledSignalEndpointUrlSection>
    );
};
