import { type FC, useId, useState } from 'react';
import {
    Button,
    Dialog,
    Link,
    Typography,
    styled,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { DefineMetricForm } from './DefineMetricForm';
import { SuccessView } from './SuccessView';
import { InfoSidebar } from './InfoSidebar';

type RegisterMetricDialogProps = {
    open: boolean;
    onClose: () => void;
};

type DialogStage = 'define' | 'success';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: theme.spacing(170),
        width: '100%',
        backgroundColor: 'transparent',
        flexDirection: 'row',
    },
    padding: 0,
}));

const MainSection = styled('div')(({ theme }) => ({
    minHeight: 'min(718px, 100vh)',
    maxHeight: '100vh',
    flex: 'auto',
    backgroundColor: theme.palette.background.paper,
    display: 'grid',
    gridTemplateRows: '1fr auto',
    '&:has(form:invalid) button[type="submit"]': {
        color: theme.palette.action.disabled,
        backgroundColor: theme.palette.action.disabledBackground,
        cursor: 'auto',
        boxShadow: 'none',
    },
}));

const Content = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    padding: theme.spacing(4, 6, 4, 6),

    h3: { marginBlockEnd: theme.spacing(1) },
    h4: { marginBlockEnd: theme.spacing(0.5) },
}));

const Navigation = styled('div')(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(3),
    alignItems: 'center',
    padding: theme.spacing(2, 6),
}));

const InnerDialog: FC<Omit<RegisterMetricDialogProps, 'open'>> = ({
    onClose,
}) => {
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

    const [stage, setStage] = useState<DialogStage>('define');
    const [createdMetricName, setCreatedMetricName] = useState('');
    const formId = useId();

    const isDefineStage = stage === 'define';

    return (
        <StyledDialog open={true} onClose={onClose}>
            <MainSection>
                <Content>
                    <div>
                        <Typography variant='h1' component='h3'>
                            Create an impact metric
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                            Follow this setup guide to implement and verify your
                            impact metric.{' '}
                            <Link
                                href='https://docs.getunleash.io/reference/impact-metrics'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                View docs
                            </Link>{' '}
                            for alternative ways to set it up.
                        </Typography>
                    </div>

                    {isDefineStage ? (
                        <>
                            <div>
                                <Typography variant='h3' component='h4'>
                                    Define your metric
                                </Typography>
                                <Typography
                                    variant='body2'
                                    color='text.secondary'
                                >
                                    Start by choosing a name and type for your
                                    metric. This will help you track the right
                                    data for your feature flags.
                                </Typography>
                            </div>
                            <DefineMetricForm
                                formId={formId}
                                onSubmitted={(name) => {
                                    setCreatedMetricName(name);
                                    setStage('success');
                                }}
                            />
                        </>
                    ) : (
                        <SuccessView metricName={createdMetricName} />
                    )}
                </Content>

                <Navigation>
                    {isDefineStage ? (
                        <>
                            <Button
                                variant='text'
                                color='inherit'
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                form={formId}
                                type='submit'
                                variant='contained'
                            >
                                Next step
                            </Button>
                        </>
                    ) : (
                        <Button variant='contained' onClick={onClose}>
                            Done
                        </Button>
                    )}
                </Navigation>
            </MainSection>
            {isLargeScreen ? <InfoSidebar /> : null}
        </StyledDialog>
    );
};

export const RegisterMetricDialog: FC<RegisterMetricDialogProps> = ({
    open,
    ...props
}) => {
    return open ? <InnerDialog {...props} /> : null;
};
