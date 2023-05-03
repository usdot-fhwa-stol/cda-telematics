package com.telematic.telematic_cloud_messaging.message_converters;

import java.util.List;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.stereotype.Component;

@Component
public class JSON2KeyValuePairsConverter {
    /**
     * @param json_str String JSON format consumed from NATS subject
     * @param to_str_values Array of String to match in the JSON and convert the match to String data type value
     * @return String of key value pairs separated by commas.
     */
    public String convertJson2KeyValuePairs(String json_str, List<String> to_str_values) {
        String pairs = "";
        JSONParser parser = new JSONParser();
        try {
            JSONObject json = (JSONObject) parser.parse(json_str);
            int key_count = 0;
            for (Object key : json.keySet()) {
                key_count++;
                Object value = json.get(key.toString());

                if (value == null || value.toString().isEmpty())
                {
                    pairs += key + "=\"NA\"";
                }
                else {
                    boolean is_skip = false;
                    for (String value_item: to_str_values)
                    {
                        if (key.toString().strip().equals(value_item)){
                            pairs += key + "=\"" + value.toString().replaceAll("\\s", "") + "\"";
                            is_skip = true;
                        }
                    }
                    if(!is_skip)
                    {
                        // Regex matching integers
                        if (value.toString().matches("[-+]?\\d*")) {
                            pairs += key + "=" + value;
                        }
                        // Regex matching decimals
                        else if (value.toString().matches("[-+]?\\d*\\.?\\d+")) {
                            pairs += key + "=" + value;
                        }
                        //Regex matching scientific notation. InfluxDB does not support scientific notation float syntax, temporarily set this kind of value = 0.0 
                        else if (value.toString().matches("^[+-]?\\d+(?:\\.\\d*(?:[eE][+-]?\\d+)?)?$")) {
                            pairs += key + "=" + 0.0;
                        }
                        //Leave NaN value as float (Assuming influx treats NaN value as float type) and do not convert to string
                        else if (value.toString().toLowerCase().strip().equals("nan")){
                            pairs += key + "=" + value;
                        }
                        // If none of the above Regex matches, considering it as string
                        else {
                            pairs += key + "=\"" + value.toString().replaceAll("\\s", "") + "\"";
                        }
                    }                    
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
