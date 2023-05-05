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

    interface IEnvironment {
        name: string;
        type: 'development' | 'preproduction' | 'test' | 'production';
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
            projectName?: string
        ): Chainable;
        addFlexibleRolloutStrategyToFeature_UI(
            options: AddFlexibleRolloutStrategyOptions
        ): Chainable;
        updateFlexibleRolloutStrategy_UI(featureToggleName: string);
        deleteFeatureStrategy_UI(
            featureName: string,
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
        createProject_API(
            name: string,
            options?: Partial<Cypress.RequestOptions>
        ): Chainable;
        deleteProject_API(name: string): Chainable;
        createFeature_API(
            name: string,
            projectName?: string,
            options?: Partial<Cypress.RequestOptions>
        ): Chainable;
        deleteFeature_API(name: string): Chainable;
        createEnvironment_API(
            environment: IEnvironment,
            options?: Partial<Cypress.RequestOptions>
        ): Chainable;
    }
}
