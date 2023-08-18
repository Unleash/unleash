import { styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { IAddonProvider } from 'interfaces/addons';

const StyledBadge = styled(Badge)(({ theme }) => ({
    cursor: 'pointer',
    marginLeft: theme.spacing(1),
}));

interface IIntegrationNameCellProps {
    provider: Pick<
        IAddonProvider,
        'displayName' | 'description' | 'deprecated'
    >;
}

export const IntegrationNameCell = ({ provider }: IIntegrationNameCellProps) => (
    <HighlightCell
        value={provider.displayName}
        subtitle={provider.description}
        afterTitle={
            <ConditionallyRender
                condition={Boolean(provider.deprecated)}
                show={
                    <HtmlTooltip title={provider.deprecated} arrow>
                        <StyledBadge color="neutral">Deprecated</StyledBadge>
                    </HtmlTooltip>
                }
            />
        }
    />
);
