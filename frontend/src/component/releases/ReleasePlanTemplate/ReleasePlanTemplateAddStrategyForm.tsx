import { Box, Button, styled, Tab, Tabs, Typography } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import type { IReleasePlanMilestoneStrategy } from 'interfaces/releasePlans';
import { useState } from 'react';
import { formatStrategyName } from 'utils/strategyNames';
import { MilestoneStrategyTitle } from './MilestoneStrategyTitle';
import produce from 'immer';

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledHeaderBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    paddingTop: theme.spacing(2),
}));

const StyledTitle = styled('h1')(({ theme }) => ({
    fontWeight: 'normal',
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    minHeight: '60px',
}));

const StyledTab = styled(Tab)(({ theme }) => ({
    width: '100px',
}));

const StyledContentDiv = styled('div')(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(6),
    paddingBottom: theme.spacing(16),
    paddingTop: theme.spacing(4),
    overflow: 'auto',
    height: '100%',
}));

const StyledTargetingHeader = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1.5),
}));

interface IReleasePlanTemplateAddStrategyFormProps {
    milestoneId: string | undefined;
    onCancel: () => void;
    strategy: IReleasePlanMilestoneStrategy;
    onAddStrategy: (
        milestoneId: string,
        strategy: IReleasePlanMilestoneStrategy,
    ) => void;
}

export const ReleasePlanTemplateAddStrategyForm = ({
    milestoneId,
    onCancel,
    strategy,
    onAddStrategy,
}: IReleasePlanTemplateAddStrategyFormProps) => {
    const [addStrategy, setAddStrategy] = useState(strategy);
    const [activeTab, setActiveTab] = useState(0);
    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setActiveTab(newValue);
    };

    const updateParameter = (name: string, value: string) => {
        setAddStrategy(
            produce((draft) => {
                if (!draft) {
                    return;
                }
                draft.parameters = draft.parameters ?? {};
                draft.parameters[name] = value;
            }),
        );
    };

    const addStrategyToMilestone = () => {
        if (!milestoneId) {
            return;
        }
        onAddStrategy(milestoneId, addStrategy);
    };

    if (!strategy) {
        return null;
    }

    return (
        <FormTemplate
            modal
            description='Add a strategy to your release plan template.'
        >
            <StyledHeaderBox>
                <StyledTitle>
                    {formatStrategyName(addStrategy.name || '')}
                    {addStrategy.name === 'flexibleRollout' && (
                        <Badge color='success' sx={{ marginLeft: '1rem' }}>
                            {addStrategy.parameters?.rollout}%
                        </Badge>
                    )}
                </StyledTitle>
            </StyledHeaderBox>
            <StyledTabs value={activeTab} onChange={handleChange}>
                <StyledTab label='General' />
                <Tab label={<Typography>Targeting</Typography>} />
            </StyledTabs>
            <StyledContentDiv>
                {activeTab === 0 && (
                    <>
                        <MilestoneStrategyTitle
                            title={addStrategy.title}
                            setTitle={(title) =>
                                updateParameter('title', title)
                            }
                        />
                    </>
                )}
                {activeTab === 1 && (
                    <>
                        <StyledTargetingHeader>
                            Segmentation and constraints allow you to set
                            filters on your strategies, so that they will only
                            be evaluated for users and applications that match
                            the specified preconditions.
                        </StyledTargetingHeader>
                    </>
                )}
            </StyledContentDiv>
            <StyledButtonContainer>
                <Button
                    variant='contained'
                    color='primary'
                    type='submit'
                    onClick={addStrategyToMilestone}
                >
                    Save strategy
                </Button>
                <StyledCancelButton onClick={onCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </FormTemplate>
    );
};
