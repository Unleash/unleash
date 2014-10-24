package no.finn.unleash.repository;

public class ToggleException extends RuntimeException {
    public ToggleException(String message) {
        super(message);
    }

    public ToggleException(String message, Throwable cause) {
        super(message, cause);
    }
}
