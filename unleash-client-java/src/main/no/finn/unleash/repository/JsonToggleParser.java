package no.finn.unleash.repository;

import java.io.Reader;
import java.util.Collection;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import no.finn.unleash.Toggle;

public final class JsonToggleParser {

    public static Toggle toToggle(String jsonString) {
        Gson gson = new GsonBuilder().create();
        return gson.fromJson(jsonString, Toggle.class);
    }

    public static String toJsonString(Collection<Toggle> toggles) {
        Gson gson = new GsonBuilder().create();
        return gson.toJson(new ToggleCollection(toggles));
    }


    public static Collection<Toggle> fromJson(String jsonString) {
        Gson gson = new GsonBuilder().create();
        return gson.fromJson(jsonString,ToggleCollection.class).getFeatures();
    }

    public static Collection<Toggle> fromJson(Reader reader) {
        Gson gson = new GsonBuilder().create();
        return gson.fromJson(reader,ToggleCollection.class).getFeatures();
    }
}
