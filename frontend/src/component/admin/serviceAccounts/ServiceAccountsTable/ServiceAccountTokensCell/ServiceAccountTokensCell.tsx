import { VFC } from 'react';
import { Link, styled, Typography } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { IServiceAccount } from 'interfaces/service-account';

const StyledItem = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledLink = styled(Link, {
    shouldForwardProp: prop => prop !== 'highlighted',
})<{ highlighted?: boolean }>(({ theme, highlighted }) => ({
    backgroundColor: highlighted ? theme.palette.highlight : 'transparent',
}));

interface IServiceAccountTokensCellProps {
    row: {
        original: IServiceAccount;
    };
    value: string;
}

export const ServiceAccountTokensCell: VFC<IServiceAccountTokensCellProps> = ({
    row,
    value,
}) => {
    const { searchQuery } = useSearchHighlightContext();

    if (!row.original.tokens || row.original.tokens.length === 0)
        return <TextCell />;

    return (
        <TextCell>
            <HtmlTooltip
                title={
                    <>
                        {row.original.tokens?.map(({ id, description }) => (
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
                    {row.original.tokens?.length === 1
                        ? '1 token'
                        : `${row.original.tokens?.length} tokens`}
                </StyledLink>
            </HtmlTooltip>
        </TextCell>
    );
};
