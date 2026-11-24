import { Alert, Button, Typography } from '@mui/material';
import { UserToken } from 'component/admin/apiToken/ConfirmToken/UserToken/UserToken';
import { copyApiTokenTracking } from 'component/common/ApiTokenTable/apiTokenTracking';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { TokenType } from 'interfaces/token';
import {
    StyledBody,
    StyledCode,
    StyledFooter,
    StyledHeader,
    StyledPanel,
    StyledSection,
} from '../CreateTokenPanel.styles.ts';

// An application name can hold characters that would end the quoted string.
const quoted = (value: string) => `'${value.replace(/[\\']/g, '\\$&')}'`;

const sdkSnippet = (unleashUrl: string, appName: string, type: string) =>
    type === TokenType.FRONTEND
        ? `import { UnleashClient } from 'unleash-proxy-client';

const unleash = new UnleashClient({
  url: '${unleashUrl}/api/frontend/',
  appName: ${quoted(appName)},
  clientKey: process.env.UNLEASH_FRONTEND_TOKEN,
});`
        : `const { initialize } = require('unleash-client');

const unleash = initialize({
  url: '${unleashUrl}/api/',
  appName: ${quoted(appName)},
  customHeaders: { Authorization: process.env.UNLEASH_API_TOKEN },
});`;

interface ITokenCreatedProps {
    appName: string;
    tokenName: string;
    type: string;
    secret: string;
    onDone: () => void;
}

export const TokenCreated = ({
    appName,
    tokenName,
    type,
    secret,
    onDone,
}: ITokenCreatedProps) => {
    const { uiConfig } = useUiConfig();
    const unleashUrl = uiConfig.unleashUrl ?? 'https://<your-unleash>';

    return (
        <StyledPanel>
            <StyledHeader>
                <Typography variant='h2'>Token created</Typography>
                <Typography color='text.secondary'>{appName}</Typography>
            </StyledHeader>
            <StyledBody>
                <Alert severity='success'>
                    <strong>{tokenName}</strong> · linked to {appName}
                </Alert>
                <StyledSection>
                    <div>
                        <Typography>Secret</Typography>
                        <UserToken
                            token={secret}
                            copyTracking={copyApiTokenTracking(
                                { type },
                                'create-panel',
                            )}
                        />
                    </div>
                    <Typography variant='body2' color='text.secondary'>
                        Copy it now. You won't be able to see it again.
                    </Typography>
                </StyledSection>
                <StyledSection>
                    <Typography>Use it in your SDK</Typography>
                    <StyledCode>
                        {sdkSnippet(unleashUrl, appName, type)}
                    </StyledCode>
                    <Typography variant='body2' color='text.secondary'>
                        Requests with this token are attributed to {appName},
                        whatever appName the SDK sends.
                    </Typography>
                </StyledSection>
            </StyledBody>
            <StyledFooter>
                <Button variant='contained' onClick={onDone}>
                    Done
                </Button>
            </StyledFooter>
        </StyledPanel>
    );
};
