/// <reference types="cypress" />

declare namespace Cypress {
    interface AddFlexibleRolloutStrategyOptions {
        featureToggleName: string;
        project?: string;
        environment?: string;
        stickiness?: string;
    }

    interface UserCredentials {
        email: string;
        password: string;
    }
    interface Chainable {
        runBefore(): Chainable;

        login_UI(user = AUTH_USER, password = AUTH_PASSWORD): Chainable;
        logout_UI(): Chainable;

        createProject_UI(
            projectName: string,
            defaultStickiness: string
        ): Chainable;

        createFeature_UI(
            name: string,
            shouldWait?: boolean,
            project?: string
        ): Chainable;

        // VARIANTS
        addVariantsToFeature_UI(
            featureToggleName: string,
            variants: Array<string>,
            projectName?: string
        );
        deleteVariant_UI(
            featureToggleName: string,
            variant: string,
            projectName?: string
        ): Chainable<any>;

        // SEGMENTS
        createSegment_UI(segmentName: string): Chainable;
        deleteSegment_UI(segmentName: string, id: string): Chainable;

        // STRATEGY
        addUserIdStrategyToFeature_UI(
            featureName: string,
            strategyId: string,
            projectName?: string
        ): Chainable;
        addFlexibleRolloutStrategyToFeature_UI(
            options: AddFlexibleRolloutStrategyOptions
        ): Chainable;
        updateFlexibleRolloutStrategy_UI(
            featureToggleName: string,
            strategyId: string
        );
        deleteFeatureStrategy_UI(
            featureName: string,
            strategyId: string,
            shouldWait?: boolean,
            projectName?: string
        ): Chainable;

        // API
        createUser_API(userName: string, role: number): Chainable;
        updateUserPassword_API(id: number, pass?: string): Chainable;
        addUserToProject_API(
            id: number,
            role: number,
            projectName?: string
        ): Chainable;
        createProject_API(name: string): Chainable;
        deleteProject_API(name: string): Chainable;
        createFeature_API(name: string, projectName: string): Chainable;
        deleteFeature_API(name: string): Chainable;
    }
}
