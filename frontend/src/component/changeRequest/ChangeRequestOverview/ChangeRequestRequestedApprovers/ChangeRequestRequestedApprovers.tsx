import {
    Box,
    Paper,
    styled,
    IconButton,
    useTheme,
    type AutocompleteChangeReason,
    type FilterOptionsState,
    Checkbox,
    TextField,
    Button,
    Typography,
} from '@mui/material';
import {
    type ReviewerSchema,
    useRequestedApprovers,
} from 'hooks/api/getters/useRequestedApprovers/useRequestedApprovers';
import { useState, type FC } from 'react';
import type { ChangeRequestType } from '../../changeRequest.types';
import {
    ChangeRequestApprover,
    ChangeRequestPending,
    ChangeRequestRejector,
} from '../ChangeRequestReviewers/ChangeRequestReviewer.js';
import Add from '@mui/icons-material/Add';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import AutocompleteVirtual from 'component/common/AutocompleteVirtual/AutcompleteVirtual.js';
import {
    type AvailableReviewerSchema,
    useAvailableChangeRequestReviewers,
} from 'hooks/api/getters/useAvailableChangeRequestReviewers/useAvailableChangeRequestReviewers.js';
import { caseInsensitiveSearch } from 'utils/search.js';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi.js';

export const StyledSpan = styled('span')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(1),
    fontSize: theme.fontSizes.bodySize,
}));

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    '& > div': { width: '100%' },
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(-2),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    marginRight: theme.spacing(-1),
}));

const StrechedLi = styled('li')({ width: '100%' });

const StyledOption = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    '& > span:first-of-type': {
        color: theme.palette.text.secondary,
    },
}));

