interface User {
  // Define the properties of the User interface based on the structure of `data`
  // For example:
  id: number;
  name: string;
  email: string;
}

interface SetCurrentUserAction {
  type: "FETCH_CURRENT_USER";
  payload: User;
}

export const setCurrentUser = (data: User): SetCurrentUserAction => {
  return {
    type: "FETCH_CURRENT_USER",
    payload: data,
  };
};
