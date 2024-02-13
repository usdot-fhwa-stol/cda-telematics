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
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { CustomizedButton } from "../ui/CustomizedButton";
import { CustomizedOutlinedButton } from "../ui/CustomizedOutlinedButton";

function ROS2RosbagDescriptionDialog(props) {
  const [description, setDescription] = useState();
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
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const onCloseHandler = (event) => {
    resetFileForm();
    props.onClose();
  };

  useEffect(() => {
    setDescription(
      props.ROS2RosbagRow.description === undefined
        ? ""
        : props.ROS2RosbagRow.description
    );
  }, [props]);

  const saveRos2RosbagDescriptionHandler = (event) => {
    let localUpdatedFile = {
      content_location: props.ROS2RosbagRow.content_location,
      created_at: props.ROS2RosbagRow.created_at,
      updated_at: props.ROS2RosbagRow.updated_at,
      id: props.ROS2RosbagRow.id,
      original_filename: props.ROS2RosbagRow.original_filename,
      upload_status: props.ROS2RosbagRow.upload_status,
      upload_error_msg: props.ROS2RosbagRow.upload_error_msg,
      size: props.ROS2RosbagRow.size,
      created_by: props.ROS2RosbagRow.created_by,
      updated_by: props.ROS2RosbagRow.updated_by,
      description: description,
    };
    props.OnDescriptionSave(localUpdatedFile);
    props.onClose();
  };

  useEffect(() => {
    if (props.description !== undefined) {
      setDescription(props.description === undefined ? "" : props.description);
    }
  }, [props]);

  return (
    <Dialog open={props.open} onClose={props.onCloseHandler}>
      <DialogTitle sx={{ fontWeight: "bolder" }}>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Update description for file ({props.ROS2RosbagRow.original_filename})
          and click "SAVE".
        </DialogContentText>

        <FormControl fullWidth>
          <TextField
            {...register("description")}
            error={errors.description ? true : false}
            margin="dense"
            id="description"
            label="Description*"
            variant="standard"
            value={description}
            onChange={handleDescriptionChange}
            sx={{ marginBottom: 5 }}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <CustomizedOutlinedButton onClick={onCloseHandler}>
          Cancel
        </CustomizedOutlinedButton>
        <CustomizedButton
          onClick={handleSubmit(saveRos2RosbagDescriptionHandler)}
        >
          Save
        </CustomizedButton>
      </DialogActions>
    </Dialog>
  );
}

export default ROS2RosbagDescriptionDialog;
