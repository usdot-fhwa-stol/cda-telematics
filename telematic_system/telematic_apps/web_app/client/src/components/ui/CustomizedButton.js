import { Button, Tooltip } from "@mui/material";
import React, { memo } from "react";
import { withStyles } from "@mui/styles";

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
      <Tooltip title={props.title} placement="top">
        <StyledButton
          startIcon={props.startIcon}
          data-testid={props['data-testid']}
          variant="contained"
          key={props.key}
          onClick={props.handler}
        >
          {props.children}
        </StyledButton>
      </Tooltip>
  );
});
