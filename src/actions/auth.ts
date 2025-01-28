import { NavigateFunction } from "react-router-dom";
import { Dispatch } from "redux";
import * as api from "../api";
import { setCurrentUser } from "./currentUser";

interface AuthData {
  email: string;
  password: string;
  // Add other fields as necessary
}

interface AuthAction {
  type: string;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      // Add other fields as necessary
    };
  };
}

export const signup =
  (authData: AuthData, navigate: NavigateFunction) =>
  async (
    dispatch: Dispatch<AuthAction | ReturnType<typeof setCurrentUser>>
  ) => {
    try {
      const { data } = await api.signUp(authData);
      dispatch({ type: "AUTH", data });
      dispatch(
        setCurrentUser(JSON.parse(localStorage.getItem("Profile") || "{}"))
      );
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

export const login =
  (authData: AuthData, navigate: NavigateFunction) =>
  async (
    dispatch: Dispatch<AuthAction | ReturnType<typeof setCurrentUser>>
  ) => {
    try {
      const { data } = await api.logIn(authData);
      dispatch({ type: "AUTH", data });
      dispatch(
        setCurrentUser(JSON.parse(localStorage.getItem("Profile") || "{}"))
      );
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };
