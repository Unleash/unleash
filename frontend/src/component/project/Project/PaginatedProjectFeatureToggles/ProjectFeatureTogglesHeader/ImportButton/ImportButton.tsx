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
                {/* size in em so the icon follows the icon-button's font size
                    (the theme's per-size icon scale) instead of its hardcoded
                    24px attrs — keeps it in line with MUI icons like Export */}
                <ImportSvg style={{ width: '1em', height: '1em' }} />
            </PermissionIconButton>
            <ImportModal
                open={modalOpen}
                setOpen={setModalOpen}
                project={projectId}
            />
        </>
    );
};
