import type { VFC } from 'react';
import type { ProjectApplicationSchema } from 'openapi';
import { styled } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';

const StyledTag = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledList = styled('ul')(({ theme }) => ({
    padding: theme.spacing(0, 0, 0.5, 2),
    margin: theme.spacing(0),
}));

interface ISdkCellProps {
    row: {
        original: ProjectApplicationSchema;
    };
}

export const SdkCell: VFC<ISdkCellProps> = ({ row }) => {
    const { searchQuery } = useSearchHighlightContext();

    const isHighlighted =
        searchQuery.length > 0 &&
        row.original.sdks.some(
            (sdk) =>
                sdk.versions.some((version) =>
                    version.toLowerCase().includes(searchQuery.toLowerCase()),
                ) || sdk.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );

    if (!row.original.sdks || row.original.sdks.length === 0)
        return <TextCell />;

    return (
        <TextCell>
            <TooltipLink
                highlighted={searchQuery.length > 0 && isHighlighted}
                tooltip={
                    <>
                        {row.original.sdks.map((sdk) => (
                            <StyledTag key={sdk.name}>
                                <Highlighter search={searchQuery}>
                                    {sdk.name}
                                </Highlighter>
                                <StyledList>
                                    {sdk.versions.map((version) => (
                                        <li key={version}>
                                            <Highlighter search={searchQuery}>
                                                {version}
                                            </Highlighter>
                                        </li>
                                    ))}
                                </StyledList>
                            </StyledTag>
                        ))}
                    </>
                }
            >
                {row.original.sdks?.length === 1
                    ? '1 sdk'
                    : `${row.original.sdks.length} sdks`}
            </TooltipLink>
        </TextCell>
    );
};
