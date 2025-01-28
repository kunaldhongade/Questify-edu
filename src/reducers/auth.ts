interface AuthState {
  data: Record<string, unknown> | null;
}

interface AuthAction {
  type: string;
  data?: Record<string, unknown>;
}

const authReducer = (
  state: AuthState = { data: null },
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case "AUTH":
      localStorage.setItem("Profile", JSON.stringify({ ...action.data }));
      return { ...state, data: action.data ?? null };
    case "LOGOUT":
      localStorage.removeItem("Profile");
      return { ...state, data: null };
    default:
      return state;
  }
};

export default authReducer;
