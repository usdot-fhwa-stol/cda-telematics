import { expect, test } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import React, { useContext } from 'react';
import ROS2RosbagContext, { ROS2RosbagContextProvider } from "../../context/ros2-rosbag-context";

test("ROS2 rosbag context", () => {
    const TestContextComponent = () => {
        const rosbagCtx = useContext(ROS2RosbagContext);
        return (<React.Fragment>
            {rosbagCtx.filterText !== null && <p>{rosbagCtx.filterText} </p>}
            {rosbagCtx.processingStatus !== null && <p>{rosbagCtx.processingStatus}</p>}
            {rosbagCtx.uploadStatus !== null && <p>{rosbagCtx.uploadStatus} </p>}
            <button onClick={() => { rosbagCtx.updateInputTextFilter("Test input")}}>Filter text</button>
            <button onClick={() => { rosbagCtx.updateProcessStatusFilter("IN_PROGRESS") }}>Filter process status</button>
            <button onClick={() => { rosbagCtx.updateUploadStatusFilter("COMPLETED") }}>Filter upload status</button>
            <button onClick={() => { rosbagCtx.clear() }}>Clear filter</button>

        </React.Fragment>)
    }
    render(<ROS2RosbagContextProvider>
        <TestContextComponent />
    </ROS2RosbagContextProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Filter text' }));
    expect(screen.getByText('Test input')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Filter process status' }));
    expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Filter upload status' }));
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear filter' }));
    expect(screen.queryByText('COMPLETED')).not.toBeInTheDocument();
})