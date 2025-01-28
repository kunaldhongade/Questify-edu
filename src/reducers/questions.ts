interface Action {
  type: string;
  payload?: { questions: string[] } | null;
}

interface State {
  data: { questions: string[] } | null;
}

const initialState: State = {
  data: null,
};

const questionsReducer = (
  state: State = initialState,
  action: Action
): State => {
  switch (action.type) {
    case "POST_QUESTION":
      return { ...state };

    case "POST_ANSWER":
      return { ...state };

    case "FETCH_ALL_QUESTIONS":
      return { ...state, data: action.payload ?? null };

    default:
      return state;
  }
};

export default questionsReducer;
