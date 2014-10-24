package no.finn.unleash.repository;

import java.net.URI;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

public class HttpToggleFetcherTest {


    @Test
    @Ignore
    public void explore() {
        HttpToggleFetcher httpToggleFetcher = new HttpToggleFetcher(URI.create("http://localhost:4242/features"));

        ToggleResponse toggleResponse = httpToggleFetcher.fetchToggles();
        toggleResponse = httpToggleFetcher.fetchToggles();
        System.out.println("toggleResponse = " + toggleResponse);

    }

}