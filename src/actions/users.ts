import { Dispatch } from "redux";
import * as api from "../api";

interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties here
}

interface FetchUsersAction {
  type: "FETCH_USERS";
  payload: User[];
}

interface UpdateCurrentUserAction {
  type: "UPDATE_CURRENT_USER";
  payload: User;
}

type UserAction = FetchUsersAction | UpdateCurrentUserAction;

export const fetchAllUsers = () => async (dispatch: Dispatch<UserAction>) => {
  try {
    const { data } = await api.fetchAllUsers();
    dispatch({ type: "FETCH_USERS", payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const updateProfile =
  (id: string, updatedData: Partial<User>) =>
  async (dispatch: Dispatch<UserAction>) => {
    try {
      const { data } = await api.updateProfile(id, updatedData);
      dispatch({ type: "UPDATE_CURRENT_USER", payload: data });
    } catch (error) {
      console.log(error);
    }
  };