const StyledTags = styled('div')(({ theme }) => ({
    paddingLeft: theme.spacing(1),
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

export const ChangeRequestReviewersHeader: FC<{
    canShowAddReviewers: boolean;
    showAddReviewers: boolean;
    actualApprovals: number;
    minApprovals: number;
    setShowAddReviewers: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
    canShowAddReviewers,
    showAddReviewers,
    actualApprovals,
    minApprovals,
    setShowAddReviewers,
}) => {
    return (
        <>
            <StyledBox sx={{ mb: 1 }}>
                <StyledSpan>
                    Reviewers
                    <Typography
                        component='span'
                        color='text.secondary'
                        sx={{ ml: 1 }}
                    >
                        ({actualApprovals}/{minApprovals} required)
                    </Typography>
                </StyledSpan>
                {canShowAddReviewers &&
                    (showAddReviewers ? (
                        <StyledIconButton
                            title='Close'
                            onClick={() => {
                                setShowAddReviewers(false);
                            }}
                        >
                            <KeyboardArrowUp />
                        </StyledIconButton>
                    ) : (
                        <StyledIconButton
                            title='Request approvals'
                            onClick={() => {
                                setShowAddReviewers(true);
                            }}
                        >
                            <Add />
                        </StyledIconButton>
                    ))}
            </StyledBox>
        </>
    );
};

export const ChangeRequestAddRequestedApprovers: FC<{
    changeRequest: Pick<ChangeRequestType, 'id' | 'project' | 'environment'>;
    saveClicked: (reviewers: AvailableReviewerSchema[]) => void;
    existingReviewers: Pick<ReviewerSchema, 'id'>[];
}> = ({ changeRequest, saveClicked, existingReviewers }) => {
    const theme = useTheme();
    const [reviewers, setReviewers] = useState<AvailableReviewerSchema[]>([]);
    const allReviewers = [...existingReviewers, ...reviewers];
    const { reviewers: fetchedReviewers, loading: isLoading } =
        useAvailableChangeRequestReviewers(
            changeRequest.project,
            changeRequest.environment,
        );
    const availableReviewers = fetchedReviewers.filter(
        (reviewer) =>
            !existingReviewers.some((existing) => existing.id === reviewer.id),
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
        <StyledBox sx={{ mb: 4 }}>
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
                freeSolo={allReviewers.length >= 10 ? false : undefined}
                getOptionDisabled={(options) => {
                    return (
                        allReviewers.length >= 10 &&
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
            <Button
                sx={{ ml: 2 }}
                variant='contained'
                color='primary'
                disabled={false}
                onClick={() => saveClicked(reviewers)}
            >
                Save
            </Button>
        </StyledBox>
    );
};

export const ChangeRequestRequestedApprovers: FC<{
    changeRequest: Pick<
        ChangeRequestType,
        | 'id'
        | 'project'
        | 'approvals'
        | 'rejections'
        | 'state'
        | 'minApprovals'
        | 'environment'
    >;
}> = ({ changeRequest }) => {
    const [showAddReviewers, setShowAddReviewers] = useState(false);
    const { reviewers: requestedReviewers, refetchReviewers } =
        useRequestedApprovers(changeRequest.project, changeRequest.id);
    const { updateRequestedApprovers } = useChangeRequestApi();
    const canShowAddReviewers =
        (changeRequest.state === 'Draft' ||
            changeRequest.state === 'In review') &&
        changeRequest.minApprovals > 0;

    let reviewers = requestedReviewers.map((reviewer) => {
        const approver = changeRequest.approvals.find(
            (approval) => approval.createdBy.id === reviewer.id,
        );
        const rejector = changeRequest.rejections.find(
            (rejection) => rejection.createdBy.id === reviewer.id,
        );

        return {
            id: reviewer.id,
            name: reviewer.username || reviewer.name || 'Unknown user',
            imageUrl: reviewer.imageUrl,
            status: approver ? 'approved' : rejector ? 'rejected' : 'pending',
        };
    });

    reviewers = [
        ...reviewers,
        ...changeRequest.approvals
            .filter(
                (approval) =>
                    !reviewers.find(
                        (r) => r.name === approval.createdBy.username,
                    ),
            )
            .map((approval) => ({
                id: approval.createdBy.id,
                name: approval.createdBy.username || 'Unknown user',
                imageUrl: approval.createdBy.imageUrl,
                status: 'approved',
            })),
        ...changeRequest.rejections
            .filter(
                (rejection) =>
                    !reviewers.find(
                        (r) => r.name === rejection.createdBy.username,
                    ),
            )
            .map((rejection) => ({
                id: rejection.createdBy.id,
                name: rejection.createdBy.username || 'Unknown user',
                imageUrl: rejection.createdBy.imageUrl,
                status: 'rejected',
            })),
    ];

    const saveClicked = async (
        selectedReviewers: AvailableReviewerSchema[],
    ) => {
        if (selectedReviewers.length > 0) {
            const tosend = [
                ...reviewers.map((reviewer) => reviewer.id),
                ...selectedReviewers.map((reviewer) => reviewer.id),
            ];
            await updateRequestedApprovers(
                changeRequest.project,
                changeRequest.id,
                tosend,
            );
        }
        refetchReviewers();
        setShowAddReviewers(false);
    };

    return (
        <Paper
            elevation={0}
            sx={(theme) => ({
                marginTop: theme.spacing(2),
                padding: theme.spacing(4),
                paddingTop: theme.spacing(2),
                borderRadius: (theme) => `${theme.shape.borderRadiusLarge}px`,
            })}
        >
            <ChangeRequestReviewersHeader
                canShowAddReviewers={canShowAddReviewers}
                showAddReviewers={showAddReviewers}
                minApprovals={changeRequest.minApprovals}
                actualApprovals={changeRequest.approvals.length}
                setShowAddReviewers={setShowAddReviewers}
            />
            {canShowAddReviewers && showAddReviewers && (
                <ChangeRequestAddRequestedApprovers
                    changeRequest={changeRequest}
                    existingReviewers={reviewers}
                    saveClicked={saveClicked}
                />
            )}
            {reviewers.map((reviewer) => {
                const key = reviewer.id;
                const props = {
                    name: reviewer.name || 'Unknown user',
                    imageUrl: reviewer.imageUrl,
                };
                switch (reviewer.status) {
                    case 'approved':
                        return <ChangeRequestApprover key={key} {...props} />;
                    case 'rejected':
                        return <ChangeRequestRejector key={key} {...props} />;
                    case 'pending':
                        return <ChangeRequestPending key={key} {...props} />;
                    default:
                        return null;
                }
            })}
        </Paper>
    );
};
