import { Link, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { trialHasExpired } from 'utils/instanceTrial';
import { parseISO } from 'date-fns';
import { formatDateYMD } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';

const formatTrialExpiry = (locale: string, trialExpiry?: string): string => {
    if (!trialExpiry) return '';

    return formatDateYMD(parseISO(trialExpiry), locale);
};

export const TrialUpsellDescription = () => {
    const { instanceStatus } = useInstanceStatus();
    const { locationSettings } = useLocationSettings();

    const trialExpiry = instanceStatus?.trialExpiry;
    const trialExpired = trialHasExpired(instanceStatus);
    const locale = locationSettings?.locale;

    const expiryText = trialExpiry
        ? `on ${formatTrialExpiry(locale, trialExpiry)}`
        : 'soon';

    const descriptionText = trialExpired
        ? 'Your free trial has expired and your account is scheduled for deletion. Upgrade to preserve your projects and feature flags.'
        : `Your trial expires ${expiryText}. Upgrade now to get uninterrupted usage of Unleash.`;

    return (
        <Typography variant='body2'>
            {descriptionText}{' '}
            <Link
                href='https://www.getunleash.io/pricing'
                target='_blank'
                rel='noreferrer'
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                }}
            >
                View full pricing
                <OpenInNewIcon fontSize='inherit' />
            </Link>
        </Typography>
    );
};
