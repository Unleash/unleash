package no.finn.unleash.repository;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public final class HttpToggleFetcher implements ToggleFetcher {
    public static final int CONNECT_TIMEOUT = 10000;
    private String etag = null;

    private final URL toggleUrl;

    public HttpToggleFetcher(URI repo) {
        try {
            toggleUrl = repo.toURL();
        } catch (MalformedURLException ex) {
            throw new IllegalArgumentException("Invalid repo uri", ex);
        }
    }

    @Override
    public ToggleResponse fetchToggles() throws ToggleException {
        HttpURLConnection connection = null;
        try {
            connection = (HttpURLConnection) toggleUrl.openConnection();
            connection.setConnectTimeout(CONNECT_TIMEOUT);
            connection.setReadTimeout(CONNECT_TIMEOUT);
            connection.setRequestProperty("If-None-Match", etag);
            connection.connect();

            int responseCode = connection.getResponseCode();
            if(responseCode < 300) {
                return getToggleResponse(connection);
            } else {
                return new ToggleResponse(ToggleResponse.Status.NOT_CHANGED);
            }
        } catch (IOException e) {
            throw new ToggleException("Could not fetch toggles", e);
        } finally {
            if(connection != null) {
                connection.disconnect();
            }
        }
    }

    private ToggleResponse getToggleResponse(HttpURLConnection request) throws IOException {
        etag = request.getHeaderField("ETag");

        try(BufferedReader reader = new BufferedReader(
                new InputStreamReader((InputStream) request.getContent(), StandardCharsets.UTF_8))) {

            ToggleCollection toggles = JsonToggleParser.collectionFormJson(reader);
            return new ToggleResponse(ToggleResponse.Status.CHANGED, toggles);
        }
    }
}
