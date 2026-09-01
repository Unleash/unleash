import { styled } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { SearchModal } from '@fern-api/search-widget';
import '@fern-api/search-widget/styles';
import { useEventTracker } from 'hooks/useEventTracker';

const DOCS_DOMAIN = 'https://docs.getunleash.io';

const StyledSearchModal = styled(SearchModal)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Float the button in the bottom-right corner of the viewport.
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: theme.zIndex.fab,
    boxShadow: theme.boxShadows.popup,
    height: 40,
    // Collapsed to a 40px circle (width === height) by default; expands to fit the label on hover.
    width: 40,
    padding: 0,
    marginLeft: 0,
    border: 'none',
    borderRadius: theme.shape.borderRadiusExtraLarge,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: theme.fontSizes.smallBody,
    fontFamily: theme.typography.fontFamily,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: theme.transitions.create(['padding', 'width'], {
        duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        width: 'auto',
        padding: theme.spacing(0, 1.5),
    },
    '& svg': {
        color: theme.palette.primary.contrastText,
        fontSize: theme.fontSizes.bodySize,
        flexShrink: 0,
    },
    '&:hover .search-docs-label': {
        maxWidth: 160,
        marginLeft: theme.spacing(0.75),
        opacity: 1,
    },
}));

const StyledLabel = styled('span')(({ theme }) => ({
    display: 'inline-block',
    maxWidth: 0,
    marginLeft: 0,
    opacity: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    transition: theme.transitions.create(
        ['max-width', 'opacity', 'margin-left'],
        {
            duration: theme.transitions.duration.shorter,
        },
    ),
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
            <SearchIcon />
            <StyledLabel className='search-docs-label'>Search docs</StyledLabel>
        </StyledSearchModal>
    );
};

export default SearchDocs;
