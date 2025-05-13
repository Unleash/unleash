import History from '@mui/icons-material/History';
import { Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { VFC } from 'react';
import { StyledCode } from './SearchInstructions/SearchInstructions.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { onEnter } from './onEnter.ts';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
}));

const StyledHistory = styled(History)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));
interface ISearchHistoryProps {
    onSuggestion: (suggestion: string) => void;
    savedQuery?: string;
}

export const SearchHistory: VFC<ISearchHistoryProps> = ({
    onSuggestion,
    savedQuery,
}) => {
    const { trackEvent } = usePlausibleTracker();
    const onSavedQuery = () => {
        onSuggestion(savedQuery || '');
        trackEvent('search-filter-suggestions', {
            props: {
                eventType: 'saved query',
            },
        });
    };

    return (
        <ConditionallyRender
            condition={Boolean(savedQuery)}
            show={
                <>
                    <StyledBox>
                        <StyledHistory />
                        <StyledCode
                            tabIndex={0}
                            onClick={onSavedQuery}
                            onKeyDown={onEnter(onSavedQuery)}
                        >
                            <span>{savedQuery}</span>
                        </StyledCode>
                    </StyledBox>
                </>
            }
        />
    );
};
