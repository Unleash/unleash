import { useState } from 'react';
import {
    ClickAwayListener,
    IconButton,
    styled,
    TextField,
} from '@mui/material';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import Edit from '@mui/icons-material/Edit';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_TAG_TYPE } from 'component/providers/AccessProvider/permissions';
import useTagApi from 'hooks/api/actions/useTagApi/useTagApi';
import useToast from 'hooks/useToast';
import type { TagValuesUsageSchemaTagValuesItem } from 'openapi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { RenameTagValueDialog } from './TagValueDialogs.tsx';

const StyledValue = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0, 1),
}));

interface ITagValueCellProps {
    tagType: string;
    tagValue: TagValuesUsageSchemaTagValuesItem;
    editing: boolean;
    onEdit: () => void;
    onClose: () => void;
    onRenamed: () => void;
    isExistingValue: (value: string) => boolean;
}

const TagValueEditor = ({
    tagType,
    tagValue,
    onClose,
    onRenamed,
    isExistingValue,
}: Omit<ITagValueCellProps, 'editing' | 'onEdit'>) => {
    const { renameTag } = useTagApi();
    const { setToastData, setToastApiError } = useToast();
    const [draft, setDraft] = useState(tagValue.value);
    const [newValue, setNewValue] = useState<string | null>(null);

    const save = () => {
        const trimmed = draft.trim();
        if (trimmed && trimmed !== tagValue.value) {
            setNewValue(trimmed);
        } else {
            onClose();
        }
    };

    const confirmRename = async () => {
        if (!newValue) return;
        await renameTag(tagType, tagValue.value, { value: newValue });
        onRenamed();
        setToastData({
            type: 'success',
            text: isExistingValue(newValue)
                ? 'Tag values merged'
                : 'Tag value renamed',
        });
    };

    // The dialog renders inside the listener's React tree, so clicks in it
    // don't count as clicking away.
    return (
        <ClickAwayListener onClickAway={onClose}>
            <StyledValue>
                <TextField
                    size='small'
                    autoFocus
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            save();
                        }
                        if (event.key === 'Escape') {
                            onClose();
                        }
                    }}
                    slotProps={{
                        htmlInput: {
                            'aria-label': `New value for ${tagValue.value}`,
                        },
                    }}
                />
                <IconButton size='small' aria-label='Save' onClick={save}>
                    <Check fontSize='small' />
                </IconButton>
                <IconButton size='small' aria-label='Cancel' onClick={onClose}>
                    <Close fontSize='small' />
                </IconButton>
                <RenameTagValueDialog
                    tagType={tagType}
                    rename={
                        newValue
                            ? {
                                  tagValue,
                                  newValue,
                                  kind: isExistingValue(newValue)
                                      ? 'merge'
                                      : 'rename',
                              }
                            : null
                    }
                    onSubmit={confirmRename}
                    onError={(error) =>
                        setToastApiError(formatUnknownError(error))
                    }
                    onClose={() => setNewValue(null)}
                />
            </StyledValue>
        </ClickAwayListener>
    );
};

export const TagValueCell = ({
    editing,
    onEdit,
    ...props
}: ITagValueCellProps) =>
    editing ? (
        <TagValueEditor {...props} />
    ) : (
        <StyledValue>
            {props.tagValue.value}
            <PermissionIconButton
                size='small'
                permission={UPDATE_TAG_TYPE}
                tooltipProps={{ title: 'Rename tag value' }}
                onClick={onEdit}
            >
                <Edit fontSize='small' />
            </PermissionIconButton>
        </StyledValue>
    );
