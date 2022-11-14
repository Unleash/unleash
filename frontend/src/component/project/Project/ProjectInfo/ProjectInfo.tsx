import { useStyles } from './ProjectInfo.styles';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import classnames from 'classnames';

import { useThemeStyles } from 'themes/themeStyles';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { DEFAULT_PROJECT_ID } from '../../../../hooks/api/getters/useDefaultProject/useDefaultProjectId';

interface IProjectInfoProps {
    id: string;
    memberCount: number;
    featureCount: number;
    health: number;
    description?: string;
}

const ProjectInfo = ({
    id,
    memberCount,
    health,
    description,
}: IProjectInfoProps) => {
    const { classes: themeStyles } = useThemeStyles();
    const { classes: styles } = useStyles();
    const { uiConfig } = useUiConfig();

    let link = `/admin/users`;

    if (uiConfig?.versionInfo?.current?.enterprise) {
        link = `/projects/${id}/access`;
    }

    return (
        <aside>
            <div className={styles.projectInfo}>
                <div className={styles.infoSection}>
                    <div data-loading className={styles.percentageContainer}>
                        <PercentageCircle percentage={health} />
                    </div>
                    <p className={styles.subtitle} data-loading>
                        Overall health rating
                    </p>
                    <p className={styles.emphazisedText} data-loading>
                        {health}%
                    </p>
                    <Link
                        data-loading
                        className={classnames(
                            themeStyles.flexRow,
                            themeStyles.justifyCenter,
                            styles.infoLink
                        )}
                        to={`/projects/${id}/health`}
                    >
                        <span className={styles.linkText} data-loading>
                            view more{' '}
                        </span>
                        <ArrowForwardIcon
                            data-loading
                            className={styles.arrowIcon}
                        />
                    </Link>
                </div>
                <ConditionallyRender
                    condition={id !== DEFAULT_PROJECT_ID}
                    show={
                        <div
                            className={styles.infoSection}
                            style={{ marginBottom: '0' }}
                        >
                            <p className={styles.subtitle} data-loading>
                                Project members
                            </p>
                            <p data-loading className={styles.emphazisedText}>
                                {memberCount}
                            </p>
                            <Link
                                data-loading
                                className={classnames(
                                    themeStyles.flexRow,
                                    themeStyles.justifyCenter,
                                    styles.infoLink
                                )}
                                to={link}
                            >
                                <span className={styles.linkText} data-loading>
                                    view more{' '}
                                </span>
                                <ArrowForwardIcon
                                    data-loading
                                    className={styles.arrowIcon}
                                />
                            </Link>
                        </div>
                    }
                />
            </div>
        </aside>
    );
};

export default ProjectInfo;
