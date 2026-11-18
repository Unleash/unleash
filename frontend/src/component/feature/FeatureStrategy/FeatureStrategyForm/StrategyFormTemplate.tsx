import type { ReactNode } from 'react';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useUiFlag } from 'hooks/useUiFlag';
import {
    StrategyFormDescription,
    type StrategyFormContext,
} from './StrategyFormDescription.tsx';

const legacyDescription = `
    An activation strategy will only run when a feature flag is enabled and provides a way to control who will get access to the feature.
    If any of a feature flag's activation strategies returns true, the user will get access.
`;

const legacyStrategyDocumentation = {
    documentationLink:
        'https://docs.getunleash.io/concepts/activation-strategies',
    documentationLinkLabel: 'Strategies documentation',
};

const legacyProjectDefaultStrategyDocumentation = {
    documentationLink:
        'https://docs.getunleash.io/concepts/projects#project-default-strategy',
    documentationLinkLabel: 'Default strategy documentation',
};

type StrategyFormTemplateProps = {
    formatApiCode?: () => string;
    formContext?: StrategyFormContext;
    children: ReactNode;
};

const guidanceContent = (
    useNewSidebarContent: boolean,
    formContext?: StrategyFormContext,
) => {
    if (useNewSidebarContent) {
        return {
            description: <StrategyFormDescription formContext={formContext} />,
        };
    }
    const legacyDocsProps =
        formContext === 'projectDefaultStrategy'
            ? legacyProjectDefaultStrategyDocumentation
            : legacyStrategyDocumentation;
    return {
        description: legacyDescription,
        ...legacyDocsProps,
    };
};

export const StrategyFormTemplate = ({
    formatApiCode,
    formContext,
    children,
}: StrategyFormTemplateProps) => {
    const singlePageStrategyForm = useUiFlag('singlePageStrategyForm');

    return (
        <FormTemplate
            layout='modal'
            fitContainerHeight={singlePageStrategyForm}
            disablePadding
            formatApiCode={formatApiCode}
            {...guidanceContent(singlePageStrategyForm, formContext)}
        >
            {children}
        </FormTemplate>
    );
};
