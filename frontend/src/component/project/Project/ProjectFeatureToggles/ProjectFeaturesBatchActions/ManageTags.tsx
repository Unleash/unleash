import { useMemo, useState, VFC } from 'react';
import { Button } from '@mui/material';
import { ManageBulkTagsDialog } from 'component/feature/FeatureView/FeatureOverview/ManageTagsDialog/ManageBulkTagsDialog';
import type { FeatureSchema } from 'openapi';
import { ITag } from 'interfaces/tags';
import useTagApi from 'hooks/api/actions/useTagApi/useTagApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import useProject from 'hooks/api/getters/useProject/useProject';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

interface IManageTagsProps {
    data: FeatureSchema[];
    projectId: string;
}

export const ManageTags: VFC<IManageTagsProps> = ({ projectId, data }) => {
    const { bulkUpdateTags } = useTagApi();
    const { refetch } = useProject(projectId);
    const { setToastData, setToastApiError } = useToast();
    const { trackEvent } = usePlausibleTracker();
    const [isOpen, setIsOpen] = useState(false);
    const [initialValues, indeterminateValues] = useMemo(() => {
        const uniqueTags = data
            .flatMap(({ tags }) => tags || [])
            .reduce<ITag[]>(
                (acc, tag) => [
                    ...acc,
                    ...(acc.some(
                        x => x.type === tag.type && x.value === tag.value
                    )
                        ? []
                        : [tag]),
                ],
                []
            );

        const tagsNotPresentInEveryFeature = uniqueTags.filter(
            tag =>
                !data.every(({ tags }) =>
                    tags?.some(
                        x => x.type === tag.type && x.value === tag.value
                    )
                )
        );

        return [uniqueTags, tagsNotPresentInEveryFeature];
    }, [data]);

    const onSubmit = async ({
        addedTags,
        removedTags,
    }: {
        addedTags: ITag[];
        removedTags: ITag[];
    }) => {
        const features = data.map(({ name }) => name);
        const payload = { features, tags: { addedTags, removedTags } };
        try {
            await bulkUpdateTags(payload);
            refetch();
            const added = addedTags.length
                ? `Added tags: ${addedTags
                      .map(({ type, value }) => `${type}:${value}`)
                      .join(', ')}.`
                : '';
            const removed = removedTags.length
                ? `Removed tags: ${removedTags
                      .map(({ type, value }) => `${type}:${value}`)
                      .join(', ')}.`
                : '';

            setToastData({
                title: 'Tags updated',
                text: `${features.length} feature toggles updated. ${added} ${removed}`,
                type: 'success',
                autoHideDuration: 12000,
            });
            trackEvent('batch_operations', {
                props: {
                    eventType: 'tags updated',
                },
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
        setIsOpen(false);
    };

    return (
        <>
            <PermissionHOC projectId={projectId} permission={UPDATE_FEATURE}>
                {({ hasAccess }) => (
                    <Button
                        disabled={!hasAccess || isOpen}
                        variant="outlined"
                        size="small"
                        onClick={() => setIsOpen(true)}
                    >
                        Tags
                    </Button>
                )}
            </PermissionHOC>
            <ManageBulkTagsDialog
                key={data.length}
                open={isOpen}
                onCancel={() => setIsOpen(false)}
                onSubmit={onSubmit}
                initialValues={initialValues}
                initialIndeterminateValues={indeterminateValues}
            />
        </>
    );
};
