package no.finn.unleash.repository;

import java.io.IOException;
import java.util.Collection;
import no.finn.unleash.Toggle;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

//TODO: take advantage of Etag and 304 responses.
public class HTTPToggleRepository implements ToggleRepository {
    private static final Log LOG = LogFactory.getLog(HTTPToggleRepository.class);

    private final HttpClient httpClient;
    private final String serverEndpoint;

    public HTTPToggleRepository(final String serverEndpoint) {
        this.serverEndpoint = serverEndpoint;
        this.httpClient = HttpClients.createDefault();
    }

    @Override
    public Toggle getToggle(final String name) throws ToggleException {
        try {
            for (Toggle toggle : fetchToggles()) {
                if (name.equals(toggle.getName())) {
                    return toggle;
                }
            }
        } catch (IOException e) {
            LOG.warn("Could not fetch toggles via HTTP", e);
            throw new ToggleException("Could not fetch toggles via HTTP");
        }

        throw new ToggleException("unknown toggle: " + name);
    }

    @Override
    public Collection<Toggle> getToggles() {
        try {
            return fetchToggles();
        } catch (IOException e) {
            LOG.warn("Could not fetch toggles via HTTP");
            throw new ToggleException("Could not fetch toggles via HTTP");
        }
    }

    private Collection<Toggle> fetchToggles() throws IOException {
        HttpResponse httpResponse = httpClient.execute(new HttpGet(serverEndpoint));
        final String jsonString = EntityUtils.toString(httpResponse.getEntity());
        return JsonToggleParser.fromJson(jsonString);
    }
}
