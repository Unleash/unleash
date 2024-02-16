import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { IncomingWebhooksTable } from './IncomingWebhooksTable/IncomingWebhooksTable';
import { IIncomingWebhook } from 'interfaces/incomingWebhook';

interface IIncomingWebhooksProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedIncomingWebhook?: IIncomingWebhook;
    setSelectedIncomingWebhook: React.Dispatch<
        React.SetStateAction<IIncomingWebhook | undefined>
    >;
}

export const IncomingWebhooks = ({
    modalOpen,
    setModalOpen,
    selectedIncomingWebhook,
    setSelectedIncomingWebhook,
}: IIncomingWebhooksProps) => {
    const { isEnterprise } = useUiConfig();

    if (!isEnterprise()) {
        return <PremiumFeature feature='incoming-webhooks' />;
    }

    return (
        <div>
            <PermissionGuard permissions={ADMIN}>
                <IncomingWebhooksTable
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    selectedIncomingWebhook={selectedIncomingWebhook}
                    setSelectedIncomingWebhook={setSelectedIncomingWebhook}
                />
            </PermissionGuard>
        </div>
    );
};
