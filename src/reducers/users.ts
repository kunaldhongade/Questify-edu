interface User {
  _id: string;
  // Add other user properties here
}

interface Action {
  type: string;
  payload: User[] | User;
}

const usersReducer = (states: User[] = [], action: Action): User[] => {
  switch (action.type) {
    case "FETCH_USERS":
      return Array.isArray(action.payload) ? action.payload : states;
    case "UPDATE_CURRENT_USER":
      return states.map((state) =>
        state._id === (action.payload as User)._id
          ? (action.payload as User)
          : state
      );
    default:
      return states;
  }
};

export default usersReducer;
