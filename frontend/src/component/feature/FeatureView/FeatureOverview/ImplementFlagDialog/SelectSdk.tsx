import {
    Divider,
    ListSubheader,
    MenuItem,
    Select,
    styled,
} from '@mui/material';
import { allSdks, type SdkName } from 'component/onboarding/dialog/sharedTypes';

const StyledSelect = styled(Select)({ minWidth: 120, maxWidth: 240 });

interface SelectSdkProps {
    projectSdks: SdkName[];
    value: SdkName;
    onChange: (sdk: SdkName) => void;
}

export const SelectSdk = ({ projectSdks, value, onChange }: SelectSdkProps) => {
    const otherSdks = allSdks.filter((sdk) => !projectSdks.includes(sdk.name));

    return (
        <StyledSelect
            value={value}
            onChange={(event) => onChange(event.target.value as SdkName)}
            size='small'
        >
            {projectSdks.length > 0
                ? [
                      <ListSubheader key='project-header'>
                          Project SDKs
                      </ListSubheader>,
                      ...projectSdks.map((name) => (
                          <MenuItem key={name} value={name}>
                              {name}
                          </MenuItem>
                      )),
                      ...(otherSdks.length > 0
                          ? [
                                <Divider key='divider' />,
                                <ListSubheader key='other-header'>
                                    Other SDKs
                                </ListSubheader>,
                                ...otherSdks.map((sdk) => (
                                    <MenuItem key={sdk.name} value={sdk.name}>
                                        {sdk.name}
                                    </MenuItem>
                                )),
                            ]
                          : []),
                  ]
                : allSdks.map((sdk) => (
                      <MenuItem key={sdk.name} value={sdk.name}>
                          {sdk.name}
                      </MenuItem>
                  ))}
        </StyledSelect>
    );
};
