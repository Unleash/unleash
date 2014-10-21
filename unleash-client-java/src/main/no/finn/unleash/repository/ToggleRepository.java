package no.finn.unleash.repository;

import java.util.Collection;
import no.finn.unleash.Toggle;

public interface ToggleRepository {
    Toggle getToggle(String name) throws ToggleException;

    Collection<Toggle> getToggles() throws ToggleException;
}
