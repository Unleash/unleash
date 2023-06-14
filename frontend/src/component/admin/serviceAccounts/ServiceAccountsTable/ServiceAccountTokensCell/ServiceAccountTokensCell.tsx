import { VFC } from 'react';
import { styled, Typography } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { IServiceAccount } from 'interfaces/service-account';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';

const StyledItem = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

interface IServiceAccountTokensCellProps {
    serviceAccount: IServiceAccount;
    value: string;
    onCreateToken?: () => void;
}

export const ServiceAccountTokensCell: VFC<IServiceAccountTokensCellProps> = ({
    serviceAccount,
    value,
    onCreateToken,
}) => {
    const { searchQuery } = useSearchHighlightContext();

    if (!serviceAccount.tokens || serviceAccount.tokens.length === 0) {
        if (!onCreateToken) return <TextCell>0 tokens</TextCell>;
        else return <LinkCell title="Create token" onClick={onCreateToken} />;
    }

    return (
        <TextCell>
            <TooltipLink
                tooltip={
                    <>
                        {serviceAccount.tokens?.map(({ id, description }) => (
                            <StyledItem key={id}>
                                <Highlighter search={searchQuery}>
                                    {description}
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
                {serviceAccount.tokens?.length === 1
                    ? '1 token'
                    : `${serviceAccount.tokens?.length} tokens`}
            </TooltipLink>
        </TextCell>
    );
};
