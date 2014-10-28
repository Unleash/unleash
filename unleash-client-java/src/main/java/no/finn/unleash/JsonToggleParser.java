package no.finn.unleash;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.Reader;
import java.util.Collection;

final class JsonToggleParser {

    private JsonToggleParser() {
    }

    public static String toJsonString(ToggleCollection toggleCollection) {
        Gson gson = new GsonBuilder().create();
        return gson.toJson(toggleCollection);
    }

    public static Collection<Toggle> fromJson(String jsonString) {
        Gson gson = new GsonBuilder().create();
        return gson.fromJson(jsonString, ToggleCollection.class).getFeatures();
    }

    public static ToggleCollection fromJson(Reader reader) {
        Gson gson = new GsonBuilder().create();
        ToggleCollection gsonCollection = gson.fromJson(reader, ToggleCollection.class);
        return new ToggleCollection(gsonCollection.getFeatures());
    }
}
