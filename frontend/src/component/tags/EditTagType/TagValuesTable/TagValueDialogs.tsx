import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { TagValuesUsageSchemaTagValuesItem } from 'openapi';
import {
    deleteTagValueTracking,
    editTagValueTracking,
} from '../../tagsTracking.ts';

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
    const flagsAffected = tagValue?.usedInActiveFeatures ?? 0;
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
                    {flagsAffected ? (
                        <>
                            {' '}
                            will be removed from{' '}
                            <strong>
                                {flagsAffected} active{' '}
                                {flagsAffected === 1 ? 'flag' : 'flags'}
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

type TagValueRename = {
    tagValue: TagValuesUsageSchemaTagValuesItem;
    newValue: string;
};

interface IRenameTagValueDialogProps {
    tagType: string;
    rename: TagValueRename | null;
    onSubmit: () => Promise<unknown>;
    onError: (error: unknown) => void;
    onClose: () => void;
}

export const RenameTagValueDialog = ({
    tagType,
    rename,
    onSubmit,
    onError,
    onClose,
}: IRenameTagValueDialogProps) => {
    const flagsAffected = rename?.tagValue.usedInActiveFeatures ?? 0;
    return (
        <Dialogue
            title='Rename tag value?'
            open={Boolean(rename)}
            primaryButtonText='Rename'
            secondaryButtonText='Cancel'
            onSubmit={onSubmit}
            onError={onError}
            tracking={editTagValueTracking}
            onClose={onClose}
        >
            {rename ? (
                <>
                    <strong>
                        {tagType}:{rename.tagValue.value}
                    </strong>
                    {flagsAffected ? (
                        <>
                            {' '}
                            will be renamed to{' '}
                            <strong>
                                {tagType}:{rename.newValue}
                            </strong>{' '}
                            on{' '}
                            <strong>
                                {flagsAffected} active{' '}
                                {flagsAffected === 1 ? 'flag' : 'flags'}
                            </strong>
                            , plus any in private projects you can't see.
                        </>
                    ) : (
                        <>
                            {' '}
                            isn't added to any active flags that you have access
                            to. Renaming it will also rename it on flags you
                            don't have access to, if any.
                        </>
                    )}{' '}
                    Any integrations relying on this tag need updating, or they
                    may add it back.
                </>
            ) : null}
        </Dialogue>
    );
};
