import { styled, Typography } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import type { ISignalEndpoint } from 'interfaces/signal';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';

const StyledItem = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

interface ISignalEndpointsTokensCellProps {
    signalEndpoint: ISignalEndpoint;
    value: string;
    onCreateToken?: () => void;
}

export const SignalEndpointsTokensCell = ({
    signalEndpoint: { tokens },
    value,
    onCreateToken,
}: ISignalEndpointsTokensCellProps) => {
    const { searchQuery } = useSearchHighlightContext();

    if (!tokens || tokens.length === 0) {
        if (!onCreateToken) return <TextCell>0 tokens</TextCell>;
        else return <LinkCell title='Create token' onClick={onCreateToken} />;
    }

    return (
        <TextCell>
            <TooltipLink
                tooltip={
                    <>
                        {tokens?.map(({ id, name }) => (
                            <StyledItem key={id}>
                                <Highlighter search={searchQuery}>
                                    {name}
                                </Highlighter>
                            </StyledItem>
                        ))}
                    </>
                }
                highlighted={
                    searchQuery.length > 0 &&
                    value.toLowerCase().includes(searchQuery.toLowerCase())
                }
            >
                {tokens?.length === 1 ? '1 token' : `${tokens?.length} tokens`}
            </TooltipLink>
        </TextCell>
    );
};
