import { VFC } from 'react';
import { Link, styled, Typography } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { IServiceAccount } from 'interfaces/service-account';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';

const StyledItem = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledLink = styled(Link, {
    shouldForwardProp: prop => prop !== 'highlighted',
})<{ highlighted?: boolean }>(({ theme, highlighted }) => ({
    backgroundColor: highlighted ? theme.palette.highlight : 'transparent',
}));

interface IServiceAccountTokensCellProps {
    serviceAccount: IServiceAccount;
    value: string;
    onCreateToken: () => void;
}

export const ServiceAccountTokensCell: VFC<IServiceAccountTokensCellProps> = ({
    serviceAccount,
    value,
    onCreateToken,
}) => {
    const { searchQuery } = useSearchHighlightContext();

    if (!serviceAccount.tokens || serviceAccount.tokens.length === 0)
        return <LinkCell title="Create token" onClick={onCreateToken} />;

    return (
        <TextCell>
            <HtmlTooltip
                title={
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
            >
                <StyledLink
                    underline="always"
                    highlighted={
                        searchQuery.length > 0 &&
                        value.toLowerCase().includes(searchQuery.toLowerCase())
                    }
                >
                    {serviceAccount.tokens?.length === 1
                        ? '1 token'
                        : `${serviceAccount.tokens?.length} tokens`}
                </StyledLink>
            </HtmlTooltip>
        </TextCell>
    );
};
