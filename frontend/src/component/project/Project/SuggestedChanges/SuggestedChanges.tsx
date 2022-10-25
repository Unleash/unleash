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
import { HelpOutline } from '@mui/icons-material';
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
    const [selectedValue, setSelectedValue] = useState('');
    const { data: changeRequest } = useChangeRequest();

    const onReview = async () => {
        console.log('approve');
    };

    const onDiscard = async () => {
        console.log('discard');
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
                {/* TODO: multiple environments (changesets) */}
                <Typography>{changeRequest?.state}</Typography>
                <br />
                <ChangesetDiff
                    changes={changeRequest?.changes}
                    state={changeRequest?.state}
                />
                <Box sx={{ display: 'flex' }}>
                    <ConditionallyRender
                        condition={changeRequest?.state === 'APPROVED'}
                        show={<Typography>Applied</Typography>}
                    />
                    <ConditionallyRender
                        condition={changeRequest?.state === 'CLOSED'}
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
                        condition={changeRequest?.state === 'CREATED'}
                        show={
                            <>
                                <Button
                                    sx={{ mt: 2, ml: 'auto' }}
                                    variant="contained"
                                    onClick={onReview}
                                >
                                    Request changes
                                </Button>
                                <Button
                                    sx={{ mt: 2, ml: 2 }}
                                    variant="outlined"
                                    onClick={onDiscard}
                                >
                                    Discard changes
                                </Button>
                            </>
                        }
                    />
                </Box>
            </StyledPageContent>
        </SidebarModal>
    );
};
