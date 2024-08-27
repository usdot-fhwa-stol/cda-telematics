package com.telematic.telematic_cloud_messaging.message_converters;

import java.util.List;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.stereotype.Component;

@Component
public class JSON2KeyValuePairsConverter {
    /**
     * @param jsonStr String JSON format consumed from NATS subject
     * @param toStrFields Array of String to match in the JSON and convert the match to String data type value
     * @return String of key value pairs separated by commas.
     */
    public String convertJson2KeyValuePairs(String jsonStr, List<String> toStrFields, List<String> ignoreFields) {
        String pairs = "";
        JSONParser parser = new JSONParser();
        try {
            JSONObject json = (JSONObject) parser.parse(jsonStr);
            int keyCount = 0;
            for (Object key : json.keySet()) {
                keyCount++;
                Object value = json.get(key.toString());
                boolean isIgnored = false;

                if (value == null || value.toString().isEmpty())
                {
                    pairs += key + "=\"NA\"";
                }
                else {
                    for(String field: ignoreFields)
                    {
                        if(key.toString().strip().equalsIgnoreCase(field))   
                        {
                            isIgnored = true;
                        }
                    }
                    boolean is_processed = false;
                    for (String field: toStrFields)
                    {
                        if (key.toString().strip().equalsIgnoreCase(field)){
                            pairs += key + "=\"" + value.toString().replaceAll("\\s", "") + "\"";
                            is_processed = true;
                        }
                    }
                    if(!is_processed && !isIgnored)
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
                            // Drop fields with NaN values
                            continue;
                        }
                        // If none of the above Regex matches, considering it as string
                        else {
                            pairs += key + "=\"" + value.toString().replaceAll("\\s", "") + "\"";
                        }
                    }                    
                }              
                
                if (!isIgnored && json.keySet().size() != keyCount) {
                    pairs += ",";
                }
                //If last field is ignored, remove the tail comma
                if(isIgnored && json.keySet().size() == keyCount && pairs.length() >= 1)
                {
                   pairs = pairs.substring(0, pairs.length()-1);
                }
            }//Loop through JSON keys
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return pairs;
    }
}
