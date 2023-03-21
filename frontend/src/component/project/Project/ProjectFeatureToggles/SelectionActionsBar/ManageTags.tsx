import { useMemo, useState, VFC } from 'react';
import { Label } from '@mui/icons-material';
import { Button } from '@mui/material';
import { ManageBulkTagsDialog } from 'component/feature/FeatureView/FeatureOverview/ManageTagsDialog/ManageBulkTagsDialog';
import type { FeatureSchema } from 'openapi';
import { ITag } from 'interfaces/tags';
import useTagApi from 'hooks/api/actions/useTagApi/useTagApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';

interface IManageTagsProps {
    data: FeatureSchema[];
}

export const ManageTags: VFC<IManageTagsProps> = ({ data }) => {
    const { bulkUpdateTags } = useTagApi();
    const { setToastData, setToastApiError } = useToast();
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

    const onSubmit = ({
        addedTags,
        removedTags,
    }: {
        addedTags: ITag[];
        removedTags: ITag[];
    }) => {
        const features = data.map(({ name }) => name);
        const payload = { features, tags: { addedTags, removedTags } };
        try {
            bulkUpdateTags(payload);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
        //     handleClose();
        //     await staleFeatures(projectId, selectedIds);
        //     await refetch();
        //     setToastData({
        //         title: 'State updated',
        //         text: 'Feature toggles marked as stale',
        //         type: 'success',
        //     });
        setIsOpen(false);
    };

    return (
        // FIXME: permissions UPDATE_FEATURE
        <>
            <Button
                startIcon={<Label />}
                variant="outlined"
                size="small"
                onClick={() => setIsOpen(true)}
            >
                Tags
            </Button>
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
