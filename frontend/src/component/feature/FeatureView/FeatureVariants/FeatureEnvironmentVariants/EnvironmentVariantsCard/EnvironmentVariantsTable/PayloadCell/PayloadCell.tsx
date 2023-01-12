import { styled, Typography } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { IPayload } from 'interfaces/featureToggle';

const StyledItem = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    whiteSpace: 'pre-wrap',
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
            <TooltipLink
                tooltip={
                    <>
                        <StyledItem>
                            <Highlighter search={searchQuery}>
                                {payload.value}
                            </Highlighter>
                        </StyledItem>
                    </>
                }
                highlighted={
                    searchQuery.length > 0 &&
                    payload.value
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                }
            >
                {payload.type}
            </TooltipLink>
        </TextCell>
    );
};
