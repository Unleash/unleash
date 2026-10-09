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
import { useTracking } from 'hooks/useTracking';
import type { TagValuesUsageSchemaTagValuesItem } from 'openapi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { RenameTagValueDialog } from './TagValueDialogs.tsx';
import { editTagValueTracking } from '../../tagsTracking.ts';

const StyledValue = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0, 1),
}));

const StyledEditor = styled(StyledValue)({
    alignItems: 'flex-start',
});

const StyledTextField = styled(TextField)({
    flexGrow: 1,
    maxWidth: '300px',
});

const TAG_VALUE_MIN_LENGTH = 2;
const TAG_VALUE_MAX_LENGTH = 50;

type ValidationError = {
    reason: 'empty' | 'length';
    message: string;
};

const validateTagValue = (value: string): ValidationError | null => {
    if (!value) {
        return {
            reason: 'empty',
            message: 'Value cannot be empty or whitespace',
        };
    }
    const length = [...value].length;
    if (length < TAG_VALUE_MIN_LENGTH || length > TAG_VALUE_MAX_LENGTH) {
        return {
            reason: 'length',
            message: `Value must be between ${TAG_VALUE_MIN_LENGTH} and ${TAG_VALUE_MAX_LENGTH} characters`,
        };
    }
    return null;
};

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
    const trackEditTagValue = useTracking(editTagValueTracking);
    const [draft, setDraft] = useState(tagValue.value);
    const [error, setError] = useState('');
    const [newValue, setNewValue] = useState<string | null>(null);

    const save = () => {
        const trimmed = draft.trim();
        if (trimmed === tagValue.value) {
            onClose();
            return;
        }
        const validationError = validateTagValue(trimmed);
        if (validationError) {
            setError(validationError.message);
            trackEditTagValue.validationFailed({
                reason: validationError.reason,
            });
        } else {
            setNewValue(trimmed);
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
            <StyledEditor>
                <StyledTextField
                    size='small'
                    autoFocus
                    value={draft}
                    onChange={(event) => {
                        setDraft(event.target.value);
                        setError('');
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            save();
                        }
                        if (event.key === 'Escape') {
                            onClose();
                        }
                    }}
                    error={Boolean(error)}
                    helperText={error}
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
            </StyledEditor>
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
