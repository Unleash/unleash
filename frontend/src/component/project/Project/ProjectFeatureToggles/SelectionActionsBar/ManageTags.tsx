import { useMemo, useState, VFC } from 'react';
import { Label } from '@mui/icons-material';
import { Button } from '@mui/material';
import { DialogUI } from 'component/feature/FeatureView/FeatureOverview/ManageTagsDialog/DialogUI';
import type { FeatureSchema } from 'openapi';
import { ITag } from 'interfaces/tags';

interface IManageTagsProps {
    data: FeatureSchema[];
}

export const ManageTags: VFC<IManageTagsProps> = ({ data }) => {
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
            <DialogUI
                key={data.length}
                open={isOpen}
                onCancel={() => setIsOpen(false)}
                onSubmit={() => {}}
                initialValues={initialValues}
                initialIndeterminateValues={indeterminateValues}
            />
        </>
    );
};
