import { type FC, useState } from 'react';
import ImportSvg from 'assets/icons/import.svg?react';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE } from '@server/types/permissions';

import { ImportModal } from '../../../Import/ImportModal.tsx';
import { IMPORT_BUTTON } from 'utils/testIds';

type ImportButtonProps = {};

export const ImportButton: FC<ImportButtonProps> = () => {
    const projectId = useRequiredPathParam('projectId');
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <PermissionIconButton
                permission={UPDATE_FEATURE}
                projectId={projectId}
                onClick={() => setModalOpen(true)}
                tooltipProps={{ title: 'Import' }}
                data-testid={IMPORT_BUTTON}
                data-loading-project
            >
                <ImportSvg />
            </PermissionIconButton>
            <ImportModal
                open={modalOpen}
                setOpen={setModalOpen}
                project={projectId}
            />
        </>
    );
};
