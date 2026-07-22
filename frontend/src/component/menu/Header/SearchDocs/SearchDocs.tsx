import { styled } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { SearchModal } from '@fern-api/search-widget';
import '@fern-api/search-widget/styles';
import { useEventTracker } from 'hooks/useEventTracker';

const DOCS_DOMAIN = 'https://docs.getunleash.io';

const StyledSearchModal = styled(SearchModal)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    // Match the height and radius of the CommandBar search box next to it.
    height: 40,
    padding: theme.spacing(0, 1.5),
    marginLeft: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusExtraLarge,
    backgroundColor: theme.palette.background.paper,
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
    const { trackEvent } = useEventTracker();

    const trackOpen = () => {
        trackEvent('search-docs', {
            props: {
                eventType: 'opened',
            },
        });
    };

    return (
        <StyledSearchModal domain={DOCS_DOMAIN} lang='en' onClick={trackOpen}>
            <AutoAwesomeIcon />
            Search docs
        </StyledSearchModal>
    );
};

export default SearchDocs;
