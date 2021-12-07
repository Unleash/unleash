import classnames from 'classnames';
import { Paper } from '@material-ui/core';
import PropTypes from 'prop-types';

import CheckIcon from '@material-ui/icons/Check';
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';

import styles from './ReportCard.module.scss';
import ReactTimeAgo from 'react-timeago';

const ReportCard = ({
    health,
    activeCount,
    staleCount,
    potentiallyStaleCount,
    lastUpdate,
}) => {
    const healthLessThan50 = health < 50;
    const healthLessThan75 = health < 75;

    const healthClasses = classnames(styles.reportCardHealthRating, {
        [styles.healthWarning]: healthLessThan75,
        [styles.healthDanger]: healthLessThan50,
    });

    const renderActiveToggles = () => (
        <>
            <CheckIcon className={styles.check} />
            <span>{activeCount} active toggles</span>
        </>
    );

    const renderStaleToggles = () => (
        <>
            <ReportProblemOutlinedIcon className={styles.danger} />
            <span>{staleCount} stale toggles</span>
        </>
    );

    const renderPotentiallyStaleToggles = () => (
        <>
            <ReportProblemOutlinedIcon className={styles.danger} />
            <span>{potentiallyStaleCount} potentially stale toggles</span>
        </>
    );

    return (
        <Paper className={styles.card}>
            <div className={styles.reportCardContainer}>
                <div className={styles.reportCardHealth}>
                    <h2 className={styles.header}>Health rating</h2>
                    <div className={styles.reportCardHealthInnerContainer}>
                        <ConditionallyRender
                            condition={health > -1}
                            show={
                                <div>
                                    <p className={healthClasses}>{health}%</p>
                                    <p className={styles.lastUpdate}>
                                        Last updated:{' '}
                                        <ReactTimeAgo
                                            date={lastUpdate}
                                            live={false}
                                        />
                                    </p>
                                </div>
                            }
                        />
                    </div>
                </div>
                <div className={styles.reportCardToggle}>
                    <h2 className={styles.header}>Toggle report</h2>
                    <ul className={styles.reportCardList}>
                        <li>
                            <ConditionallyRender
                                condition={activeCount}
                                show={renderActiveToggles}
                            />
                        </li>
                        <ConditionallyRender
                            condition={activeCount}
                            show={
                                <p className={styles.reportCardActionText}>
                                    Also includes potentially stale toggles.
                                </p>
                            }
                        />

                        <li>
                            <ConditionallyRender
                                condition={staleCount}
                                show={renderStaleToggles}
                            />
                        </li>
                    </ul>
                </div>

                <div className={styles.reportCardAction}>
                    <h2 className={styles.header}>Potential actions</h2>
                    <div className={styles.reportCardActionContainer}>
                        <ul className={styles.reportCardList}>
                            <li>
                                <ConditionallyRender
                                    condition={potentiallyStaleCount}
                                    show={renderPotentiallyStaleToggles}
                                />
                            </li>
                        </ul>
                        <ConditionallyRender
                            condition={potentiallyStaleCount}
                            show={
                                <p className={styles.reportCardActionText}>
                                    Review your feature toggles and delete
                                    unused toggles.
                                </p>
                            }
                            elseShow={
                                <p className={styles.reportCardNoActionText}>
                                    No action is required
                                </p>
                            }
                        />
                    </div>
                </div>
            </div>
        </Paper>
    );
};

ReportCard.propTypes = {
    features: PropTypes.array.isRequired,
};

export default ReportCard;
