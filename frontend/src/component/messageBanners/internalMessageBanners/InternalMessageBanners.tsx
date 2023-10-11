import { MessageBanner } from 'component/common/MessageBanner/MessageBanner';
import { useUiFlag } from 'hooks/useUiFlag';

export const InternalMessageBanners = () => {
    const internalMessageBanners = useUiFlag('internalMessageBanners');

    if (!internalMessageBanners) return null;

    // TODO: Implement. `messageBanners` should come from a `useMessageBanners()` hook.

    const mockMessageBanners = [
        {
            message: 'Test 1',
        },
        {
            message: 'Test 2',
        },
        {
            message: 'Test 3',
        },
    ];

    return (
        <>
            {mockMessageBanners.map((messageBanner) => (
                <MessageBanner key={messageBanner.message} />
            ))}
        </>
    );
};
