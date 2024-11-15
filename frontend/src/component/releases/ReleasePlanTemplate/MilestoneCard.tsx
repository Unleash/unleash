import { StyledMilestoneCard, StyledMilestoneCardBody } from './TemplateForm';
import Input from 'component/common/Input/Input';
import { Button, Grid, styled } from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import type { IReleasePlanMilestonePayload } from 'interfaces/releasePlans';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';

const StyledEditIcon = styled(Edit)(({ theme }) => ({
    cursor: 'pointer',
    marginTop: theme.spacing(-0.25),
    marginLeft: theme.spacing(0.5),
    height: theme.spacing(2.5),
    width: theme.spacing(2.5),
    color: theme.palette.text.secondary,
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

interface IMilestoneCard {
    index: number;
    milestone: IReleasePlanMilestonePayload;
    showAddStrategyDialog: (index: number) => void;
    errors: { [key: string]: string };
    clearErrors: () => void;
}

export const MilestoneCard = ({
    index,
    milestone,
    showAddStrategyDialog,
    errors,
    clearErrors,
}: IMilestoneCard) => {
    const [milestoneName, setMilestoneName] = useState<string>(milestone.name);
    const [editMode, setEditMode] = useState<boolean>(false);
    const theme = useTheme();

    useEffect(() => {
        milestone.name = milestoneName;
    }, [milestoneName]);

    const editMilestoneNameClick = () => {
        setEditMode(true);
    };

    return (
        <StyledMilestoneCard>
            <StyledMilestoneCardBody>
                <Grid container>
                    <StyledGridItem item xs={10} md={10}>
                        {editMode && (
                            <StyledInput
                                label=''
                                value={milestoneName}
                                onChange={(e) =>
                                    setMilestoneName(e.target.value)
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
                            <StyledMilestoneCardTitle
                                onClick={editMilestoneNameClick}
                            >
                                {milestoneName}
                            </StyledMilestoneCardTitle>
                        )}
                        {!editMode && (
                            <StyledEditIcon onClick={editMilestoneNameClick} />
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
