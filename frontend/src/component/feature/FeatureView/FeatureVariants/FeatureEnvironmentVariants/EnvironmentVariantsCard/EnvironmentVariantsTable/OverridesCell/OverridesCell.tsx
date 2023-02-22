import { styled, Typography } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { IOverride } from 'interfaces/featureToggle';

const StyledItem = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

interface IOverridesCellProps {
    value?: IOverride[];
}

export const OverridesCell = ({ value: overrides }: IOverridesCellProps) => {
    const { searchQuery } = useSearchHighlightContext();

    if (!overrides || overrides.length === 0) return <TextCell />;

    const overrideToString = (override: IOverride) =>
        `${override.contextName}:${override.values.join()}`;

    return (
        <TextCell>
            <TooltipLink
                tooltip={
                    <>
                        {overrides.map((override, index) => (
                            <StyledItem key={override.contextName + index}>
                                <Highlighter search={searchQuery}>
                                    {overrideToString(override)}
                                </Highlighter>
                            </StyledItem>
                        ))}
                    </>
                }
                highlighted={
                    searchQuery.length > 0 &&
                    overrides
                        ?.map(overrideToString)
                        .join('\n')
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                }
            >
                {overrides.length === 1
                    ? '1 override'
                    : `${overrides.length} overrides`}
            </TooltipLink>
        </TextCell>
    );
};
