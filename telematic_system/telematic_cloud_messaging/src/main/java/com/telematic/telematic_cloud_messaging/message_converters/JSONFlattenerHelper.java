package com.telematic.telematic_cloud_messaging.message_converters;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.stereotype.Component;

import com.github.wnameless.json.flattener.JsonFlattener;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.apache.commons.lang3.exception.ExceptionUtils;

@Component
public class JSONFlattenerHelper {
    private static final Logger logger = LoggerFactory.getLogger(JSONFlattenerHelper.class);

    /***
     * 
     * @param Nested JSON string consumed from NATS subject
     * @return Flattened JSON string 
     */
    public String flattenJsonStr(String json_str) {
        try {
            JSONParser parser = new JSONParser();
            JSONObject json_obj = (JSONObject) parser.parse(json_str);
            String flattened_json_str = JsonFlattener.flatten(json_obj.toString());
            return flattened_json_str;
        } catch (ParseException e) {
            logger.info(ExceptionUtils.getStackTrace(e));
        }
        return "";
    }
}