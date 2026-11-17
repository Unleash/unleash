import { useEffect } from 'react';
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
    border: `1px solid ${theme.palette.neutral.containerBorder}`,
    borderRadius: theme.shape.borderRadiusExtraLarge,
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    fontFamily: theme.typography.fontFamily,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.neutral.container,
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

interface ISearchDocsChatProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const SearchDocsChat = ({
    open,
    onOpenChange,
}: ISearchDocsChatProps) => {
    const theme = useTheme();
    const { trackEvent } = useEventTracker();

    // The parent controls open, so track when open changes, not in onOpenChange:
    // the widget doesn't call onOpenChange when the parent opens the chat.
    useEffect(() => {
        if (!open) return;
        trackEvent('search-docs', {
            props: {
                eventType: 'opened',
            },
        });
    }, [open, trackEvent]);

    return (
        <AskAiChat
            domain={DOCS_DOMAIN}
            lang='en'
            trigger='none'
            theme={theme.palette.mode}
            accentColor={theme.palette.primary.main}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};

export default SearchDocs;
