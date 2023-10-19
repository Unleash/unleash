import { MessageBanner } from 'component/messageBanners/MessageBanner/MessageBanner';
import { useMessageBanners } from 'hooks/api/getters/useMessageBanners/useMessageBanners';

export const InternalMessageBanners = () => {
    const { messageBanners } = useMessageBanners();

    return (
        <>
            {messageBanners.map((messageBanner) => (
                <MessageBanner
                    key={messageBanner.id}
                    messageBanner={messageBanner}
                />
            ))}
        </>
    );
};
