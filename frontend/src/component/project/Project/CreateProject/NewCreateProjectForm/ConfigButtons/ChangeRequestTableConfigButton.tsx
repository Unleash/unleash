import { type FC, useState, useMemo } from 'react';
import { InputAdornment } from '@mui/material';
import Search from '@mui/icons-material/Search';
import { ChangeRequestTable } from './ChangeRequestTable.tsx';
import {
    ScrollContainer,
    TableSearchInput,
} from './ChangeRequestTableConfigButton.styles';
import {
    ConfigButton,
    type ConfigButtonProps,
} from 'component/common/DialogFormTemplate/ConfigButtons/ConfigButton';

type ChangeRequestTableConfigButtonProps = Pick<
    ConfigButtonProps,
    'button' | 'onOpen' | 'onClose' | 'description' | 'tooltip'
> & {
    search: {
        label: string;
        placeholder: string;
    };
    updateProjectChangeRequestConfiguration: {
        disableChangeRequests: (env: string) => void;
        enableChangeRequests: (env: string, requiredApprovals: number) => void;
    };
    activeEnvironments: {
        name: string;
        type: string;
        configurable: boolean;
    }[];
    projectChangeRequestConfiguration: Record<
        string,
        { requiredApprovals: number }
    >;
};

export const ChangeRequestTableConfigButton: FC<
    ChangeRequestTableConfigButtonProps
> = ({
    button,
    search,
    projectChangeRequestConfiguration,
    updateProjectChangeRequestConfiguration,
    activeEnvironments,
    ...props
}) => {
    const configured = useMemo(() => {
        return Object.fromEntries(
            Object.entries(projectChangeRequestConfiguration).map(
                ([name, config]) => [
                    name,
                    { ...config, changeRequestEnabled: true },
                ],
            ),
        );
    }, [projectChangeRequestConfiguration]);

    const tableEnvs = useMemo(
        () =>
            activeEnvironments.map(({ name, type, configurable }) => ({
                name,
                type,
                configurable,
                ...(configured[name] ?? { changeRequestEnabled: false }),
            })),
        [configured, activeEnvironments],
    );

    const onEnable = (name: string, requiredApprovals: number) => {
        updateProjectChangeRequestConfiguration.enableChangeRequests(
            name,
            requiredApprovals,
        );
    };

    const onDisable = (name: string) => {
        updateProjectChangeRequestConfiguration.disableChangeRequests(name);
    };

    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>();
    const [searchText, setSearchText] = useState('');

    const filteredEnvs = tableEnvs.filter((env) =>
        env.name.toLowerCase().includes(searchText.toLowerCase()),
    );

    const toggleTopItem = (event: React.KeyboardEvent) => {
        if (
            event.key === 'Enter' &&
            searchText.trim().length > 0 &&
            filteredEnvs.length > 0
        ) {
            const firstEnv = filteredEnvs[0];
            if (firstEnv.name in configured) {
                onDisable(firstEnv.name);
            } else {
                onEnable(firstEnv.name, 1);
            }
        }
    };

    return (
        <ConfigButton
            button={button}
            {...props}
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
        >
            <TableSearchInput
                variant='outlined'
                size='small'
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                hideLabel
                label={search.label}
                placeholder={search.placeholder}
                autoFocus
                InputProps={{
                    startAdornment: (
                        <InputAdornment position='start'>
                            <Search fontSize='small' />
                        </InputAdornment>
                    ),
                }}
                onKeyDown={toggleTopItem}
            />
            <ScrollContainer>
                <ChangeRequestTable
                    environments={filteredEnvs}
                    enableEnvironment={onEnable}
                    disableEnvironment={onDisable}
                />
            </ScrollContainer>
        </ConfigButton>
    );
};
