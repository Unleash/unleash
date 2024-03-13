import { ConditionallyRender } from '../../common/ConditionallyRender/ConditionallyRender';
import { Banner } from '../Banner/Banner';
import { IBanner } from '../../../interfaces/banner';

export const OutdatedSdksBanner = () => {
    const displayOutdatedSdksBanner = false;
    const outdatedSdksBanner: IBanner = {
        message: `We noticed that you're using outdated SDKs. `,
        variant: 'warning',
        link: 'dialog',
        linkText: 'Please update those versions',
        dialogTitle: 'Outdated SDKs',
        dialog: <h1>Outdated SDKs</h1>,
    };
    return (
        <>
            <ConditionallyRender
                condition={displayOutdatedSdksBanner}
                show={<Banner banner={outdatedSdksBanner} />}
            />
        </>
    );
};
