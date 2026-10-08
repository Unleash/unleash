import { styled } from '@mui/material';
import pattern from 'assets/img/inviteSignup/pattern.png';
import GdprLogo from 'assets/img/inviteSignup/gdpr.svg?react';
import Soc2Logo from 'assets/img/inviteSignup/soc2.svg?react';
import visa from 'assets/img/inviteSignup/companies/visa.png';
import lloyds from 'assets/img/inviteSignup/companies/lloyds.png';
import wayfair from 'assets/img/inviteSignup/companies/wayfair.png';
import emirates from 'assets/img/inviteSignup/companies/emirates.png';
import onePassword from 'assets/img/inviteSignup/companies/1password.png';
import cargill from 'assets/img/inviteSignup/companies/cargill.png';
import docker from 'assets/img/inviteSignup/companies/docker.png';
import samsung from 'assets/img/inviteSignup/companies/samsung.png';
import prudential from 'assets/img/inviteSignup/companies/prudential.png';
import { formatAssetPath } from 'utils/formatPath';

const DARK_TEAL = '#1A4049';
const MINT = '#98E3AD';

const companies = [
    { name: 'Visa', src: visa, scale: 0.9 },
    { name: 'Lloyds Bank', src: lloyds, scale: 1.5 },
    { name: 'Wayfair', src: wayfair, scale: 1 },
    { name: 'Emirates', src: emirates, scale: 2 },
    { name: '1Password', src: onePassword, scale: 1 },
    { name: 'Cargill', src: cargill, scale: 1.4 },
    { name: 'Docker', src: docker, scale: 1 },
    { name: 'Samsung', src: samsung, scale: 1.4 },
    { name: 'Prudential', src: prudential, scale: 1.2 },
];

const StyledPanel = styled('aside')(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: theme.palette.primary.light,
    padding: theme.spacing(6, 4),
    [theme.breakpoints.down('sm')]: {
        display: 'none',
    },
    [theme.breakpoints.up('lg')]: {
        width: '50%',
        padding: theme.spacing(6, 4, 12),
    },
}));

const StyledPattern = styled('img')({
    position: 'absolute',
    bottom: 0,
    right: 0,
    height: '100%',
    mixBlendMode: 'screen',
    pointerEvents: 'none',
});

const StyledCompanyBox = styled('div')(({ theme }) => ({
    position: 'relative',
    width: '100%',
    maxWidth: 508,
    backgroundColor: DARK_TEAL,
    color: theme.palette.common.white,
}));

const StyledHeading = styled('h2')(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(2, 3, 0),
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightRegular,
    lineHeight: '22px',
    opacity: 0.8,
}));

const StyledDivider = styled('hr')(({ theme }) => ({
    margin: theme.spacing(2, 0.25, 0),
    border: 0,
    borderTop: '2px solid rgba(19, 29, 32, 0.2)',
}));

const StyledLogoGrid = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    margin: 0,
    padding: theme.spacing(4, 3, 4),
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    rowGap: theme.spacing(5),
    columnGap: theme.spacing(3),
    opacity: 0.8,
    [theme.breakpoints.up('lg')]: {
        paddingBottom: theme.spacing(13),
    },
}));

const StyledLogoItem = styled('li')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
});

const StyledLogo = styled('img')({
    maxHeight: '100%',
    width: 'auto',
    objectFit: 'contain',
});

const StyledBadge = styled('div')(({ theme }) => ({
    position: 'relative',
    width: 316,
    maxWidth: `calc(100% - ${theme.spacing(3)})`,
    marginLeft: 'auto',
    marginRight: theme.spacing(-3),
    backgroundColor: MINT,
    color: DARK_TEAL,
    [theme.breakpoints.up('lg')]: {
        position: 'absolute',
        right: theme.spacing(4.5),
        bottom: theme.spacing(-9),
        margin: 0,
    },
}));

const StyledBadgeSquare = styled('div')({
    position: 'absolute',
    top: -16,
    left: -16,
    width: 16,
    height: 16,
    backgroundColor: MINT,
});

const StyledComplianceRow = styled('div')({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    borderBottom: `1px solid ${DARK_TEAL}`,
});

const StyledCompliance = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1.75),
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    '&:first-of-type': {
        borderRight: `1px solid ${DARK_TEAL}`,
    },
    '& svg': {
        width: 26,
        height: 26,
        flexShrink: 0,
    },
}));

const StyledPrivacy = styled('p')(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(1.25, 2, 1.5),
    fontSize: theme.typography.body2.fontSize,
    lineHeight: '20px',
    '& strong': {
        fontWeight: theme.typography.fontWeightBold,
    },
}));

export const GoodCompanyPanel = () => (
    <StyledPanel>
        <StyledPattern src={formatAssetPath(pattern)} alt='' />
        <StyledCompanyBox>
            <StyledHeading>YOU’LL BE IN GOOD COMPANY/</StyledHeading>
            <StyledDivider />
            <StyledLogoGrid>
                {companies.map(({ name, src, scale }) => (
                    <StyledLogoItem key={name}>
                        <StyledLogo
                            src={formatAssetPath(src)}
                            alt={name}
                            sx={{ transform: `scale(${scale})` }}
                        />
                    </StyledLogoItem>
                ))}
            </StyledLogoGrid>
            <StyledBadge>
                <StyledBadgeSquare />
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
                    <strong>Private by design/</strong> End-user data never
                    leaves your application.
                </StyledPrivacy>
            </StyledBadge>
        </StyledCompanyBox>
    </StyledPanel>
);
