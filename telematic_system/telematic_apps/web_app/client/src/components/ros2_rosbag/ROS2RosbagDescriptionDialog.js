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
 * Description: A dialog to edit an existing ROS2 rosbag file.
 */
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  TextField
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { CustomizedButton } from "../ui/CustomizedButton";
import { CustomizedOutlinedButton } from "../ui/CustomizedOutlinedButton";
import AuthContext from "../../context/auth-context";

function ROS2RosbagDescriptionDialog(props) {
  const [description, setDescription] = useState();
  const authCtx = useContext(AuthContext);
  const validationSchema = Yup.object().shape({
    description: Yup.string().required("Description is required"),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    resetField,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const resetFileForm = () => {
    clearErrors();
    resetField("description");
  };
  const handleDescChange = (event) => {
    setDescription(event.target.value);
  };

  const onCloseHandler = (event) => {
    resetFileForm();
    props.onClose();
  };

  useEffect(() => {
    setDescription(props.ROS2RosbagRow.description);
  }, [props.ROS2RosbagRow.description]);

  const saveDescHandler = (event) => {
    let localUpdatedFile = {
      content_location: props.ROS2RosbagRow.content_location,
      created_at: props.ROS2RosbagRow.created_at,
      updated_at: props.ROS2RosbagRow.updated_at,
      id: props.ROS2RosbagRow.id,
      original_filename: props.ROS2RosbagRow.original_filename,
      upload_status: props.ROS2RosbagRow.upload_status,
      upload_error_msg: props.ROS2RosbagRow.upload_error_msg,
      process_status: props.ROS2RosbagRow?.process_status,
      process_error_msg: props.ROS2RosbagRow?.process_error_msg,
      size: props.ROS2RosbagRow.size,
      created_by: props.ROS2RosbagRow.created_by,
      updated_by: parseInt(authCtx.user_id),
      user_id: props.ROS2RosbagRow.user_id,
      user: props.ROS2RosbagRow.user,
      description: description,
    };
    props.OnDescriptionSave(localUpdatedFile);
    props.onClose();
  };

  return (
    <Dialog open={props.open} onClose={props.onCloseHandler}>
      <DialogTitle sx={{ fontWeight: "bolder" }}>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {" "}
          Update description for file (
          <b>
            {
              props.ROS2RosbagRow.original_filename?.split("/")[
                props.ROS2RosbagRow.original_filename?.split("/")?.length - 1
              ]
            }
          </b>
          ) and click "SAVE".{" "}
        </DialogContentText>
        <FormControl fullWidth>
          <TextField
            {...register("description")}
            error={errors.description ? true : false}
            margin="dense"
            id="description"
            label="Description*"
            variant="standard"
            inputProps={{ maxLength: 255 }}
            value={description}
            onChange={handleDescChange}
            sx={{ marginBottom: 5 }}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <CustomizedOutlinedButton onClick={onCloseHandler}>
          Cancel
        </CustomizedOutlinedButton>
        <CustomizedButton onClick={handleSubmit(saveDescHandler)}>
          Save{" "}
        </CustomizedButton>
      </DialogActions>
    </Dialog>
  );
}

export default ROS2RosbagDescriptionDialog;
