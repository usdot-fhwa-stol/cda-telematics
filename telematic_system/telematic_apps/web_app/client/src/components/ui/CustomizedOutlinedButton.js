import { Button, Tooltip } from "@mui/material";
import { withStyles } from "@mui/styles";
import React, { memo } from "react";

export const CustomizedOutlinedButton = memo((props) => {
  const StyledButton = withStyles({
    root: {
      backgroundColor: "#fff",
      borderColor: "#748c93",
      margin: "1px",
      color: "#748c93",
      "&:hover": {
        backgroundColor: "#748c93",
        color: "#fff",
      },
    },
  })(Button);

  return (
    <Tooltip title={props.title}>
      <StyledButton
        startIcon={props.startIcon}
        data-testid={props["data-testid"]}
        variant="outlined"
        onClick={props.onClick}
      >
        {props.children}
      </StyledButton>
    </Tooltip>
  );
});
