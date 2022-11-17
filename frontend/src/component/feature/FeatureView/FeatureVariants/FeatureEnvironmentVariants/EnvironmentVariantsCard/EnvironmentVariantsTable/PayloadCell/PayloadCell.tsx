import { Link, styled, Typography } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { IPayload } from 'interfaces/featureToggle';

const StyledItem = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    whiteSpace: 'pre-wrap',
}));

const StyledLink = styled(Link, {
    shouldForwardProp: prop => prop !== 'highlighted',
})<{ highlighted?: boolean }>(({ theme, highlighted }) => ({
    backgroundColor: highlighted ? theme.palette.highlight : 'transparent',
}));

interface IPayloadCellProps {
    value?: IPayload;
}

export const PayloadCell = ({ value: payload }: IPayloadCellProps) => {
    const { searchQuery } = useSearchHighlightContext();

    if (!payload) return <TextCell />;

    if (payload.type === 'string' && payload.value.length < 20) {
        return (
            <TextCell>
                <Highlighter search={searchQuery}>{payload.value}</Highlighter>
            </TextCell>
        );
    }

    return (
        <TextCell>
            <HtmlTooltip
                title={
                    <>
                        <StyledItem>
                            <Highlighter search={searchQuery}>
                                {payload.value}
                            </Highlighter>
                        </StyledItem>
                    </>
                }
            >
                <StyledLink
                    underline="always"
                    highlighted={
                        searchQuery.length > 0 &&
                        payload.value.includes(searchQuery)
                    }
                >
                    {payload.type}
                </StyledLink>
            </HtmlTooltip>
        </TextCell>
    );
};
