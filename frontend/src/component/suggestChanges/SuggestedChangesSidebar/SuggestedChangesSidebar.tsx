import React, { useState, VFC } from 'react';
import { Box, Button, Typography, styled, Tooltip } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { HelpOutline } from '@mui/icons-material';
import { useSuggestedChange } from 'hooks/api/getters/useSuggestChange/useSuggestedChange';
import { SuggestedChangeset } from '../SuggestedChangeset/SuggestedChangeset';
interface ISuggestedChangesSidebarProps {
    open: boolean;
    onClose: () => void;
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

export const SuggestedChangesSidebar: VFC<ISuggestedChangesSidebarProps> = ({
    open,
    onClose,
}) => {
    const { data: suggestedChange } = useSuggestedChange();

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
        <SidebarModal open={open} onClose={onClose} label="Review changes">
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
                <Typography>{suggestedChange?.state}</Typography>
                <br />
                <SuggestedChangeset suggestedChange={suggestedChange} />
                <Box sx={{ display: 'flex' }}>
                    <ConditionallyRender
                        condition={suggestedChange?.state === 'APPROVED'}
                        show={<Typography>Applied</Typography>}
                    />
                    <ConditionallyRender
                        condition={suggestedChange?.state === 'CLOSED'}
                        show={<Typography>Applied</Typography>}
                    />
                    <ConditionallyRender
                        condition={suggestedChange?.state === 'APPROVED'}
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
                        condition={suggestedChange?.state === 'CREATED'}
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
