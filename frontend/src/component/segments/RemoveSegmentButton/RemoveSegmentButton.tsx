import type { ISegment } from 'interfaces/segment';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import {
    DELETE_SEGMENT,
    UPDATE_PROJECT_SEGMENT,
} from 'component/providers/AccessProvider/permissions';
import Delete from '@mui/icons-material/Delete';
import { SEGMENT_DELETE_BTN_ID } from 'utils/testIds';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useToast from 'hooks/useToast';
import { SegmentDelete } from 'component/segments/SegmentDelete/SegmentDelete';
import { useSegmentsApi } from 'hooks/api/actions/useSegmentsApi/useSegmentsApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useState } from 'react';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';
import { useHighestPermissionChangeRequestEnvironment } from 'hooks/useHighestPermissionChangeRequestEnvironment';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { useTracking } from 'hooks/useTracking';
import type { Tracking } from 'utils/trackingEvents';
import { segmentTrackingProps } from 'component/segments/segmentTrackingProps';

interface IRemoveSegmentButtonProps {
    segment: ISegment;
}

export const RemoveSegmentButton = ({ segment }: IRemoveSegmentButtonProps) => {
    const projectId = useOptionalPathParam('projectId');
    const { refetchSegments } = useSegments();
    const { deleteSegment } = useSegmentsApi();
    const { setToastData, setToastApiError } = useToast();
    const [showModal, toggleModal] = useState(false);
    const highestPermissionChangeRequestEnv =
        useHighestPermissionChangeRequestEnvironment(segment?.project);
    const changeRequestEnv = highestPermissionChangeRequestEnv();
    const { addChange } = useChangeRequestApi();
    const tracking: Tracking = {
        event: 'segments',
        type: 'deleted',
        props: {
            ...segmentTrackingProps(segment),
            viaChangeRequest: Boolean(changeRequestEnv && segment.project),
        },
    };
    const { trackMutation } = useTracking(tracking);

    const onRemove = async () => {
        const changeRequest =
            changeRequestEnv && segment.project
                ? { project: segment.project, environment: changeRequestEnv }
                : undefined;

        try {
            await trackMutation(async () => {
                if (changeRequest) {
                    await addChange(
                        changeRequest.project,
                        changeRequest.environment,
                        {
                            action: 'deleteSegment',
                            feature: null,
                            payload: { id: segment.id },
                        },
                    );
                } else {
                    await deleteSegment(segment.id);
                }
            });

            await refetchSegments();
            setToastData({
                text: `Segment ${
                    changeRequestEnv ? 'change added to draft' : 'deleted'
                }`,
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            toggleModal(false);
        }
    };

    return (
        <>
            <PermissionIconButton
                onClick={() => toggleModal(true)}
                permission={[DELETE_SEGMENT, UPDATE_PROJECT_SEGMENT]}
                projectId={projectId}
                tooltipProps={{ title: 'Remove segment' }}
                data-testid={`${SEGMENT_DELETE_BTN_ID}_${segment.name}`}
            >
                <Delete data-loading />
            </PermissionIconButton>
            <ConditionallyRender
                condition={showModal}
                show={() => (
                    <SegmentDelete
                        segment={segment}
                        open={showModal}
                        onClose={() => toggleModal(false)}
                        onRemove={onRemove}
                        tracking={tracking}
                        title={changeRequestEnv ? 'Add to draft' : 'Save'}
                    />
                )}
            />
        </>
    );
};
