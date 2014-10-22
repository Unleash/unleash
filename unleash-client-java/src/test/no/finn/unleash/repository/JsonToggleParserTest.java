package no.finn.unleash.repository;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import no.finn.unleash.Toggle;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

public class JsonToggleParserTest {

    @Test
    public void should_deserialize_correctly() throws IOException {
        String content = readFile("/features.json");
        List<Toggle> toggles = new ArrayList<>(JsonToggleParser.fromJson(content));

        assertThat(toggles.size(), is(3));
    }

    private String readFile(String filename) throws IOException {
        InputStream in = this.getClass().getResourceAsStream(filename);
        InputStreamReader reader = new InputStreamReader(in);
        BufferedReader br = new BufferedReader(reader);
        StringBuilder builder = new StringBuilder();
        String line;
        while((line = br.readLine()) != null) {
            builder.append(line);
        }
        return builder.toString();
    }
}