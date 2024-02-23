import SyncIcon from "@mui/icons-material/Sync";
import { Button, Tooltip } from "@mui/material";
import React, { memo } from "react";

export const CustomizedRefreshButton = memo((props) => {
  return (
    <Tooltip title={props.title}>
      <Button variant="outlined" size="large"  data-testid={props["data-testid"]} onClick={props.onClick} sx={{ borderColor: "#748c93", display: 'inline-block' }}><SyncIcon sx={{ color: "#748c93" }} /></Button>
    </Tooltip>
  );
});
