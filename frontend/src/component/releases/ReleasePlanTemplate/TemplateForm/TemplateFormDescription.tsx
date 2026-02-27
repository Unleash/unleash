import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import MilestoneIcon from 'assets/icons/milestone.svg?react';
import { styled } from '@mui/material';

const StyledDescription = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    fontSize: theme.fontSizes.smallBody,
}));

const StyledDescriptionHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontSize: theme.fontSizes.bodySize,
    fontWeight: theme.fontWeight.bold,
}));

const StyledExampleUsage = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledMilestones = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledLabel = styled('p')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledMilestoneHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

export const TemplateFormDescription = () => {
    return (
        <StyledDescription>
            <StyledDescriptionHeader>
                <FactCheckOutlinedIcon />
                Release templates
            </StyledDescriptionHeader>
            <p>
                Standardize your team's approach to rolling out new
                functionality with release templates. These templates allow you
                to predefine strategies, or groups of strategies, making it
                easier to set up new flags and ensure alignment in how rollouts
                are managed.
            </p>
            <p>
                Customize templates to suit your needs by adding strategies to
                specific milestones. Each milestone will execute sequentially,
                streamlining your release process.
            </p>
            <StyledExampleUsage>
                <StyledLabel>Example usage</StyledLabel>
                <StyledMilestones>
                    <div>
                        <StyledMilestoneHeader>
                            <MilestoneIcon />
                            Milestone 1
                        </StyledMilestoneHeader>
                        <p>
                            Enable the feature for internal teams to test
                            functionality and resolve initial issues.
                        </p>
                    </div>
                    <div>
                        <StyledMilestoneHeader>
                            <MilestoneIcon />
                            Milestone 2
                        </StyledMilestoneHeader>
                        <p>
                            Expand the rollout to 20% of beta users to gather
                            feedback and monitor performance.
                        </p>
                    </div>
                    <div>
                        <StyledMilestoneHeader>
                            <MilestoneIcon />
                            Milestone 3
                        </StyledMilestoneHeader>
                        <p>
                            Release the feature to all users after confirming
                            stability and addressing earlier feedback.
                        </p>
                    </div>
                </StyledMilestones>
            </StyledExampleUsage>
        </StyledDescription>
    );
};
