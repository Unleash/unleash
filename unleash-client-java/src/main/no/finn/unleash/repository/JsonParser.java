package no.finn.unleash.repository;

import java.util.Collection;
import java.util.List;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import no.finn.unleash.Toggle;

public final class JsonParser {

    public static Toggle toToggle(String jsonString) {
        Gson gson = new GsonBuilder().create();
        return gson.fromJson(jsonString, Toggle.class);
    }

    public static String toJsonString(Collection<Toggle> toggles) {
        Gson gson = new GsonBuilder().create();
        return gson.toJson(toggles);
    }


    public static List<Toggle> toListOfToggles(String jsonString) {
        Gson gson = new GsonBuilder().create();
        return gson.fromJson(jsonString, new TypeToken<List<Toggle>>(){}.getType());
    }
}
