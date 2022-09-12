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
                Object key_value = json.get(key.toString());

                if(json.isInt(key_value.toString())){
                    int value = json.getInt(key.toString());
                    pairs += key + "=" + String.valueOf(value);
                }
                else if(json.isDouble(key_value.toString())){
                    double value = json.getDouble(key.toString());
                    pairs += key + "=" + String.valueOf(value);
                }
                else if(json.isString(key_value.toString())){
                    String value = json.getString(key.toString());
                    pairs += key + "=\"" + value + "\"";
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
