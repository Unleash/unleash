import React from 'react';
import { useParams } from 'react-router-dom';
import { FeatureEventHistory } from '../FeatureEventHistory/FeatureEventHistory';

export const FeatureEventHistoryPage = () => {
    const { toggleName } = useParams<{ toggleName: string }>();

    return <FeatureEventHistory toggleName={toggleName} />;
};
