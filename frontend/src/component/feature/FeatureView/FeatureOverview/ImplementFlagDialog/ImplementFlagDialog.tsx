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
import { Markdown } from 'component/common/Markdown/Markdown';
import {
    CodeRenderer,
    codeRenderSnippets,
} from 'component/onboarding/dialog/CodeRenderer';
import {
    allSdks,
    type SdkName,
} from 'component/onboarding/dialog/sharedTypes';
import { ImplementFlagInformation } from './ImplementFlagInformation.tsx';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: theme.spacing(135),
        width: '100%',
        backgroundColor: 'transparent',
    },
}));

const Content = styled('main')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
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

const WaitingIndicator = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const WaitingDot = styled('span')(({ theme }) => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: theme.palette.warning.main,
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
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: 1,
}));

const ListeningText = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

const extractLastCodeBlock = (markdown: string) => {
    const matches = [...markdown.matchAll(/```(\w*)\n([\s\S]*?)```/g)];
    if (matches.length === 0) return null;
    const [, language, code] = matches[matches.length - 1];
    return { language, code: code.trim() };
};

interface ImplementFlagDialogProps {
    open: boolean;
    onClose: () => void;
    feature: string;
}

export const ImplementFlagDialog = ({
    open,
    onClose,
    feature,
}: ImplementFlagDialogProps) => {
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
    const [sdkName, setSdkName] = useState<SdkName>(allSdks[0].name);

    const rawSnippet = codeRenderSnippets[sdkName] || '';
    const [connectSnippet] = rawSnippet.split('---\n');
    const lastBlock = extractLastCodeBlock(connectSnippet);
    const code = (lastBlock?.code ?? '').replaceAll('<YOUR_FLAG>', feature);
    const wrappedSnippet = lastBlock
        ? `\`\`\`${lastBlock.language}\n${code}\n\`\`\``
        : '';

    return (
        <StyledDialog open={open} onClose={onClose}>
            <Box sx={{ display: 'flex' }}>
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
                            <Markdown components={{ code: CodeRenderer }}>
                                {wrappedSnippet}
                            </Markdown>
                        </Box>

                        <Box>
                            <Typography
                                variant='body1'
                                fontWeight='bold'
                                sx={{ mb: 1 }}
                            >
                                Test flag
                            </Typography>
                            <ListeningCard>
                                <ListeningIcon>...</ListeningIcon>
                                <ListeningText>
                                    <Typography
                                        variant='body2'
                                        fontWeight='bold'
                                        color='primary'
                                    >
                                        Listening for the first evaluation…
                                    </Typography>
                                    <Typography
                                        variant='caption'
                                        color='primary'
                                    >
                                        Render the code path above anywhere to
                                        check that we receive metric
                                        evaluations.
                                    </Typography>
                                </ListeningText>
                            </ListeningCard>
                        </Box>
                    </Body>
                    <Footer>
                        <WaitingIndicator>
                            <WaitingDot />
                            <Typography variant='body2' color='warning.main'>
                                Waiting for evaluations
                            </Typography>
                        </WaitingIndicator>
                        <Button variant='contained' disabled>
                            Finish setup
                        </Button>
                    </Footer>
                </Content>
                {isLargeScreen && (
                    <ImplementFlagInformation onClose={onClose} />
                )}
            </Box>
        </StyledDialog>
    );
};
