import Input from 'component/common/Input/Input';
import { Box, Button, Card, Grid, styled } from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import type { IReleasePlanMilestonePayload } from 'interfaces/releasePlans';
import { useState } from 'react';

const StyledEditIcon = styled(Edit)(({ theme }) => ({
    cursor: 'pointer',
    marginTop: theme.spacing(-0.25),
    marginLeft: theme.spacing(0.5),
    height: theme.spacing(2.5),
    width: theme.spacing(2.5),
    color: theme.palette.text.secondary,
}));

const StyledMilestoneCard = styled(Card)(({ theme }) => ({
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
    },
    transition: 'background-color 0.2s ease-in-out',
    backgroundColor: theme.palette.background.default,
    '&:hover': {
        backgroundColor: theme.palette.neutral.light,
    },
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledMilestoneCardBody = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 2),
}));

const StyledGridItem = styled(Grid)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
}));

const StyledMilestoneCardTitle = styled('span')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSizes.bodySize,
}));

interface IMilestoneCardProps {
    index: number;
    milestone: IReleasePlanMilestonePayload;
    milestoneNameChanged: (index: number, name: string) => void;
    showAddStrategyDialog: (index: number) => void;
    errors: { [key: string]: string };
    clearErrors: () => void;
}

export const MilestoneCard = ({
    index,
    milestone,
    milestoneNameChanged,
    showAddStrategyDialog,
    errors,
    clearErrors,
}: IMilestoneCard) => {
    const [editMode, setEditMode] = useState(false);

    return (
        <StyledMilestoneCard>
            <StyledMilestoneCardBody>
                <Grid container>
                    <StyledGridItem item xs={10} md={10}>
                        {editMode && (
                            <StyledInput
                                label=''
                                value={milestone.name}
                                onChange={(e) =>
                                    milestoneNameChanged(index, e.target.value)
                                }
                                error={Boolean(errors?.name)}
                                errorText={errors?.name}
                                onFocus={() => clearErrors()}
                                onBlur={() => setEditMode(false)}
                                autoFocus
                                onKeyDownCapture={(e) => {
                                    if (e.code === 'Enter') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditMode(false);
                                    }
                                }}
                            />
                        )}
                        {!editMode && (
                            <>
                                <StyledMilestoneCardTitle
                                    onClick={() => setEditMode(true)}
                                >
                                    {milestone.name}
                                </StyledMilestoneCardTitle>
                                <StyledEditIcon
                                    onClick={() => setEditMode(true)}
                                />
                            </>
                        )}
                    </StyledGridItem>
                    <Grid item xs={2} md={2}>
                        <Button
                            variant='outlined'
                            color='primary'
                            onClick={() => showAddStrategyDialog(index)}
                        >
                            Add strategy
                        </Button>
                    </Grid>
                </Grid>
            </StyledMilestoneCardBody>
        </StyledMilestoneCard>
    );
};
