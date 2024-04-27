package com.telematic.telematic_cloud_messaging.message_converters;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.stereotype.Component;

import com.github.wnameless.json.flattener.JsonFlattener;

@Component
public class JSONFlattenerHelper {
    /***
     * 
     * @param Nested JSON string consumed from NATS subject
     * @return Flattened JSON string 
     */
    public String flattenJsonStr(String jsonStr) {
        try {
            JSONParser parser = new JSONParser();
            JSONObject jsonObj = (JSONObject) parser.parse(jsonStr);
            return JsonFlattener.flatten(jsonObj.toString());
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return "";
    }
}