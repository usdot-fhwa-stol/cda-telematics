package com.telematic.telematic_cloud_messaging.message_converters;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.stereotype.Component;

@Component
public class JSON2KeyValuePairsConverter {
    /**
     * @param json_str String JSON format consumed from NATS subject
     * @return String of key value pairs separated by commas.
     */
    public String convertJson2KeyValuePairs(String json_str) {
        String pairs = "";
        JSONParser parser = new JSONParser();
        try {
            JSONObject json = (JSONObject) parser.parse(json_str);
            int key_count = 0;
            for (Object key : json.keySet()) {
                key_count++;
                Object value = json.get(key.toString());
                if (value == null) {
                    continue;
                }
                // Regex matching integers
                if (value.toString().matches("[-+]?\\d*")) {
                    pairs += key + "=" + value;
                }
                // Regex matching decimals
                else if (value.toString().matches("[-+]?\\d*\\.?\\d+")) {
                    pairs += key + "=" + value;
                }
                // If none of the above Regex matches, considering it as string
                else {
                    pairs += key + "=\"" + value.toString() + "\"";
                }

                if (json.keySet().size() != key_count) {
                    pairs += ",";
                }
            }
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return pairs;
    }
}
