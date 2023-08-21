import { Table, TableBody, TableCell, TableRow } from 'component/common/Table';
import { useMemo, useState, useCallback } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import useToast from 'hooks/useToast';
import useAddonsApi from 'hooks/api/actions/useAddonsApi/useAddonsApi';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { formatUnknownError } from 'utils/formatUnknownError';
import { sortTypes } from 'utils/sortTypes';
import { useTable, useSortBy } from 'react-table';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { SortableTableHeader, TablePlaceholder } from 'component/common/Table';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { IntegrationIcon } from '../IntegrationIcon/IntegrationIcon';
import { IntegrationNameCell } from '../IntegrationNameCell/IntegrationNameCell';
import { StyledCardsGrid } from '../IntegrationList.styles';
import { IntegrationCard } from '../IntegrationCard/IntegrationCard';

export const ConfiguredIntegrations = () => {
    const { refetchAddons, addons, loading } = useAddons();
    const { updateAddon, removeAddon } = useAddonsApi();
    const { setToastData, setToastApiError } = useToast();
    const [showDelete, setShowDelete] = useState(false);

    const data = useMemo(() => {
        if (loading) {
            return Array(5).fill({
                name: 'Addon name',
                description: 'Addon description when loading',
            });
        }

        return addons.map(addon => ({
            ...addon,
        }));
    }, [addons, loading]);

    const counter = addons.length ? `(${addons.length})` : '';

    return (
        <PageContent
            isLoading={loading}
            header={<PageHeader title={`Configured integrations ${counter}`} />}
            sx={theme => ({ marginBottom: theme.spacing(2) })}
        >
            <StyledCardsGrid>
                {addons?.map(({ id, enabled, provider, description }) => (
                    <IntegrationCard
                        key={id}
                        id={id}
                        icon={provider}
                        title={provider}
                        isEnabled={enabled}
                        description={description || ''}
                        isConfigured
                        link={`/integrations/edit/${id}`}
                    />
                ))}
            </StyledCardsGrid>
        </PageContent>
    );
};
