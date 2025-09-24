import type { FC } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { AggregationMode } from '../../../types.ts';

export type ModeSelectorProps = {
    value: AggregationMode;
    onChange: (mode: AggregationMode) => void;
    seriesType: 'counter' | 'gauge' | 'histogram' | 'unknown';
};

export const ModeSelector: FC<ModeSelectorProps> = ({
    value,
    onChange,
    seriesType,
}) => {
    if (seriesType === 'unknown') return null;
    return (
        <FormControl variant='outlined' size='small' sx={{ minWidth: 200 }}>
            <InputLabel id='mode-select-label'>Mode</InputLabel>
            <Select
                labelId='mode-select-label'
                value={value}
                onChange={(e) => onChange(e.target.value as AggregationMode)}
                label='Mode'
            >
                {seriesType === 'counter'
                    ? [
                          <MenuItem key='rps' value='rps'>
                              Rate per second
                          </MenuItem>,
                          <MenuItem key='count' value='count'>
                              Count
                          </MenuItem>,
                      ]
                    : seriesType === 'gauge'
                      ? [
                            <MenuItem key='avg' value='avg'>
                                Average
                            </MenuItem>,
                            <MenuItem key='sum' value='sum'>
                                Sum
                            </MenuItem>,
                        ]
                      : seriesType === 'histogram'
                        ? [
                              <MenuItem key='p50' value='p50'>
                                  50th percentile
                              </MenuItem>,
                              <MenuItem key='p95' value='p95'>
                                  95th percentile
                              </MenuItem>,
                              <MenuItem key='p99' value='p99'>
                                  99th percentile
                              </MenuItem>,
                          ]
                        : []}
            </Select>
        </FormControl>
    );
};
