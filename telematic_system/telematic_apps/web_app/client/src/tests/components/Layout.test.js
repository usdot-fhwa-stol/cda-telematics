import { expect, test } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import AuthContext from "../../context/auth-context";

test("Test Layout", async () => {
  await act(async () => {
    const value = {
      user_id: 1,
      isAuth: "true",
      username: "test",
      email: "test@telematic.com",
      sessionToken: "sessionToken",
      last_seen_at: 0,
      org_id: "1",
      name: "test",
      org_name: "my-org",
      is_admin: "1",
      role: "Admin",
      sessionExpiredAt: 100000,
    };
    render(
      <BrowserRouter>
        <AuthContext.Provider value={value}>
          <Layout />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  });

  await waitFor(() => {
    expect(screen.getByText("Telematic")).toBeInTheDocument();
  });

  await act(async() => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{}}>
          <Layout />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  });

  await waitFor(() => {
    expect(screen.queryByDisplayValue("Events")).toBeNull();
  });
});
