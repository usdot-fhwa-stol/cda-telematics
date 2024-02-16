import axios from "axios";
import { env } from "../env";
import { constructError } from "./api-utils";

/**
 * @brief Send POST request to get a list a ROS2 rosbag files info
 * @returns server response with a list a files info
 */
const listROS2Rosbags = async () => {
  const URL = `${env.REACT_APP_FILE_UPLOAD_WEB_SERVER_URI}/api/upload/list/all`;
  try {
    const { data } = await axios.post(URL);
    return data;
  } catch (err) {
    console.log(err);
    return constructError(err);
  }
};


/**
 * @brief Send POST request to update description for a particular ROS2 rosbag file info
 * @returns server response with updated ROS2 rosbag file info
 */
const updateDescription = async (UpdatedFileInfo) => {
  const URL = `${env.REACT_APP_FILE_UPLOAD_WEB_SERVER_URI}/api/upload/description`;
  try {
    let formData = new FormData();
    formData.append("fields", JSON.stringify(UpdatedFileInfo));
    const { data } = await axios.post(URL, formData);
    return data;
  } catch (err) {
    return constructError(err);
  }
};


/**
 * @brief Send POST request to upload multiple ROS2 rosbag files to remote or local server 
 * @returns server response with uploaded ROS2 rosbag file info
 */
const uploadROS2Rosbags = async (ROS2RosbagsFormData) => {
  try {
    let formData = new FormData();
    let fields = ROS2RosbagsFormData["fields"];
    for (let key in fields) {
      formData.append("fields", JSON.stringify(fields[key]));
    }

    let files = ROS2RosbagsFormData["files"];
    for (let key in files) {
      formData.append("files", files[key]);
    }

    const config = {
      headers: { "content-type": "multipart/form-data" }
    };

    const URL = `${env.REACT_APP_FILE_UPLOAD_WEB_SERVER_URI}/api/upload`;
    const { data } = await axios.post(URL, formData, config);
    return data;
  } catch (err) {
    return constructError(err);
  }
};

/**
 * @brief Send POST request to process an existing rROS2 rosbag in the server.
 * @returns server response with acknowledgement
 */
const sendProcessRequest = async (fileInfo) => {
  let formData = new FormData();
  formData.append("fields", JSON.stringify(fileInfo));
  const URL = `${env.REACT_APP_FILE_UPLOAD_WEB_SERVER_URI}/api/upload/process/request`;
  try {
    const { data } = await axios.post(URL, formData);
    return data;
  } catch (err) {
    console.log(err);
    return constructError(err);
  }
};


export {
  listROS2Rosbags,
  uploadROS2Rosbags,
  updateDescription,
  sendProcessRequest,
};
