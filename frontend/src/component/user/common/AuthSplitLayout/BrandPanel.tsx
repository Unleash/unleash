import { styled } from '@mui/material';
import pattern from 'assets/img/inviteSignup/pattern.png';
import GdprLogo from 'assets/img/inviteSignup/gdpr.svg?react';
import Soc2Logo from 'assets/img/inviteSignup/soc2.svg?react';
import { formatAssetPath } from 'utils/formatPath';

const MINT = '#98E3AD';

const StyledPanel = styled('aside')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6, 4),
    backgroundColor: theme.palette.primary.light,
    backgroundImage: `url(${formatAssetPath(pattern)})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'bottom right',
    backgroundSize: 'auto 100%',
    backgroundBlendMode: 'screen',
    [theme.breakpoints.down('sm')]: {
        display: 'none',
    },
    [theme.breakpoints.up('lg')]: {
        width: '50%',
    },
}));

const StyledBadge = styled('div')(({ theme }) => ({
    position: 'relative',
    width: 316,
    maxWidth: '100%',
    backgroundColor: MINT,
    color: theme.palette.web.main,
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -16,
        left: -16,
        width: 16,
        height: 16,
        backgroundColor: MINT,
    },
}));

const StyledComplianceRow = styled('div')(({ theme }) => ({
    display: 'flex',
    borderBottom: `1px solid ${theme.palette.web.main}`,
}));

const StyledCompliance = styled('div')(({ theme }) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1.5),
    whiteSpace: 'nowrap',
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    '& + &': {
        borderLeft: `1px solid ${theme.palette.web.main}`,
    },
    '& svg': {
        width: 24,
        height: 24,
    },
}));

const StyledPrivacy = styled('p')(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(1.5, 2),
    fontSize: theme.typography.body2.fontSize,
    lineHeight: '20px',
}));

export const BrandPanel = () => (
    <StyledPanel>
        <StyledBadge>
            <StyledComplianceRow>
                <StyledCompliance>
                    <GdprLogo aria-hidden />
                    GDPR compliant
                </StyledCompliance>
                <StyledCompliance>
                    <Soc2Logo aria-hidden />
                    SOC2 compliant
                </StyledCompliance>
            </StyledComplianceRow>
            <StyledPrivacy>
                <strong>Private by design/</strong> End-user data never leaves
                your application.
            </StyledPrivacy>
        </StyledBadge>
    </StyledPanel>
);
