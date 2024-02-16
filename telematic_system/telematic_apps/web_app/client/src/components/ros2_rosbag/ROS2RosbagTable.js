/*
 * Copyright (C) 2019-2024 LEIDOS.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 * 
 * Description: A table to display the list of ROS2 rosbag files and their control options: edit description and send processing request for an uploaded file.
 */
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import * as React from "react";
import AuthContext from "../../context/auth-context";
import { USER_ROLES } from "../users/UserMetadata";
import ROS2RosbagRowItem from "./ROS2RosbagRowItem";

const columns = [
  {
    id: "original_filename",
    label: "File Name",
    minWidth: 100,
    info: "",
  },
  {
    id: "size",
    label: "Size",
    minWidth: 100,
    align: "right",
    info: "",
  },
  { id: "upload_status", label: "Upload Status", minWidth: 100, info: "" },
  {
    id: "process_status",
    label: "Process Status",
    minWidth: 100,
    info: "",
  },
  {
    id: "description",
    label: "Description",
    minWidth: 100,
    align: "right",
    info: "",
  },
  {
    id: "created_by",
    label: "Created By",
    minWidth: 100,
    align: "right",
    format: (value) => value.toLocaleString("en-US"),
    info: "",
  },
  {
    id: "created_at",
    label: "Created Date",
    minWidth: 100,
    align: "right",
    format: (value) => value.toLocaleString("en-US"),
    info: "",
  }
];

export default function ROS2RosbagTable(props) {
  const authCtx = React.useContext(AuthContext);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const saveDescHandler = (UpdatedFileInfo) => {
    props.onSaveDescription(UpdatedFileInfo);
  };

  return (
    <Paper sx={{ width: "100%" }}>
      <TableContainer sx={{ minHeight: 0, overflowY: "scroll", overflowX: "hidden", maxHeight: "600px" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align} style={{ top: 0, minWidth: column.minWidth, fontWeight: "bolder", backgroundColor: "#eee" }}>{column.label}</TableCell>
              ))}
              {authCtx.role !== USER_ROLES.VIEWER && authCtx.role !== undefined && authCtx.role !== null && authCtx.role !== "" && (
                <TableCell key={`controls`} style={{ top: 0, fontWeight: "bolder", backgroundColor: "#eee" }}>Controls</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.ROS2RosbagList !== undefined && Array.isArray(props.ROS2RosbagList) && props.ROS2RosbagList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              return (
                <ROS2RosbagRowItem key={row.id} ROS2RosbagRow={row} columns={columns} ROS2RosbagList={props.ROS2RosbagList}
                  onSaveDescription={saveDescHandler}
                  onProcessReq={(ROS2RosBagInfo) => props.onProcessReq(ROS2RosBagInfo)} />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination rowsPerPageOptions={[10, 25, 100]} component="div" count={props.ROS2RosbagList !== undefined && Array.isArray(props.ROS2RosbagList) ? props.ROS2RosbagList.length : 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
