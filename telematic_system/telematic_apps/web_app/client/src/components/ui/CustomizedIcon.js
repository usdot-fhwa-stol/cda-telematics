import { Button, Tooltip } from "@mui/material";
import { withStyles } from "@mui/styles";
import React, { memo } from "react";

export const CustomizedIcon = memo(
  ({ title, disabled, onClick, children, ...other }) => {
    const adjustedButtonProps = {
      disabled: disabled,
      component: disabled ? "div" : undefined,
      onClick: disabled ? undefined : onClick,
    };
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
      <Tooltip title={title}>
        <StyledButton {...other} {...adjustedButtonProps}>
          {children}
        </StyledButton>
      </Tooltip>
    );
  }
);
