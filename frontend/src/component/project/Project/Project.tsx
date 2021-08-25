import { useParams } from 'react-router';
import { useCommonStyles } from '../../../common.styles';
import useProject from '../../../hooks/api/getters/useProject/useProject';
import useLoading from '../../../hooks/useLoading';
import ApiError from '../../common/ApiError/ApiError';
import ConditionallyRender from '../../common/ConditionallyRender';
import ProjectFeatureToggles from './ProjectFeatureToggles/ProjectFeatureToggles';
import ProjectInfo from './ProjectInfo/ProjectInfo';
import { useStyles } from './Project.styles';
import { IconButton } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import useToast from '../../../hooks/useToast';
import useQueryParams from '../../../hooks/useQueryParams';
import { useEffect } from 'react';
import { getProjectEditPath } from '../../../utils/route-path-helpers';

const Project = () => {
    const { id } = useParams<{ id: string }>();
    const params = useQueryParams();
    const { project, error, loading, refetch } = useProject(id);
    const ref = useLoading(loading);
    const { toast, setToastData } = useToast();
    const { members, features, health } = project;
    const commonStyles = useCommonStyles();
    const styles = useStyles();

    useEffect(() => {
        const created = params.get('created');
        const edited = params.get('edited');

        if (created || edited) {
            const text = created ? 'Project created' : 'Project updated';
            setToastData({
                show: true,
                type: 'success',
                text,
            });
        }
        /* eslint-disable-next-line */
    }, []);

    return (
        <div ref={ref}>
            <h1 data-loading className={commonStyles.title}>
                {project?.name}{' '}
                <IconButton component={Link} to={getProjectEditPath(id)}>
                    <Edit />
                </IconButton>
            </h1>
            <ConditionallyRender
                condition={error}
                show={
                    <ApiError
                        data-loading
                        style={{ maxWidth: '400px', marginTop: '1rem' }}
                        onClick={refetch}
                        text="Could not fetch project"
                    />
                }
            />
            <div className={styles.containerStyles}>
                <ProjectInfo
                    id={id}
                    memberCount={members}
                    health={health}
                    featureCount={features?.length}
                />
                <ProjectFeatureToggles features={features} loading={loading} />
            </div>
            {toast}
        </div>
    );
};

export default Project;
