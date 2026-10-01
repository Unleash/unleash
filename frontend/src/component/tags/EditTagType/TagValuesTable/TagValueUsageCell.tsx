import { styled } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import type { TagValuesUsageSchemaTagValuesItem } from 'openapi';

const StyledArchivedUsage = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

// TODO - replace with pluralize util
const flags = (count: number) => (count === 1 ? 'flag' : 'flags');

export const TagValueUsageCell = ({
    usedInActiveFeatures,
    usedInArchivedFeatures,
}: TagValuesUsageSchemaTagValuesItem) => (
    <TextCell>
        <div>
            {usedInActiveFeatures} active {flags(usedInActiveFeatures)}
        </div>
        {usedInArchivedFeatures > 0 ? (
            <StyledArchivedUsage>
                {usedInArchivedFeatures} archived{' '}
                {flags(usedInArchivedFeatures)}
            </StyledArchivedUsage>
        ) : null}
    </TextCell>
);
