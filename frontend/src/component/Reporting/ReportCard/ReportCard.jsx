import React from 'react';
import classnames from 'classnames';
import { Paper } from '@material-ui/core';
import PropTypes from 'prop-types';

import CheckIcon from '@material-ui/icons/Check';
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';

import { isFeatureExpired } from '../utils';

import styles from './ReportCard.module.scss';

const ReportCard = ({ features }) => {
    const getActiveToggles = () => {
        const result = features.filter(feature => !feature.stale);

        if (result === 0) return 0;

        return result;
    };

    const getPotentiallyStaleToggles = activeToggles => {
        const result = activeToggles.filter(
            feature => isFeatureExpired(feature) && !feature.stale
        );

        return result;
    };

    const getHealthRating = (
        total,
        staleTogglesCount,
        potentiallyStaleTogglesCount
    ) => {
        const startPercentage = 100;

        const stalePercentage = (staleTogglesCount / total) * 100;

        const potentiallyStalePercentage =
            (potentiallyStaleTogglesCount / total) * 100;

        return Math.round(
            startPercentage - stalePercentage - potentiallyStalePercentage
        );
    };

    const total = features.length;
    const activeTogglesArray = getActiveToggles();
    const potentiallyStaleToggles =
        getPotentiallyStaleToggles(activeTogglesArray);

    const activeTogglesCount = activeTogglesArray.length;
    const staleTogglesCount = features.length - activeTogglesCount;
    const potentiallyStaleTogglesCount = potentiallyStaleToggles.length;

    const healthRating = getHealthRating(
        total,
        staleTogglesCount,
        potentiallyStaleTogglesCount
    );

    const healthLessThan50 = healthRating < 50;
    const healthLessThan75 = healthRating < 75;

    const healthClasses = classnames(styles.reportCardHealthRating, {
        [styles.healthWarning]: healthLessThan75,
        [styles.healthDanger]: healthLessThan50,
    });

    const renderActiveToggles = () => (
        <>
            <CheckIcon className={styles.check} />
            <span>{activeTogglesCount} active toggles</span>
        </>
    );

    const renderStaleToggles = () => (
        <>
            <ReportProblemOutlinedIcon className={styles.danger} />
            <span>{staleTogglesCount} stale toggles</span>
        </>
    );

    const renderPotentiallyStaleToggles = () => (
        <>
            <ReportProblemOutlinedIcon className={styles.danger} />
            <span>
                {potentiallyStaleTogglesCount} potentially stale toggles
            </span>
        </>
    );

    return (
        <Paper className={styles.card}>
            <div className={styles.reportCardContainer}>
                <div className={styles.reportCardHealth}>
                    <h2 className={styles.header}>Health rating</h2>
                    <div className={styles.reportCardHealthInnerContainer}>
                        <ConditionallyRender
                            condition={healthRating > -1}
                            show={
                                <p className={healthClasses}>{healthRating}%</p>
                            }
                        />
                    </div>
                </div>
                <div className={styles.reportCardListContainer}>
                    <h2 className={styles.header}>Toggle report</h2>
                    <ul className={styles.reportCardList}>
                        <li>
                            <ConditionallyRender
                                condition={activeTogglesCount}
                                show={renderActiveToggles}
                            />
                        </li>
                        <li>
                            <ConditionallyRender
                                condition={staleTogglesCount}
                                show={renderStaleToggles}
                            />
                        </li>
                        <li>
                            <ConditionallyRender
                                condition={potentiallyStaleTogglesCount}
                                show={renderPotentiallyStaleToggles}
                            />
                        </li>
                    </ul>
                </div>

                <div className={styles.reportCardAction}>
                    <h2 className={styles.header}>Potential actions</h2>
                    <div className={styles.reportCardActionContainer}>
                        <p className={styles.reportCardActionText}>
                            Review your feature toggles and delete unused
                            toggles.
                        </p>
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
