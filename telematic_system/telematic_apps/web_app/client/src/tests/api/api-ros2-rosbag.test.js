import axios from 'axios';
import { expect, test } from '@jest/globals';
import {
    listROS2Rosbags,
    uploadROS2Rosbags,
    updateDescription,
    sendProcessRequest,
} from '../../api/api-ros2-rosbag';

jest.mock('axios');

beforeEach(() => {
    const response = { data: { status: 'success' } };
    axios.get.mockResolvedValue(response);
    axios.post.mockResolvedValue(response);
    axios.delete.mockResolvedValue(response);
})

test('List all files', async () => {
    await listROS2Rosbags()
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    expect(() => listROS2Rosbags()).not.toThrow();
});

test('upload file', async () => {
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

test('Update upload file description', async () => {
    await updateDescription({})
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    expect(() => updateDescription({})).not.toThrow();
});

test('send process request', async () => {
    await sendProcessRequest({})
        .then(data => expect(data).toEqual({ status: 'success' }));
    jest.resetAllMocks();
    expect(() => sendProcessRequest({})).not.toThrowError();
})