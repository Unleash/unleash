import { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    MenuItem,
    Select,
    styled,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { Markdown } from 'component/common/Markdown/Markdown';
import {
    CodeRenderer,
    codeRenderSnippets,
} from 'component/onboarding/dialog/CodeRenderer';
import { allSdks, type SdkName } from 'component/onboarding/dialog/sharedTypes';
import { buildSdkApiUrl } from 'component/onboarding/dialog/buildSdkApiUrl';
import useFeatureMetrics from 'hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ImplementFlagInformation } from './ImplementFlagInformation.tsx';
import { buildFlagUsageSnippet } from './buildFlagUsageSnippet.ts';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: theme.spacing(135),
        width: '100%',
        backgroundColor: 'transparent',
    },
    padding: 0,
    '& .MuiPaper-root > section': {
        overflowX: 'hidden',
    },
}));

const Container = styled('section')({
    width: '100%',
    display: 'flex',
});

const Content = styled('main')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
}));

const Header = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    minHeight: theme.spacing(5),
}));

const Body = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    flex: 1,
    overflowY: 'auto',
}));

const Footer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    padding: theme.spacing(2, 3),
}));

const StatusIndicator = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StatusDot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'connected',
})<{ connected?: boolean }>(({ theme, connected }) => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: connected
        ? theme.palette.success.main
        : theme.palette.warning.main,
}));

const CodeBlockWrapper = styled('div')(({ theme }) => ({
    '& pre': {
        maxHeight: theme.spacing(45),
    },
}));

const ListeningCard = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.secondary.border}`,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
}));

const ListeningIcon = styled('div')(({ theme }) => ({
    width: 44,
    height: 44,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    gap: 3,
    '@keyframes bubble': {
        '0%, 80%, 100%': {
            transform: 'scale(0.4)',
            opacity: 0.5,
        },
        '40%': {
            transform: 'scale(1)',
            opacity: 1,
        },
    },
    '& span': {
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: theme.palette.primary.contrastText,
        animation: 'bubble 1.4s infinite ease-in-out both',
    },
    '& span:nth-of-type(1)': {
        animationDelay: '-0.32s',
    },
    '& span:nth-of-type(2)': {
        animationDelay: '-0.16s',
    },
}));

const ListeningText = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

const ListeningStatus = ({ evaluated }: { evaluated: boolean }) => (
    <ListeningCard>
        <ListeningIcon>
            {evaluated ? (
                <CheckIcon />
            ) : (
                <>
                    <span />
                    <span />
                    <span />
                </>
            )}
        </ListeningIcon>
        <ListeningText>
            <Typography variant='body2' fontWeight='bold' color='primary'>
                {evaluated
                    ? 'Got the first evaluation!'
                    : 'Listening for the first evaluation…'}
            </Typography>
            <Typography variant='caption' color='primary'>
                {evaluated
                    ? 'Your flag is wired up. Finish setup to close this dialog.'
                    : 'Render the code path above anywhere to check that we receive metric evaluations.'}
            </Typography>
        </ListeningText>
    </ListeningCard>
);

interface ImplementFlagDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    feature: string;
}

export const ImplementFlagDialog = ({
    open,
    onClose,
    projectId,
    feature,
}: ImplementFlagDialogProps) => (
    <StyledDialog open={open} onClose={onClose}>
        {open && (
            <DialogBody
                projectId={projectId}
                feature={feature}
                onClose={onClose}
            />
        )}
    </StyledDialog>
);

interface DialogBodyProps {
    projectId: string;
    feature: string;
    onClose: () => void;
}

const DialogBody = ({ projectId, feature, onClose }: DialogBodyProps) => {
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
    const [sdkName, setSdkName] = useState<SdkName>(allSdks[0].name);

    const { metrics } = useFeatureMetrics(projectId, feature, {
        refreshInterval: 1000,
    });
    const evaluated = metrics.seenApplications.length > 0;

    const { uiConfig } = useUiConfig();
    const apiUrl = buildSdkApiUrl(uiConfig.unleashUrl, sdkName);

    const wrappedSnippet = buildFlagUsageSnippet(
        codeRenderSnippets[sdkName] || '',
        feature,
        apiUrl,
    );

    return (
        <Container>
            <Content>
                <Header>
                    <Typography variant='body1' fontWeight='bold'>
                        Use the flag in your code
                    </Typography>
                </Header>
                <Body>
                    <Select
                        value={sdkName}
                        onChange={(event) =>
                            setSdkName(event.target.value as SdkName)
                        }
                        size='small'
                        sx={{ maxWidth: 240 }}
                    >
                        {allSdks.map((sdk) => (
                            <MenuItem key={sdk.name} value={sdk.name}>
                                {sdk.name}
                            </MenuItem>
                        ))}
                    </Select>

                    <Box>
                        <Typography
                            variant='body2'
                            fontWeight='bold'
                            sx={{ mb: 1 }}
                        >
                            Code example
                        </Typography>
                        <CodeBlockWrapper>
                            <Markdown components={{ code: CodeRenderer }}>
                                {wrappedSnippet}
                            </Markdown>
                        </CodeBlockWrapper>
                    </Box>

                    <Box>
                        <Typography
                            variant='body1'
                            fontWeight='bold'
                            sx={{ mb: 1 }}
                        >
                            Test flag
                        </Typography>
                        <ListeningStatus evaluated={evaluated} />
                    </Box>
                </Body>
                <Footer>
                    <StatusIndicator>
                        <StatusDot connected={evaluated} />
                        <Typography
                            variant='body2'
                            color={evaluated ? 'success.main' : 'warning.main'}
                        >
                            {evaluated
                                ? 'Connected'
                                : 'Waiting for evaluations'}
                        </Typography>
                    </StatusIndicator>
                    <Button
                        variant='contained'
                        disabled={!evaluated}
                        onClick={onClose}
                    >
                        Finish setup
                    </Button>
                </Footer>
            </Content>
            {isLargeScreen && <ImplementFlagInformation onClose={onClose} />}
        </Container>
    );
};
