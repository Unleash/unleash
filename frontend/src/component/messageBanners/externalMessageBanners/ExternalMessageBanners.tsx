import {
    IMessageBanner,
    MessageBanner,
} from 'component/messageBanners/MessageBanner/MessageBanner';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useVariant } from 'hooks/useVariant';

export const ExternalMessageBanners = () => {
    const { uiConfig } = useUiConfig();

    const messageBannerVariant =
        useVariant<IMessageBanner | IMessageBanner[]>(
            uiConfig.flags.messageBanner,
        ) || [];

    const messageBanners: IMessageBanner[] = Array.isArray(messageBannerVariant)
        ? messageBannerVariant
        : [messageBannerVariant];

    return (
        <>
            {messageBanners.map((messageBanner) => (
                <MessageBanner
                    key={messageBanner.message}
                    messageBanner={messageBanner}
                />
            ))}
        </>
    );
};
