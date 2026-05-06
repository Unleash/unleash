import { Button, styled, Typography } from '@mui/material';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import CheckIcon from '@mui/icons-material/Check';
import { FlagCreationButton } from '../../../project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/FlagCreationButton/FlagCreationButton.tsx';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';

interface ICreateFlagStepProps {
    projectId: string;
    refetchFeatures: () => void;
}

const Header = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 32,
}));

const IconBadge = styled('div')(({ theme }) => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': { fontSize: 20 },
}));

const ActiveIcon = styled(IconBadge)(({ theme }) => ({
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.background.paper,
}));

const DoneIcon = styled(IconBadge)(({ theme }) => ({
    backgroundColor: theme.palette.success.light,
    border: `1px solid ${theme.palette.success.border}`,
    color: theme.palette.success.main,
}));

const StepLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: theme.spacing(2),
    color: theme.palette.text.secondary,
}));

const Content = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    gap: theme.spacing(1),
}));

const Copy = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const Title = styled(Typography, {
    shouldForwardProp: (prop) => prop !== 'done',
})<{ done?: boolean }>(({ theme, done }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: done ? theme.palette.text.secondary : theme.palette.text.primary,
    textDecoration: done ? 'line-through' : 'none',
}));

const Body = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

const ButtonRow = styled('div')(() => ({
    display: 'flex',
    alignSelf: 'flex-start',
    marginTop: 'auto',
}));

export const CreateFlagStep = ({
    projectId,
    refetchFeatures,
}: ICreateFlagStepProps) => {
    const { project, refetch } = useProjectOverview(projectId);
    const status = project.onboardingStatus?.status;
    const isDone = Boolean(status) && status !== 'onboarding-started';

    return (
        <>
            <Header>
                {isDone ? (
                    <DoneIcon>
                        <CheckIcon />
                    </DoneIcon>
                ) : (
                    <ActiveIcon>
                        <OutlinedFlagIcon />
                    </ActiveIcon>
                )}
                <StepLabel>Step 1</StepLabel>
            </Header>
            <Content>
                <Copy>
                    <Title done={isDone}>Create a feature flag</Title>
                    <Body>
                        You must create a feature flag before you can connect a
                        SDK.
                    </Body>
                </Copy>
                <ButtonRow>
                    {isDone ? (
                        <Button
                            variant='outlined'
                            color='inherit'
                            startIcon={<CheckIcon />}
                            disabled
                        >
                            Done
                        </Button>
                    ) : (
                        <FlagCreationButton
                            text='New feature flag'
                            skipNavigationOnComplete
                            onSuccess={() => {
                                refetch();
                                refetchFeatures();
                            }}
                        />
                    )}
                </ButtonRow>
            </Content>
        </>
    );
};
