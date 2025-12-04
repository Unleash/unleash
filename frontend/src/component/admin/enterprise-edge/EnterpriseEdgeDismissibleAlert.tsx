import {
    Alert,
    type AlertProps,
    Button,
    Collapse,
    styled,
    Typography,
} from '@mui/material';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { useUiFlag } from 'hooks/useUiFlag';
import { Link } from 'react-router-dom';
import { ReactComponent as EnterpriseEdgeCloud } from 'assets/img/enterpriseEdgeCloud.svg';

const StyledAlert = styled(Alert)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    '& > .MuiAlert-icon': {
        paddingBlock: '7px',
    },
    '& > .MuiAlert-message': {
        padding: theme.spacing(1),
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'space-between',
        width: '100%',
        gap: theme.spacing(1),
    },
    '&.MuiPaper-root': {
        backgroundColor: theme.palette.secondary.light,
        color: theme.palette.secondary.dark,
        border: `1px solid ${theme.palette.secondary.border}`,
        '& .MuiAlert-icon': {
            color: theme.palette.secondary.main,
        },
    },
}));

const StyledAlertBody = styled('div')(({ theme }) => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
}));

const StyledAlertBodyCol = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    gap: theme.spacing(1),
    flex: '1 1 auto',
}));

const StyledButton = styled(Button)(({ theme }) => ({
    '&&': {
        marginTop: theme.spacing(1),
        color: 'white',
    },
})) as typeof Button;

const StyledEnterpriseEdgeCloud = styled(EnterpriseEdgeCloud)(({ theme }) => ({
    flex: 0,
    width: 'auto',
    display: 'block',
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

interface IEnterpriseEdgeDismissibleAlertProps extends AlertProps {}

export const EnterpriseEdgeDismissibleAlert = ({
    ...props
}: IEnterpriseEdgeDismissibleAlertProps) => {
    const [alertState, setAlertState] = useLocalStorageState<'open' | 'closed'>(
        'enterpriseEdgeUIDismissibleAlert',
        'open',
    );
    const enterpriseEdgeUIEnabled = useUiFlag('enterpriseEdgeUI');

    if (!enterpriseEdgeUIEnabled) return null;

    return (
        <Collapse in={alertState === 'open'}>
            <StyledAlert
                onClose={() => setAlertState('closed')}
                icon={false}
                {...props}
            >
                <StyledAlertBody>
                    <StyledAlertBodyCol>
                        <Typography variant='h3'>
                            Want instant flag changes world wide?
                        </Typography>
                        <Typography variant='body2'>
                            There is no more need of wasting hours waiting for
                            your SDK to update. With Unleash Edge, flag changes
                            are instantly made available to your users.
                        </Typography>
                        <StyledButton
                            component={Link}
                            to='/admin/enterprise-edge'
                            variant='contained'
                        >
                            Check out Unleash Edge
                        </StyledButton>
                    </StyledAlertBodyCol>
                    <StyledAlertBodyCol sx={{ alignItems: 'end' }}>
                        <StyledEnterpriseEdgeCloud />
                    </StyledAlertBodyCol>
                </StyledAlertBody>
            </StyledAlert>
        </Collapse>
    );
};
