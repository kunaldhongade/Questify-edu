interface Action {
  type: string;
  payload?: { id: number; name: string } | null;
}

const currentUserReducer = (
  state: { id: number; name: string } | null = null,
  action: Action
) => {
  switch (action.type) {
    case "FETCH_CURRENT_USER":
      return action.payload;
    default:
      return state;
  }
};

export default currentUserReducer;
