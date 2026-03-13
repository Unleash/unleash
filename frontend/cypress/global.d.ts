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
        disableActiveSplashScreens(): Chainable;

        doLogin(options?: {
            user?: string;
            password?: string;
            waitForLogin?: boolean;
        }): Chainable;
        loginUI(options?: { user?: string; password?: string }): Chainable;
        logoutUI(): Chainable;

        createProjectUI(
            projectName: string,
            defaultStickiness: string,
        ): Chainable;

        createFeatureUI(
            name: string,
            shouldWait?: boolean,
            project?: string,
            closeSplash?: boolean, // @deprecated to support old tests
        ): Chainable;

        // VARIANTS
        addVariantsToFeatureUI(
            featureToggleName: string,
            variants: Array<string>,
            projectName?: string,
        );
        deleteVariantUI(
            featureToggleName: string,
            variant: string,
            projectName?: string,
        ): Chainable<any>;

        // SEGMENTS
        createSegmentUI(segmentName: string): Chainable;
        deleteSegmentUI(segmentName: string): Chainable;

        // STRATEGY
        addFlexibleRolloutStrategyToFeatureUI(
            options: AddFlexibleRolloutStrategyOptions,
        ): Chainable;
        updateFlexibleRolloutStrategyUI(
            featureToggleName: string,
            projectName?: string,
        );
        deleteFeatureStrategyUI(
            featureName: string,
            shouldWait?: boolean,
            projectName?: string,
        ): Chainable;

        // API
        createUserAPI(userName: string, role: number): Chainable;
        updateUserPasswordAPI(id: number, pass?: string): Chainable;
        addUserToProjectAPI(
            id: number,
            role: number,
            projectName?: string,
        ): Chainable;
        createProjectAPI(
            name: string,
            options?: Partial<Cypress.RequestOptions>,
        ): Chainable;
        deleteProjectAPI(name: string): Chainable;
        createFeatureAPI(
            name: string,
            projectName?: string,
            options?: Partial<Cypress.RequestOptions>,
        ): Chainable;
        deleteFeatureAPI(name: string, projectName?: string): Chainable;
        createEnvironmentAPI(
            environment: IEnvironment,
            options?: Partial<Cypress.RequestOptions>,
        ): Chainable;
        visit(
            options: Partial<Cypress.VisitOptions & PopulatePreloadsOptions> & {
                url: string;
            },
        ): Cypress.Chainable<Cypress.AUTWindow>;
        visit(
            url: string,
            options?: Partial<Cypress.VisitOptions & PopulatePreloadsOptions>,
        ): Cypress.Chainable<Cypress.AUTWindow>;
    }
}
