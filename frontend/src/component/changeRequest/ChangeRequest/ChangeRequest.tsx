import React, { VFC } from 'react';
import { Box, Typography } from '@mui/material';
import type { IChangeRequest } from '../changeRequest.types';
import { FeatureToggleChanges } from './Changes/FeatureToggleChanges';
import { Change } from './Changes/Change/Change';
import { ChangeActions } from './Changes/Change/ChangeActions';

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
                                <ChangeActions
                                    changeRequest={changeRequest}
                                    feature={feature.name}
                                    change={change}
                                    onRefetch={onRefetch}
                                />
                            }
                            index={index}
                            changeRequest={changeRequest}
                            change={change}
                            feature={feature}
                        />
                    ))}
                    {feature.defaultChange ? (
                        <Change
                            discard={
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {feature.defaultChange.action ===
                                    'addStrategy'
                                        ? 'Default strategy will be added'
                                        : 'Feature status will change'}
                                </Typography>
                            }
                            index={feature.changes.length}
                            changeRequest={changeRequest}
                            change={feature.defaultChange}
                            feature={feature}
                        />
                    ) : null}
                </FeatureToggleChanges>
            ))}
        </Box>
    );
};
