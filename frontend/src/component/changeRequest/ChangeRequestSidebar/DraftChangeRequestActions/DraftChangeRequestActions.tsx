import type { FC } from 'react';
import {
    styled,
    Button,
    Checkbox,
    TextField,
    useTheme,
    type AutocompleteChangeReason,
    type FilterOptionsState,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import AutocompleteVirtual from 'component/common/AutocompleteVirtual/AutcompleteVirtual';
import { caseInsensitiveSearch } from 'utils/search';
import type { ChangeRequestType } from 'component/changeRequest/changeRequest.types';
import { changesCount } from '../../changesCount.js';
import {
    type AvailableReviewerSchema,
    useAvailableChangeRequestReviewers,
} from 'hooks/api/getters/useAvailableChangeRequestReviewers/useAvailableChangeRequestReviewers.js';

const SubmitChangeRequestButton: FC<{
    onClick: () => void;
    count: number;
    disabled?: boolean;
}> = ({ onClick, count, disabled = false }) => (
    <Button
        sx={{ ml: 2 }}
        variant='contained'
        onClick={onClick}
        disabled={disabled}
    >
        Submit change request ({count})
    </Button>
);

const StyledTags = styled('div')(({ theme }) => ({
    paddingLeft: theme.spacing(1),
}));

const StrechedLi = styled('li')({ width: '100%' });

const StyledOption = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    '& > span:first-of-type': {
        color: theme.palette.text.secondary,
    },
}));

const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: AvailableReviewerSchema,
    { selected }: { selected: boolean },
) => (
    <StrechedLi {...props} key={option.id}>
        <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize='small' />}
            checkedIcon={<CheckBoxIcon fontSize='small' />}
            style={{ marginRight: 8 }}
            checked={selected}
        />
        <StyledOption>
            <span>{option.name || option.username}</span>
            <span>
                {option.name && option.username
                    ? option.username
                    : option.email}
            </span>
        </StyledOption>
    </StrechedLi>
);

const renderTags = (value: AvailableReviewerSchema[]) => (
    <StyledTags>
        {value.length > 1
            ? `${value.length} reviewers`
            : value[0].name || value[0].username || value[0].email}
    </StyledTags>
);

export const DraftChangeRequestActions: FC<{
    environmentChangeRequest: ChangeRequestType;
    reviewers: AvailableReviewerSchema[];
    setReviewers: React.Dispatch<
        React.SetStateAction<AvailableReviewerSchema[]>
    >;
    onReview: (changeState: (project: string) => Promise<void>) => void;
    onDiscard: (id: number) => void;
    sendToReview: (project: string) => Promise<void>;
    disabled?: boolean;
    setDisabled: (disabled: boolean) => void;
}> = ({
    environmentChangeRequest,
    reviewers,
    setReviewers,
    onReview,
    onDiscard,
    sendToReview,
    disabled,
    setDisabled,
}) => {
    const theme = useTheme();
    const { reviewers: availableReviewers, loading: isLoading } =
        useAvailableChangeRequestReviewers(
            environmentChangeRequest.project,
            environmentChangeRequest.environment,
        );

    const autoCompleteChange = (
        event: React.SyntheticEvent,
        newValue: AvailableReviewerSchema[],
        reason: AutocompleteChangeReason,
    ) => {
        if (
            event.type === 'keydown' &&
            (event as React.KeyboardEvent).key === 'Backspace' &&
            reason === 'removeOption'
        ) {
            return;
        }
        setReviewers(newValue);
    };

    const filterOptions = (
        options: AvailableReviewerSchema[],
        { inputValue }: FilterOptionsState<AvailableReviewerSchema>,
    ) =>
        options.filter(
            ({ name, username, email }) =>
                caseInsensitiveSearch(inputValue, email) ||
                caseInsensitiveSearch(inputValue, name) ||
                caseInsensitiveSearch(inputValue, username),
        );

    return (
        <>
            <AutocompleteVirtual
                sx={{ ml: 'auto', width: theme.spacing(40) }}
                size='small'
                limitTags={3}
                openOnFocus
                multiple
                disableCloseOnSelect
                value={reviewers as AvailableReviewerSchema[]}
                onChange={autoCompleteChange}
                options={availableReviewers}
                renderOption={renderOption}
                filterOptions={filterOptions}
                freeSolo={reviewers.length >= 10 ? false : undefined}
                getOptionDisabled={(options) => {
                    return (
                        reviewers.length >= 10 &&
                        !reviewers.find((opt) => opt.id === options.id)
                    );
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option: AvailableReviewerSchema) =>
                    option.email || option.name || option.username || ''
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={`Reviewers (${reviewers.length})`}
                    />
                )}
                renderTags={(value) => renderTags(value)}
                noOptionsText={isLoading ? 'Loading…' : 'No options'}
            />
            <SubmitChangeRequestButton
                onClick={() => onReview(sendToReview)}
                count={changesCount(environmentChangeRequest)}
                disabled={disabled}
            />

            <Button
                sx={{ ml: 2 }}
                variant='outlined'
                disabled={disabled}
                onClick={() => {
                    setDisabled(true);
                    onDiscard(environmentChangeRequest.id);
                }}
            >
                Discard changes
            </Button>
        </>
    );
};
