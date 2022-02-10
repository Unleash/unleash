import { useStyles } from './ProjectInfo.styles';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import classnames from 'classnames';
import { Edit, ExpandMore } from '@material-ui/icons';

import { useCommonStyles } from '../../../../common.styles';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import PercentageCircle from '../../../common/PercentageCircle/PercentageCircle';
import PermissionIconButton from '../../../common/PermissionIconButton/PermissionIconButton';
import ConditionallyRender from '../../../common/ConditionallyRender';
import {
    Accordion,
    AccordionActions,
    AccordionDetails,
    AccordionSummary,
} from '@material-ui/core';
import { UPDATE_PROJECT } from '../../../providers/AccessProvider/permissions';

interface IProjectInfoProps {
    id: string;
    memberCount: number;
    featureCount: number;
    health: number;
    description: string;
}

const ProjectInfo = ({
    id,
    memberCount,
    health,
    description,
}: IProjectInfoProps) => {
    const commonStyles = useCommonStyles();
    const styles = useStyles();
    const { uiConfig } = useUiConfig();

    let link = `/admin/users`;

    if (uiConfig?.versionInfo?.current?.enterprise) {
        link = `/projects/${id}/access`;
    }

    const LONG_DESCRIPTION = 100;

    const permissionButtonClass = classnames({
        [styles.permissionButtonShortDesc]:
            description.length < LONG_DESCRIPTION,
    });
    const permissionButton = (
        <PermissionIconButton
            permission={UPDATE_PROJECT}
            tooltip={'Edit description'}
            projectId={id}
            component={Link}
            className={permissionButtonClass}
            data-loading
            to={`/projects/${id}/edit`}
        >
            <Edit />
        </PermissionIconButton>
    );

    return (
        <aside>
            <div className={styles.projectInfo}>
                <div className={styles.infoSection}>
                    <div className={styles.descriptionContainer}>
                        <ConditionallyRender
                            condition={Boolean(description)}
                            show={
                                <ConditionallyRender
                                    condition={
                                        description.length < LONG_DESCRIPTION
                                    }
                                    show={
                                        <p
                                            data-loading
                                            className={styles.description}
                                        >
                                            {description}
                                        </p>
                                    }
                                    elseShow={
                                        <Accordion className={styles.accordion}>
                                            <AccordionSummary
                                                expandIcon={<ExpandMore />}
                                                className={styles.accordionBody}
                                            >
                                                Description
                                            </AccordionSummary>
                                            <AccordionDetails
                                                className={styles.accordionBody}
                                            >
                                                {description}
                                            </AccordionDetails>
                                            <AccordionActions
                                                className={
                                                    styles.accordionActions
                                                }
                                            >
                                                Edit description{' '}
                                                {permissionButton}
                                            </AccordionActions>
                                        </Accordion>
                                    }
                                />
                            }
                            elseShow={
                                <p data-loading className={styles.description}>
                                    No description
                                </p>
                            }
                        />
                        <ConditionallyRender
                            condition={description.length < LONG_DESCRIPTION}
                            show={permissionButton}
                        />
                    </div>
                    <div className={styles.idContainer}>
                        <p data-loading>projectId: {id}</p>
                    </div>
                </div>

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
                            commonStyles.flexRow,
                            commonStyles.justifyCenter,
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
                            commonStyles.flexRow,
                            commonStyles.justifyCenter,
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
            </div>
        </aside>
    );
};

export default ProjectInfo;
