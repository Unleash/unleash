package no.finn.unleash;

import java.util.Map;

public interface Strategy {
    String getName();

    boolean isEnabled(Map<String, String> parameters);
}
