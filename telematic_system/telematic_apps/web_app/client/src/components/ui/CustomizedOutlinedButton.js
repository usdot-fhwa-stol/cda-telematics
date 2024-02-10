import { Button, Tooltip } from "@mui/material";
import React, { memo } from "react";
import { withStyles } from "@mui/styles";

export const CustomizedOutlButton = memo((props) => {
  const StyledButton = withStyles({
    root: {
      backgroundColor: "#fff",
      borderColor: '#748c93',
      margin: "1px",
      color: "#748c93",
      "&:hover": {
        backgroundColor: "#748c93",
        color: "#fff",
      },
    },
  })(Button);

  return (
      <Tooltip title={props.title} placement="top">
        <StyledButton
          startIcon={props.startIcon}
          data-testid={props['data-testid']}
          variant="outlined"
          key={props.key}
          onClick={props.handler}
        >
          {props.children}
        </StyledButton>
      </Tooltip>
  );
});
