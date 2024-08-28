import { expect, test } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";
import NavMenu from "../../components/layout/NavMenu";
import AuthContext from "../../context/auth-context";

test("Test NavMenu checkServerSession", async () => {
  await act(async() => {
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
          <NavMenu />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  });

  await waitFor(() => {
    expect(screen.getByTitle('Logout')).toBeInTheDocument();
});
});
