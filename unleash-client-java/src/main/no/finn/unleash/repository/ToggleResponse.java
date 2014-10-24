package no.finn.unleash.repository;

import java.util.Collection;
import java.util.Collections;
import no.finn.unleash.Toggle;

public final class ToggleResponse {
    enum Status {NOT_CHANGED, CHANGED}

    private final Status status;
    private final Collection<Toggle> getToggles;

    public ToggleResponse(Status status, Collection<Toggle> getToggles) {
        this.status = status;
        this.getToggles = getToggles;
    }

    public ToggleResponse(Status status) {
        this.status = status;
        this.getToggles = Collections.emptyList();
    }

    public Status getStatus() {
        return status;
    }

    public Collection<Toggle> getGetToggles() {
        return getToggles;
    }
}
