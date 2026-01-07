import { useMemo, useState, type VFC } from 'react';
import { Button } from '@mui/material';
import { ManageBulkTagsDialog } from 'component/feature/FeatureView/FeatureOverview/ManageTagsDialog/ManageBulkTagsDialog';
import type { FeatureSchema, TagSchema } from 'openapi';
import useTagApi from 'hooks/api/actions/useTagApi/useTagApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

interface IManageTagsProps {
    data: FeatureSchema[];
    projectId: string;
    onChange?: () => void;
}

export const ManageTags: VFC<IManageTagsProps> = ({
    projectId,
    data,
    onChange,
}) => {
    const { bulkUpdateTags } = useTagApi();
    const { setToastData, setToastApiError } = useToast();
    const { trackEvent } = usePlausibleTracker();
    const [isOpen, setIsOpen] = useState(false);
    const [initialValues, indeterminateValues] = useMemo(() => {
        const uniqueTags = data
            .flatMap(({ tags }) => tags || [])
            .reduce<TagSchema[]>(
                (acc, tag) => [
                    ...acc,
                    ...(acc.some(
                        (x) => x.type === tag.type && x.value === tag.value,
                    )
                        ? []
                        : [tag]),
                ],
                [],
            );

        const tagsNotPresentInEveryFeature = uniqueTags.filter(
            (tag) =>
                !data.every(({ tags }) =>
                    tags?.some(
                        (x) => x.type === tag.type && x.value === tag.value,
                    ),
                ),
        );

        return [uniqueTags, tagsNotPresentInEveryFeature];
    }, [data]);

    const onSubmit = async ({
        addedTags,
        removedTags,
    }: {
        addedTags: TagSchema[];
        removedTags: TagSchema[];
    }) => {
        const features = data.map(({ name }) => name);
        const payload = { features, tags: { addedTags, removedTags } };
        try {
            const toastText = [
                addedTags.length > 0 &&
                    `added ${addedTags.length} tag${addedTags.length > 1 ? 's' : ''}`,
                removedTags.length > 0 &&
                    `removed ${removedTags.length} tag${removedTags.length > 1 ? 's' : ''}`,
            ]
                .filter(Boolean)
                .join(' and ');

            await bulkUpdateTags(payload, projectId);
            setToastData({
                text: toastText,
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
        onChange?.();
        setIsOpen(false);
    };

    return (
        <>
            <PermissionHOC projectId={projectId} permission={UPDATE_FEATURE}>
                {({ hasAccess }) => (
                    <span>
                        <Button
                            disabled={!hasAccess || isOpen}
                            variant='outlined'
                            size='small'
                            onClick={() => setIsOpen(true)}
                        >
                            Tags
                        </Button>
                    </span>
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
