import { useState, useEffect, useContext } from 'react';
import * as jsonpatch from 'fast-json-patch';
import { TextField } from '@material-ui/core';
import PermissionButton from '../../../../common/PermissionButton/PermissionButton';
import FeatureTypeSelect from './FeatureTypeSelect/FeatureTypeSelect';
import { useParams } from 'react-router';
import AccessContext from '../../../../../contexts/AccessContext';
import { UPDATE_FEATURE } from '../../../../AccessProvider/permissions';
import useFeature from '../../../../../hooks/api/getters/useFeature/useFeature';
import { IFeatureViewParams } from '../../../../../interfaces/params';
import useToast from '../../../../../hooks/useToast';
import useFeatureApi from '../../../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import ConditionallyRender from '../../../../common/ConditionallyRender';

const FeatureSettingsMetadata = () => {
    const { hasAccess } = useContext(AccessContext);
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { refetch, feature } = useFeature(projectId, featureId);
    const [description, setDescription] = useState(feature.description);
    const [type, setType] = useState(feature.type);
    const editable = hasAccess(UPDATE_FEATURE, projectId);
    const { toast, setToastData } = useToast();
    const [dirty, setDirty] = useState(false);
    const { patchFeatureToggle } = useFeatureApi();

    useEffect(() => {
        setType(feature.type);
        setDescription(feature.description);
    }, [feature]);

    useEffect(() => {
        if (description !== feature.description || type !== feature.type) {
            setDirty(true);
            return;
        }
        setDirty(false);
        /* eslint-disable-next-line */
    }, [description, type]);

    const createPatch = () => {
        const comparison = { ...feature, type, description };
        const patch = jsonpatch.compare(feature, comparison);
        return patch;
    };

    const handleSubmit = async () => {
        try {
            const patch = createPatch();
            await patchFeatureToggle(projectId, featureId, patch);
            setToastData({
                show: true,
                type: 'success',
                text: 'Successfully updated feature toggle metadata',
            });
            setDirty(false);
            refetch();
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
        }
    };

    return (
        <>
            <FeatureTypeSelect
                value={type}
                id="feature-type-select"
                onChange={e => setType(e.target.value)}
                label="Feature type"
                editable={editable}
            />

            <TextField
                label="Description"
                required
                multiline
                rows={4}
                variant="outlined"
                value={description}
                onChange={e => setDescription(e.target.value)}
            />
            <ConditionallyRender
                condition={dirty}
                show={
                    <PermissionButton
                        tooltip="Save changes"
                        permission={UPDATE_FEATURE}
                        onClick={handleSubmit}
                    >
                        Save changes
                    </PermissionButton>
                }
            />

            {toast}
        </>
    );
};

export default FeatureSettingsMetadata;
