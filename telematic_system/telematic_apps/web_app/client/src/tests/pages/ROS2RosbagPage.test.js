import { expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";
import * as ROS2RosbagApi from "../../api/api-ros2-rosbag";
import ROS2RosbagUploadDialog from "../../components/ros2_rosbag/ROS2RosbagUploadDialog";
import ROS2RosbagUploadPreviewTableRow from "../../components/ros2_rosbag/ROS2RosbagUploadPreviewTableRow";
import ROS2RosbagContext from "../../context/ros2-rosbag-context";
import AuthContext from "../../context/auth-context";
import ROS2RosbagPage from "../../pages/ROS2RosbagPage";

const ROS2RosbagList = [
  {
    content_location: "content_location",
    created_at: 1707752416,
    updated_at: 1707752416,
    id: 1,
    original_filename: "test1",
    upload_status: "COMPLETED",
    upload_error_msg: "",
    process_status: "ERROR",
    process_error_msg: "Test",
    size: 12,
    created_by: 1,
    updated_by: 1,
    description: "test description",
    user: {
      email: "admin@gmail.com",
      id: 1,
      name: "",
      org_id: 1,
    },
  },
  {
    content_location: "content_location",
    created_at: 1707752416,
    updated_at: 1707752416,
    id: 2,
    original_filename: "test",
    upload_status: "IN_PROGRESS",
    upload_error_msg: "",
    process_error_msg: "",
    process_status: "NA",
    size: 23575448,
    created_by: 1,
    updated_by: 1,
    description: "test description",
    user: {
      email: "dmin@gmail.com",
      id: 1,
      name: "",
      org_id: 1,
    },
  },
];

beforeEach(() => {

  jest
    .spyOn(ROS2RosbagApi, "listROS2Rosbags")
    .mockResolvedValue(ROS2RosbagList);
})

test("ROS2 Rosbag page", async () => {

  await act(async () => {
    render(
      <AuthContext.Provider value={{ is_admin: 1, org_id: 1, role: "Admin" }}>
        <ROS2RosbagContext.Provider
          value={{
            filterText: "",
            uploadStatus: "",
            processingStatus: "",
            clear: () => { }
          }}
        >
          <ROS2RosbagPage>
            <ROS2RosbagUploadDialog open={true} />
          </ROS2RosbagPage>
        </ROS2RosbagContext.Provider>
      </AuthContext.Provider>
    );
  });

  await waitFor(() => {
    expect(screen.getByText(/Filter ROS2 Rosbags/i)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId("uploadROS2RosbagBtn"));

  await waitFor(() => {
    expect(screen.getByTestId(/refreshBtn/i)).toBeInTheDocument();
  })
  fireEvent.click(screen.getByTestId("refreshBtn"));

  await waitFor(() => {
    expect(screen.getByTestId(/Process/i)).toBeInTheDocument();
  });
  fireEvent.click(screen.getByTestId("Process"));

});

test("ROS2 Rosbag upload dialog", async () => {
  await act(async () => {
    render(
      <AuthContext.Provider value={{ is_admin: 1, org_id: 1, role: "Admin" }}>
        <ROS2RosbagUploadDialog open={true} />
      </AuthContext.Provider>
    );
  });

  await waitFor(() => {
    expect(screen.getByText(/Choose Files/i)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTitle("upload-title"));
});

afterEach(() => {
  jest.clearAllMocks();
});

test("ROS2 Rosbag upload preview table row", async () => {
  await act(async () => {
    render(
      <AuthContext.Provider value={{ is_admin: 1, org_id: 1, role: "Admin" }}>
        <ROS2RosbagUploadPreviewTableRow
          previewFileFields={{ filename: "test.txt" }}
        />
      </AuthContext.Provider>
    );
  });

  await waitFor(() => {
    expect(screen.getByText(/test.txt/i)).toBeInTheDocument();
  });
});

afterEach(() => {
  jest.clearAllMocks();
});
