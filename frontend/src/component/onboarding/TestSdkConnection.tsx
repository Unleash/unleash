import type { FC } from 'react';
import {
    Avatar,
    Box,
    IconButton,
    Link,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import { SectionHeader, StepperBox } from './SharedComponents';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { allSdks, type SdkName, type Sdk } from './sharedTypes';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';
import CopyIcon from '@mui/icons-material/FileCopy';
import { formatAssetPath } from '../../utils/formatPath';
import { Stepper } from './Stepper';
import { Badge } from '../common/Badge/Badge';
import { Markdown } from 'component/common/Markdown/Markdown';
import type { CodeComponent } from 'react-markdown/lib/ast-to-react';

const snippets: Record<SdkName, string> = {
    Android: (await import(`./snippets/android.md?raw`)).default,
    Go: (await import(`./snippets/go.md?raw`)).default,
    JavaScript: (await import(`./snippets/javascript.md?raw`)).default,
    'Node.js': (await import(`./snippets/nodejs.md?raw`)).default,
    Python: (await import(`./snippets/python.md?raw`)).default,
    Ruby: (await import(`./snippets/ruby.md?raw`)).default,
    Svelte: (await import(`./snippets/svelte.md?raw`)).default,
    Vue: (await import(`./snippets/vue.md?raw`)).default,
    Flutter: (await import(`./snippets/flutter.md?raw`)).default,
    Java: (await import(`./snippets/java.md?raw`)).default,
    '.NET': (await import(`./snippets/dotnet.md?raw`)).default,
    PHP: (await import(`./snippets/php.md?raw`)).default,
    React: (await import(`./snippets/react.md?raw`)).default,
    Rust: (await import(`./snippets/rust.md?raw`)).default,
    Swift: (await import(`./snippets/swift.md?raw`)).default,
};

const SpacedContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(5, 8, 2, 8),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledCodeBlock = styled('pre')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflow: 'auto',
    fontSize: theme.typography.body2.fontSize,
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',
    position: 'relative',
    maxHeight: theme.spacing(34),
}));

const CopyToClipboard = styled(Tooltip)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

const CopyBlock: FC<{ title: string; code: string }> = ({ title, code }) => {
    const onCopyToClipboard = (data: string) => () => {
        copy(data);
        setToastData({
            type: 'success',
            title: 'Copied to clipboard',
        });
    };
    const { setToastData } = useToast();

    return (
        <StyledCodeBlock>
            {code}
            <CopyToClipboard title={title} arrow>
                <IconButton onClick={onCopyToClipboard(code)} size='small'>
                    <CopyIcon />
                </IconButton>
            </CopyToClipboard>
        </StyledCodeBlock>
    );
};

const ChangeSdk = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    gap: theme.spacing(3),
    padding: theme.spacing(1, 2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(3),
}));

const CodeRenderer: CodeComponent = ({ inline = false, children }) => {
    if (!inline && typeof children?.[0] === 'string') {
        return <CopyBlock code={children[0]} title='Copy code' />;
    }

    return <code>{children}</code>;
};

interface ITestSdkConnectionProps {
    sdk: Sdk;
    apiKey: string;
    feature: string;
    onSdkChange: () => void;
}

export const TestSdkConnection: FC<ITestSdkConnectionProps> = ({
    sdk,
    apiKey,
    feature,
    onSdkChange,
}) => {
    const { uiConfig } = useUiConfig();

    const sdkIcon = allSdks.find((item) => item.name === sdk.name)?.icon;
    const clientApiUrl = `${uiConfig.unleashUrl}/api/`;
    const frontendApiUrl = `${uiConfig.unleashUrl}/api/frontend/`;
    const apiUrl = sdk.type === 'client' ? clientApiUrl : frontendApiUrl;

    const snippet = (snippets[sdk.name] || '')
        .replace('<YOUR_API_TOKEN>', apiKey)
        .replace('<YOUR_API_URL>', apiUrl)
        .replaceAll('<YOUR_FLAG>', feature);

    return (
        <SpacedContainer>
            <Typography variant='h2'>Connect an SDK to Unleash</Typography>
            <StepperBox>
                <Stepper active={2} steps={3} />
                <Badge color='secondary'>3/3 - Test connection</Badge>
            </StepperBox>
            <Box sx={{ mt: 2 }}>
                <ChangeSdk>
                    {sdkIcon ? (
                        <Avatar
                            variant='circular'
                            src={formatAssetPath(sdkIcon)}
                            alt={sdk.name}
                        />
                    ) : null}
                    <Link onClick={onSdkChange} component='button'>
                        Change SDK
                    </Link>
                </ChangeSdk>
                <SectionHeader>Setup the SDK</SectionHeader>
                <Markdown components={{ code: CodeRenderer }}>
                    {snippet}
                </Markdown>
            </Box>
        </SpacedContainer>
    );
};

// Use a default export for lazy-loading
export default TestSdkConnection;
