import React, { VFC } from 'react';
import { Box } from '@mui/material';
import { ChangeRequestFeatureToggleChange } from '../ChangeRequestOverview/ChangeRequestFeatureToggleChange/ChangeRequestFeatureToggleChange';
import type { IChangeRequest } from '../changeRequest.types';
import { Change } from './Change/Change';
import { DiscardContainer } from './Change/Discard';

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
                <ChangeRequestFeatureToggleChange
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
                </ChangeRequestFeatureToggleChange>
            ))}
        </Box>
    );
};
