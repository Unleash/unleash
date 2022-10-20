import React, { useState, VFC } from 'react';
import {
    Box,
    Paper,
    Button,
    Typography,
    Popover,
    Radio,
    FormControl,
    FormControlLabel,
    RadioGroup,
    styled,
    Tooltip,
} from '@mui/material';
import { useChangeRequest } from 'hooks/api/getters/useChangeRequest/useChangeRequest';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ChangesetDiff } from './ChangesetDiff/ChangesetDiff';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { PageContent } from '../../../common/PageContent/PageContent';
import { PageHeader } from '../../../common/PageHeader/PageHeader';
import { Search } from '../../../common/Search/Search';
import PermissionIconButton from '../../../common/PermissionIconButton/PermissionIconButton';
import { UPDATE_PROJECT } from '../../../providers/AccessProvider/permissions';
import { Delete, Edit, HelpOutline } from '@mui/icons-material';
interface ISuggestedChangesProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const StyledPageContent = styled(PageContent)(({ theme }) => ({
    height: '100vh',
    overflow: 'auto',
    padding: theme.spacing(7.5, 6),
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(4, 2),
    },
    '& .header': {
        padding: theme.spacing(0, 0, 2, 0),
    },
    '& .body': {
        padding: theme.spacing(3, 0, 0, 0),
    },
    borderRadius: `${theme.spacing(1.5, 0, 0, 1.5)} !important`,
}));

const StyledHelpOutline = styled(HelpOutline)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    marginLeft: '0.3rem',
    color: theme.palette.grey[700],
}));

const StyledHeaderHint = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
}));

export const SuggestedChanges: VFC<ISuggestedChangesProps> = ({
    open,
    setOpen,
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [selectedValue, setSelectedValue] = useState('');
    const { data: changeRequest } = useChangeRequest();

    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const onClose = () => setAnchorEl(null);

    const onRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedValue((event.target as HTMLInputElement).value);
    };

    const onSubmit = async (e: any) => {
        e.preventDefault();
        if (selectedValue === 'approve') {
            console.log('approve');
        } else if (selectedValue === 'requestChanges') {
            console.log('requestChanges');
        }
        // show an error if no action was selected
    };

    const onApply = async () => {
        try {
            console.log('apply');
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label="Review changes"
        >
            <StyledPageContent
                header={
                    <PageHeader
                        secondary
                        titleElement={
                            <>
                                Review your changes
                                <Tooltip
                                    title="You can review your changes from this page.
                                    Needs a text to explain the process."
                                    arrow
                                >
                                    <StyledHelpOutline />
                                </Tooltip>
                                <StyledHeaderHint>
                                    Make sure you are sending the right changes
                                    suggestions to be reviewed
                                </StyledHeaderHint>
                            </>
                        }
                    ></PageHeader>
                }
            >
                <Typography>{changeRequest?.state}</Typography>
                Environment: {changeRequest?.environment}
                <br />
                {/* <ChangesHeader
                author={changeRequest?.createdBy?.name}
                avatar={changeRequest?.createdBy?.imageUrl}
                createdAt={changeRequest?.createdAt}
            /> */}
                <br />
                <ChangesetDiff changeset={changeRequest?.changes} />
                <ConditionallyRender
                    condition={changeRequest?.state === 'APPLIED'}
                    show={<Typography>Applied</Typography>}
                />
                <ConditionallyRender
                    condition={changeRequest?.state === 'APPROVED'}
                    show={
                        <>
                            <Button
                                sx={{ mt: 2 }}
                                variant="contained"
                                onClick={onApply}
                            >
                                Apply changes
                            </Button>
                        </>
                    }
                />
                <ConditionallyRender
                    condition={changeRequest?.state === 'REVIEW'}
                    show={
                        <>
                            <Button
                                sx={{ mt: 2 }}
                                variant="contained"
                                onClick={onClick}
                            >
                                Review changes
                            </Button>
                            <Popover
                                id={'review-popover'}
                                open={Boolean(anchorEl)}
                                anchorEl={anchorEl}
                                onClose={onClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                            >
                                <Box
                                    component="form"
                                    onSubmit={onSubmit}
                                    sx={{
                                        padding: '1rem 2rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <FormControl>
                                        <RadioGroup
                                            value={selectedValue}
                                            onChange={onRadioChange}
                                            name="review-actions-radio"
                                        >
                                            <FormControlLabel
                                                value="approve"
                                                control={<Radio />}
                                                label="Approve"
                                            />
                                            <FormControlLabel
                                                value="requestChanges"
                                                control={<Radio />}
                                                label="Request changes"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                    >
                                        Submit
                                    </Button>
                                </Box>
                            </Popover>
                        </>
                    }
                />
            </StyledPageContent>
        </SidebarModal>
    );
};
