import { expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";
import AuthContext from "../../context/auth-context";
import NavMenu from "../../components/layout/NavMenu";
import MainRouter from "../../components/layout/MainRouter";
import Layout from "../../components/layout/Layout";
import { BrowserRouter } from "react-router-dom";

test("Test NavMenu checkServerSession", async () => {
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
    expect(screen.getByText("Events")).toBeInTheDocument();
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
