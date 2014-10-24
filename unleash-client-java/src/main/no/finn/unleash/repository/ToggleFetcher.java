package no.finn.unleash.repository;

public interface ToggleFetcher {
   ToggleResponse fetchToggles() throws ToggleException;
}
