import { Link, styled, Typography } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { IOverride } from 'interfaces/featureToggle';

const StyledItem = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledLink = styled(Link, {
    shouldForwardProp: prop => prop !== 'highlighted',
})<{ highlighted?: boolean }>(({ theme, highlighted }) => ({
    backgroundColor: highlighted ? theme.palette.highlight : 'transparent',
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
            <HtmlTooltip
                title={
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
            >
                <StyledLink
                    underline="always"
                    highlighted={
                        searchQuery.length > 0 &&
                        overrides
                            ?.map(overrideToString)
                            .join('\n')
                            .includes(searchQuery)
                    }
                >
                    {overrides.length === 1
                        ? '1 override'
                        : `${overrides.length} overrides`}
                </StyledLink>
            </HtmlTooltip>
        </TextCell>
    );
};
