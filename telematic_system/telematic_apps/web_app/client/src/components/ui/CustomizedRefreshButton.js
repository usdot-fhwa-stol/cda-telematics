import { Button, Tooltip } from "@mui/material";
import React, { memo } from "react";
import SyncIcon from '@mui/icons-material/Sync';

export const CustomizedRefreshButton = memo((props) => {
  return (
    <React.Fragment>
      <Tooltip title={props.title} placement="top" arrow>
        <Button
          variant="outlined"
          size="large"
          key={props.key}
          onClick={props.handler}
          sx={{borderColor:'#748c93'}}
        >
          <SyncIcon sx={{ color: "#748c93" }} />
        </Button>
      </Tooltip>
    </React.Fragment>
  );
});
