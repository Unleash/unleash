import { styled, useTheme } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { AskAiChat } from '@fern-api/search-widget';
import '@fern-api/search-widget/styles';
import { useEventTracker } from 'hooks/useEventTracker';

const DOCS_DOMAIN = 'https://docs.getunleash.io';

const StyledTrigger = styled(AskAiChat.Trigger)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    // Match the height and radius of the CommandBar search box next to it.
    height: 40,
    padding: theme.spacing(0, 1.5),
    marginLeft: theme.spacing(1),
    border: `1px solid ${theme.palette.neutral.border}`,
    borderRadius: theme.shape.borderRadiusExtraLarge,
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    fontFamily: theme.typography.fontFamily,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.neutral.light,
    },
    '& svg': {
        color: theme.palette.primary.main,
        fontSize: theme.fontSizes.bodySize,
    },
}));

const SearchDocs = () => {
    const theme = useTheme();
    const { trackEvent } = useEventTracker();

    const trackOpen = (open: boolean) => {
        if (!open) return;
        trackEvent('search-docs', {
            props: {
                eventType: 'opened',
            },
        });
    };

    return (
        <AskAiChat.Root
            domain={DOCS_DOMAIN}
            lang='en'
            theme={theme.palette.mode}
            accentColor={theme.palette.primary.main}
            onOpenChange={trackOpen}
        >
            <StyledTrigger icon={<AutoAwesomeIcon />}>
                Search docs
            </StyledTrigger>
            <AskAiChat.Panel />
        </AskAiChat.Root>
    );
};

export default SearchDocs;
