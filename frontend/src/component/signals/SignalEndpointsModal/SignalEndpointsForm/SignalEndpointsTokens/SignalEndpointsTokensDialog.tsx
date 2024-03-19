import { Alert, styled, Typography } from '@mui/material';
import { UserToken } from 'component/admin/apiToken/ConfirmToken/UserToken/UserToken';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { ISignalEndpoint } from 'interfaces/signal';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const StyledCodeBlock = styled('pre')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflow: 'auto',
    fontSize: theme.fontSizes.smallerBody,
}));

interface ISignalEndpointsTokensDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    token?: string;
    signalEndpoint?: ISignalEndpoint;
}

export const SignalEndpointsTokensDialog = ({
    open,
    setOpen,
    token,
    signalEndpoint,
}: ISignalEndpointsTokensDialogProps) => {
    const { uiConfig } = useUiConfig();

    return (
        <Dialogue
            open={open}
            secondaryButtonText='Close'
            onClose={(_, muiCloseReason?: string) => {
                if (!muiCloseReason) {
                    setOpen(false);
                }
            }}
            title='Signal endpoint token created'
        >
            <StyledAlert severity='info'>
                Make sure to copy your signal endpoint token now. You won't be
                able to see it again!
            </StyledAlert>
            <Typography variant='body1'>Your token:</Typography>
            <UserToken token={token || ''} />
            <ConditionallyRender
                condition={Boolean(signalEndpoint)}
                show={() => (
                    <>
                        <Typography
                            variant='body1'
                            sx={{ marginTop: 3, marginBottom: 2 }}
                        >
                            You can call your signal endpoint with the newly
                            created token like this:
                        </Typography>
                        <StyledCodeBlock>
                            {`curl --request POST '${
                                uiConfig.unleashUrl
                            }/api/signal-endpoint/${signalEndpoint!.name}' \\
    --header 'Authorization: Bearer ${token || 'YOUR_TOKEN'}' \\
    --header 'Content-Type: application/json' \\
    --data-raw '{
        "Jason": "json"
    }'`}
                        </StyledCodeBlock>
                    </>
                )}
            />
        </Dialogue>
    );
};
