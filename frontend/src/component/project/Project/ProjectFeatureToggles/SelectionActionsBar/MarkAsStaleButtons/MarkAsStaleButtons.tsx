import { VFC } from 'react';
import { Button } from '@mui/material';
import { WatchLater } from '@mui/icons-material';
import type { FeatureSchema } from 'openapi';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';

interface IMarkAsStaleButtonsProps {
    projectId: string;
    data: FeatureSchema[];
}

export const MarkAsStaleButtons: VFC<IMarkAsStaleButtonsProps> = ({
    projectId,
    data,
}) => {
    const hasStale = data.some(d => d.stale);
    const hasUnstale = data.some(d => !d.stale);

    return (
        <PermissionHOC projectId={projectId} permission={UPDATE_FEATURE}>
            {({ hasAccess }) => (
                <>
                    <ConditionallyRender
                        condition={hasUnstale || !hasAccess}
                        show={
                            <Button
                                startIcon={<WatchLater />}
                                variant="outlined"
                                size="small"
                                disabled={!hasAccess}
                            >
                                Mark as stale
                            </Button>
                        }
                    />
                    <ConditionallyRender
                        condition={Boolean(hasAccess && hasStale)}
                        show={
                            <Button
                                startIcon={<WatchLater />}
                                variant="outlined"
                                size="small"
                            >
                                Un-mark as stale
                            </Button>
                        }
                    />
                </>
            )}
        </PermissionHOC>
    );
};
