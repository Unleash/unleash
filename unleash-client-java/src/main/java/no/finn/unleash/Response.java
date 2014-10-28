package no.finn.unleash;

import java.util.Collections;

final class Response {
    enum Status {NOT_CHANGED, CHANGED}

    private final Status status;
    private final ToggleCollection toggleCollection;

    public Response(Status status, ToggleCollection toggleCollection) {
        this.status = status;
        this.toggleCollection = toggleCollection;
    }

    public Response(Status status) {
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
