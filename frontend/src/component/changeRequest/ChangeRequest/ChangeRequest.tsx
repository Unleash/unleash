import React, { VFC } from 'react';
import { Box } from '@mui/material';
import type { IChangeRequest } from '../changeRequest.types';
import { FeatureToggleChanges } from './Changes/FeatureToggleChanges';
import { Change } from './Changes/Change/Change';
import { DiscardContainer } from './Changes/Change/Discard';

interface IChangeRequestProps {
    changeRequest: IChangeRequest;
    onRefetch?: () => void;
    onNavigate?: () => void;
}

export const ChangeRequest: VFC<IChangeRequestProps> = ({
    changeRequest,
    onRefetch,
    onNavigate,
}) => {
    return (
        <Box>
            {changeRequest.features?.map(feature => (
                <FeatureToggleChanges
                    key={feature.name}
                    featureName={feature.name}
                    projectId={changeRequest.project}
                    onNavigate={onNavigate}
                    conflict={feature.conflict}
                >
                    {feature.changes.map((change, index) => (
                        <Change
                            key={index}
                            discard={
                                <DiscardContainer
                                    changeRequest={changeRequest}
                                    changeId={change.id}
                                    onPostDiscard={onRefetch}
                                />
                            }
                            index={index}
                            changeRequest={changeRequest}
                            change={change}
                            feature={feature}
                        />
                    ))}
                </FeatureToggleChanges>
            ))}
        </Box>
    );
};
