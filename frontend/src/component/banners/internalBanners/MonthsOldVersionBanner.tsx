import { Banner } from '../Banner/Banner.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { parseValidDate } from 'component/common/util';
import { differenceInMonths } from 'date-fns';

export const MonthsOldVersionBanner = () => {
    const {
        uiConfig: { versionInfo },
    } = useUiConfig();

    if (!versionInfo?.buildDate) return null;

    const buildDate = parseValidDate(versionInfo.buildDate);

    if (!buildDate) return null;

    const monthsOld = differenceInMonths(new Date(), new Date(buildDate));

    const isOldBuild = monthsOld >= 3;

    if (!isOldBuild) return null;

    return (
        <Banner
            banner={{
                message: `Your Unleash version is ${monthsOld} months old. Please consider upgrading.`,
                variant: 'warning',
                link: 'https://github.com/Unleash/unleash/releases',
                linkText: 'Changelog',
            }}
        />
    );
};
