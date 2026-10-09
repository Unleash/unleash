import { alpha, styled } from '@mui/material';
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

const MINT = '#98E3AD';

const companies = [
    { name: 'Visa', src: visa, height: 20 },
    { name: 'Lloyds Bank', src: lloyds, height: 36 },
    { name: 'Wayfair', src: wayfair, height: 24 },
    { name: 'Emirates', src: emirates, height: 48 },
    { name: '1Password', src: onePassword, height: 24 },
    { name: 'Cargill', src: cargill, height: 32 },
    { name: 'Docker', src: docker, height: 24 },
    { name: 'Samsung', src: samsung, height: 32 },
    { name: 'Prudential', src: prudential, height: 28 },
];

const StyledPanel = styled('aside')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6, 4, 12),
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

const StyledCompanyBox = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: 508,
    backgroundColor: theme.palette.web.main,
    color: theme.palette.web.contrastText,
}));

const StyledHeading = styled('h2')(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(2, 3),
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightRegular,
    lineHeight: '22px',
    opacity: 0.8,
    borderBottom: `2px solid ${alpha(theme.palette.common.black, 0.2)}`,
}));

const StyledLogoList = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    margin: 0,
    padding: theme.spacing(4, 3),
    display: 'flex',
    flexWrap: 'wrap',
    rowGap: theme.spacing(2),
    opacity: 0.8,
}));

const StyledLogoItem = styled('li')({
    flex: '0 0 33.333%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
});

const StyledBadge = styled('div')(({ theme }) => ({
    position: 'relative',
    alignSelf: 'flex-end',
    width: 316,
    maxWidth: '100%',
    marginRight: theme.spacing(4),
    marginBottom: theme.spacing(-9),
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

export const GoodCompanyPanel = () => (
    <StyledPanel>
        <StyledCompanyBox>
            <StyledHeading>YOU’LL BE IN GOOD COMPANY/</StyledHeading>
            <StyledLogoList>
                {companies.map(({ name, src, height }) => (
                    <StyledLogoItem key={name}>
                        <img
                            src={formatAssetPath(src)}
                            alt={name}
                            height={height}
                        />
                    </StyledLogoItem>
                ))}
            </StyledLogoList>
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
                    <strong>Private by design/</strong> End-user data never
                    leaves your application.
                </StyledPrivacy>
            </StyledBadge>
        </StyledCompanyBox>
    </StyledPanel>
);
