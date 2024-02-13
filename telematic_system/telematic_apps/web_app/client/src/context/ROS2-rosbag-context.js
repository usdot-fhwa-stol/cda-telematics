import { createContext, useState } from "react";

const ROS2RosbagContext = createContext({
  filterText: "",
  uploadStatus: "",
  processingStatus: "",
  updateUploadStatusFilter: (uploadStatus) => {},
  updateProcessStatusFilter: (processingStatus) => {},
  updateInputTextFilter: (filterText) => {},
  clear: () => {},
});

export const ROS2RosbagContextProvider = (props) => {
  const [filterText, setFilterText] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [processingStatus, setProcessingStatus] = useState("");

  const updateUploadStatusFilter = (uploadStatus) => {
    setUploadStatus(uploadStatus);
  };

  const updateProcessStatusFilter = (processingStatus) => {
    setProcessingStatus(processingStatus);
  };

  const updateInputTextFilter = (filterText) => {
    setFilterText(filterText);
  };
  const clear = () => {
    setFilterText("");
    setProcessingStatus("");
    setUploadStatus("");
  };

  const context = {
    filterText: filterText,
    uploadStatus: uploadStatus,
    processingStatus: processingStatus,
    updateInputTextFilter: updateInputTextFilter,
    updateProcessStatusFilter: updateProcessStatusFilter,
    updateUploadStatusFilter: updateUploadStatusFilter,
    clear: clear,
  };
  return (
    <ROS2RosbagContext.Provider value={context}>
      {props.children}
    </ROS2RosbagContext.Provider>
  );
};

export default ROS2RosbagContext;
