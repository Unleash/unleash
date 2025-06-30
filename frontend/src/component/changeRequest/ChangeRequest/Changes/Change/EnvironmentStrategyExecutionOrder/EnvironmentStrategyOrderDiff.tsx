import { styled } from '@mui/material';
import { EventDiff } from 'component/events/EventDiff/EventDiff';
import { useUiFlag } from 'hooks/useUiFlag';
import { Fragment } from 'react';

const StyledCodeSection = styled('div')(({ theme }) => ({
    overflowX: 'auto',
    '& code': {
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        lineHeight: 1.5,
        fontSize: theme.fontSizes.smallBody,
    },
}));
type StrategyIds = { strategyIds: string[] };
interface IDiffProps {
    preData: StrategyIds;
    data: StrategyIds;
}

export const EnvironmentStrategyOrderDiff = ({ preData, data }: IDiffProps) => {
    const useNewDiff = useUiFlag('improvedJsonDiff');
    const Wrapper = useNewDiff ? Fragment : StyledCodeSection;

    return (
        <Wrapper>
            <EventDiff
                entry={{
                    preData: preData.strategyIds,
                    data: data.strategyIds,
                }}
                sort={(a, b) => a.index - b.index}
            />
        </Wrapper>
    );
};
