import { Alert, Collapse, Link, styled } from '@mui/material';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import type { FC } from 'react';

const StyledContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2, 2),
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
}));

export const CidrSdkRequirements: FC = () => {
    const [state, setState] = useLocalStorageState<'open' | 'closed'>(
        'cidrSdkVersionAlert',
        'open',
    );
    const open = state === 'open';

    return (
        <StyledContainer>
            <Collapse in={open}>
                <StyledAlert
                    severity='info'
                    icon={false}
                    onClose={() => setState('closed')}
                >
                    IP constraints require these SDK versions or newer: Node.js
                    6.11.0, Java 12.3.0, Ruby 6.7.1, Python 6.7.0, .NET 6.2.0,
                    Go 6.4.0, Rust 0.16.0 - or a frontend SDK connected to
                    Unleash or Unleash Enterprise Edge 20.2.0. Not supported in
                    PHP.
                </StyledAlert>
            </Collapse>
            {open ? null : (
                <Link
                    component='button'
                    variant='body2'
                    onClick={() => setState('open')}
                >
                    View SDK requirements
                </Link>
            )}
        </StyledContainer>
    );
};
