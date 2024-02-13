import { Button, Tooltip } from "@mui/material";
import { withStyles } from "@mui/styles";
import React, { memo } from "react";

export const CustomizedButton = memo((props) => {
  const StyledButton = withStyles({
    root: {
      backgroundColor: "#748c93",
      margin: "1px",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#fff",
        color: "#748c93",
      },
    },
  })(Button);

  return (
    <Tooltip title={props.title}>
      <StyledButton
        startIcon={props.startIcon}
        data-testid={props["data-testid"]}
        variant="contained"
        onClick={props.onClick}
      >
        {props.children}
      </StyledButton>
    </Tooltip>
  );
});
