import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { TagValuesUsageSchemaTagValuesItem } from 'openapi';
import { deleteTagValueTracking } from '../../tagsTracking.ts';

interface IDeleteTagValueDialogProps {
    tagType: string;
    tagValue: TagValuesUsageSchemaTagValuesItem | null;
    onSubmit: () => Promise<unknown>;
    onError: (error: unknown) => void;
    onClose: () => void;
}

export const DeleteTagValueDialog = ({
    tagType,
    tagValue,
    onSubmit,
    onError,
    onClose,
}: IDeleteTagValueDialogProps) => {
    // The count leaves out private projects the user can't access, but deleting
    // a tag value changes flags in those projects too.
    // The same edge case is present in tag type list.
    const flags = tagValue?.usedInActiveFeatures ?? 0;
    return (
        <Dialogue
            title='Delete tag value?'
            open={Boolean(tagValue)}
            primaryButtonText='Delete'
            secondaryButtonText='Cancel'
            onSubmit={onSubmit}
            onError={onError}
            tracking={deleteTagValueTracking}
            onClose={onClose}
        >
            {tagValue ? (
                <>
                    <strong>
                        {tagType}:{tagValue.value}
                    </strong>
                    {flags ? (
                        <>
                            {' '}
                            will be removed from{' '}
                            <strong>
                                {flags} active {flags === 1 ? 'flag' : 'flags'}
                            </strong>
                            , plus any in private projects you can't see.
                        </>
                    ) : (
                        <>
                            {' '}
                            isn't added to any active flags that you have access
                            to. Deleting it will remove it from flags you don't
                            have access to, if any.
                        </>
                    )}{' '}
                    Any integrations relying on this tag will stop working. This
                    can't be undone.
                </>
            ) : null}
        </Dialogue>
    );
};
