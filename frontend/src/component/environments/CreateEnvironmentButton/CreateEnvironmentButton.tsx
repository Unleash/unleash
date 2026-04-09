import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import Add from '@mui/icons-material/Add';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { useNavigate } from 'react-router-dom';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import ProPlanIcon from 'assets/icons/pro-enterprise-feature-badge.svg?react';
import ProPlanIconLight from 'assets/icons/pro-enterprise-feature-badge-light.svg?react';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { useUiFlag } from 'hooks/useUiFlag';

export const CreateEnvironmentButton = () => {
    const navigate = useNavigate();
    const disabled = !useUiFlag('EEA');

    const endIcon = disabled ? (
        <ThemeMode
            darkmode={<ProPlanIconLight />}
            lightmode={<ProPlanIcon />}
        />
    ) : undefined;

    const tooltipProps = disabled
        ? {
              titleComponent: <PremiumFeature feature='environments' tooltip />,
              sx: { maxWidth: '320px' },
              variant: 'custom' as const,
          }
        : undefined;

    return (
        <ResponsiveButton
            onClick={() => navigate('/environments/create')}
            maxWidth='700px'
            Icon={Add}
            permission={ADMIN}
            disabled={disabled}
            endIcon={endIcon}
            tooltipProps={tooltipProps}
        >
            New environment
        </ResponsiveButton>
    );
};
