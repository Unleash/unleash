import { styled, Typography } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { IIncomingWebhook } from 'interfaces/incomingWebhook';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';

const StyledItem = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

interface IIncomingWebhookTokensCellProps {
    incomingWebhook: IIncomingWebhook;
    value: string;
    onCreateToken?: () => void;
}

export const IncomingWebhookTokensCell = ({
    incomingWebhook,
    value,
    onCreateToken,
}: IIncomingWebhookTokensCellProps) => {
    const { searchQuery } = useSearchHighlightContext();

    if (!incomingWebhook.tokens || incomingWebhook.tokens.length === 0) {
        if (!onCreateToken) return <TextCell>0 tokens</TextCell>;
        else return <LinkCell title='Create token' onClick={onCreateToken} />;
    }

    return (
        <TextCell>
            <TooltipLink
                tooltip={
                    <>
                        {incomingWebhook.tokens?.map(({ id, name }) => (
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
                {incomingWebhook.tokens?.length === 1
                    ? '1 token'
                    : `${incomingWebhook.tokens?.length} tokens`}
            </TooltipLink>
        </TextCell>
    );
};
