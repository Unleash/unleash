import { styled } from '@mui/material';

const StyledBenefits = styled('ul')(({ theme }) => ({
    ...theme.typography.body2,
    listStyleType: 'square',
    paddingLeft: theme.spacing(2),
    margin: 0,
    '& li + li': { marginTop: theme.spacing(0.5) },
    '& li::marker': { color: theme.palette.primary.main },
}));

export const EnterpriseBenefits = () => (
    <StyledBenefits>
        <li>
            <strong>Unlimited projects and environments</strong>
        </li>
        <li>
            <strong>Priority support</strong> for managed and self-hosted
            options
        </li>
        <li>
            <strong>SSO/SCIM</strong> - streamlined access and account
            management
        </li>
        <li>
            <strong>RBAC</strong> - precise access control
        </li>
        <li>
            <strong>Change requests</strong> - reduce error risk with
            pull-request like experience
        </li>
    </StyledBenefits>
);
