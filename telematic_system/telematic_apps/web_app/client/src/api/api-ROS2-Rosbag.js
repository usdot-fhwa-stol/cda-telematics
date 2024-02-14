import axios from "axios";
import { env } from "../env";
const listROS2Rosbags = async () => {
  const URL = `${env.REACT_APP_FILE_UPLOAD_WEB_SERVER_URI}/api/upload/list/all`;
  try {
    const { data } = await axios.post(URL, { withCredentials: true });
    return data;
  } catch (err) {
    console.log(err);
    return {
      errCode: err.response !== undefined ? err.response.status : "",
      errMsg:
        err.response !== undefined &&
        err.response.data !== undefined &&
        err.response.data.message !== undefined
          ? err.response.data.message
          : err.response.data !== undefined
          ? err.response.data
          : err.response.statusText !== undefined
          ? err.response.statusText
          : "",
    };
  }
};

const updateROS2RosbagDescription = async (UpdatedFileInfo) => {
  const URL = `${env.REACT_APP_FILE_UPLOAD_WEB_SERVER_URI}/api/upload/description`;
  try {
    let formData = new FormData();
    formData.append("fields", JSON.stringify(UpdatedFileInfo));
    const { data } = await axios.post(URL, formData);
    return data;
  } catch (err) {
    console.log(err);
    return {
      errCode: err.response !== undefined ? err.response.status : "",
      errMsg:
        err.response !== undefined &&
        err.response.data !== undefined &&
        err.response.data.message !== undefined
          ? err.response.data.message
          : err.response.data.error !== undefined
          ? err.response.data.error
          : err.response.data !== undefined
          ? err.response.data
          : err.response.statusText !== undefined
          ? err.response.statusText
          : "",
    };
  }
};

const uploadROS2Rosbags = async (ROS2RosbagsFormData) => {
  let formData = new FormData();
  for (let key in ROS2RosbagsFormData["fields"]) {
    let field = ROS2RosbagsFormData["fields"][key];
    formData.append("fields", JSON.stringify(field));
  }

  for (let key in ROS2RosbagsFormData["files"]) {
    let file = ROS2RosbagsFormData["files"][key];
    formData.append("files", file);
  }

  const config = {
    headers: { "content-type": "multipart/form-data" },
  };
  const URL = `${env.REACT_APP_FILE_UPLOAD_WEB_SERVER_URI}/api/upload`;
  try {
    const { data } = await axios.post(URL, formData, config);
    console.log(data);
    return data;
  } catch (err) {
    return {
      errCode: err.response !== undefined ? err.response.status : "",
      errMsg:
        err.response !== undefined &&
        err.response.data !== undefined &&
        err.response.data.message !== undefined
          ? err.response.data.message
          : err.response.data.error !== undefined
          ? err.response.data.error
          : err.response.data !== undefined
          ? err.response.data
          : err.response.statusText !== undefined
          ? err.response.statusText
          : "",
    };
  }
};


const sendROS2RosbagProcessRequest = async (fileInfo) => {
  let formData = new FormData();
  formData.append("fields", JSON.stringify(fileInfo));
  const URL = `${env.REACT_APP_FILE_UPLOAD_WEB_SERVER_URI}/api/upload/process/request`;
  try {
    const { data } = await axios.post(URL, formData);
    return data;
  } catch (err) {
    console.log(err)
    return {
      errCode: err.response !== undefined ? err.response.status : "",
      errMsg:
        err.response !== undefined &&
        err.response.data !== undefined &&
        err.response.data.message !== undefined
          ? err.response.data.message
          : err.response.data.error !== undefined
          ? err.response.data.error
          : err.response.data !== undefined
          ? err.response.data
          : err.response.statusText !== undefined
          ? err.response.statusText
          : "",
    };
  }
};



export { listROS2Rosbags, uploadROS2Rosbags, updateROS2RosbagDescription, sendROS2RosbagProcessRequest };
