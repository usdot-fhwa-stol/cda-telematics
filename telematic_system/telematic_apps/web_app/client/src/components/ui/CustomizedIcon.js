import { Button, Tooltip } from "@mui/material";
import React, { memo } from "react";
import { withStyles } from "@mui/styles";

export const CustomizedIcon = memo((props) => {
  const StyledButton = withStyles({
    root: {
      backgroundColor: "#fff",
      margin: "1px",
      color: "#748c93",
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
