package no.finn.unleash.repository;

import java.util.Collections;

public final class ToggleResponse {
    enum Status {NOT_CHANGED, CHANGED}

    private final Status status;
    private final ToggleCollection toggleCollection;

    public ToggleResponse(Status status, ToggleCollection toggleCollection) {
        this.status = status;
        this.toggleCollection = toggleCollection;
    }

    public ToggleResponse(Status status) {
        this.status = status;
        this.toggleCollection = new ToggleCollection(Collections.emptyList());
    }

    public Status getStatus() {
        return status;
    }

    public ToggleCollection getToggleCollection() {
        return toggleCollection;
    }
}
