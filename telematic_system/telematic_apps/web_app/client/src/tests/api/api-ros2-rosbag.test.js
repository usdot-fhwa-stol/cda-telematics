import axios from 'axios';
import { expect, test } from '@jest/globals';
import {
    listROS2Rosbags,
    uploadROS2Rosbags,
    updateROS2RosbagDescription,
    sendROS2RosbagProcessRequest,
} from '../../api/api-ros2-rosbag';

jest.mock('axios');

beforeEach(() => {
    const response = { data: { status: 'success' } };
    axios.get.mockResolvedValue(response);
    axios.post.mockResolvedValue(response);
    axios.delete.mockResolvedValue(response);
})

test('List all organizations not throw', async () => {
    await listROS2Rosbags()
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    expect(() => listROS2Rosbags()).not.toThrow();
});

test('List all organization users not throw', async () => {
    let ROS2RosbagsFormData = new FormData();
    let fileInfo = {
        id: 1,
        content_location: "/opt/telematics/upload/filename",
        original_filename: "file-name",
        process_status: null,
        process_error_msg: null,
        size: 23575448,
        upload_status: "COMPLETED",
        upload_error_msg: null,
        description: "Random descriptions",
        created_at: "2024-02-06T03:32:11.000Z",
        created_by: 1,
        updated_at: "2024-02-06T03:32:11.000Z",
        updated_by: 1,
    }
    ROS2RosbagsFormData['fields'] = [fileInfo];
    ROS2RosbagsFormData['files'] = [fileInfo];
    await uploadROS2Rosbags(ROS2RosbagsFormData)
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    expect(() => uploadROS2Rosbags(ROS2RosbagsFormData)).not.toThrow();
});

test('Add a user to an organization not throw', async () => {
    await updateROS2RosbagDescription({})
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    expect(() => updateROS2RosbagDescription({})).not.toThrow();
});

test('Update an organization user', async () => {
    await sendROS2RosbagProcessRequest({})
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    expect(() => sendROS2RosbagProcessRequest({})).not.toThrowError();
})