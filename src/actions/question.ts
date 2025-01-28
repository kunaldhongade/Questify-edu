import { Dispatch } from "redux";
import * as api from "../api/index";

interface QuestionData {
  title: string;
  body: string;
  tags: string[];
}

interface AnswerData {
  id: string;
  noOfAnswers: number;
  answerBody: string;
  userAnswered: string;
  userId: string;
}

interface FetchAllQuestionsAction {
  type: "FETCH_ALL_QUESTIONS";
  payload: QuestionData[]; // Replace 'any' with the appropriate type if known
}

interface PostQuestionAction {
  type: "POST_QUESTION";
  payload: QuestionData; // Replace 'any' with the appropriate type if known
}

interface PostAnswerAction {
  type: "POST_ANSWER";
  payload: AnswerData; // Replace 'any' with the appropriate type if known
}

export const fetchAllQuestions = () => {
  return async (dispatch: Dispatch<FetchAllQuestionsAction>) => {
    try {
      const { data } = await api.getAllQuestions();
      dispatch({ type: "FETCH_ALL_QUESTIONS", payload: data });
    } catch (error) {
      console.log(error);
    }
  };
};

export const askQuestion =
  (questionData: QuestionData, navigate: (path: string) => void) =>
  async (dispatch: Dispatch<FetchAllQuestionsAction | PostQuestionAction>) => {
    try {
      const { data } = await api.postQuestion(questionData);
      dispatch({ type: "POST_QUESTION", payload: data });
      await fetchAllQuestions()(dispatch);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

export const AskQuestionAction = (questionData: QuestionData) => {
  return {
    type: "POST_QUESTION",
    payload: questionData,
  };
};

export const postAnswer =
  (answerData: AnswerData) =>
  async (dispatch: Dispatch<FetchAllQuestionsAction | PostAnswerAction>) => {
    try {
      const { id, noOfAnswers, answerBody, userAnswered, userId } = answerData;
      const { data } = await api.postAnswer(
        id,
        noOfAnswers,
        answerBody,
        userAnswered,
        userId
      );
      dispatch({ type: "POST_ANSWER", payload: data });
      await fetchAllQuestions()(dispatch);
    } catch (error) {
      console.log(error);
    }
  };

export const deleteQuestion =
  (id: string, navigate: (path: string) => void) =>
  async (dispatch: Dispatch<FetchAllQuestionsAction>) => {
    try {
      await api.deleteQuestion(id);
      await fetchAllQuestions()(dispatch);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

export const voteQuestion =
  (id: string, value: number, userId: string) =>
  async (dispatch: Dispatch<FetchAllQuestionsAction>) => {
    try {
      await api.voteQuestion(id, value.toString(), userId);
      await fetchAllQuestions()(dispatch);
    } catch (error) {
      console.log(error);
    }
  };

export const deleteAnswer =
  (id: string, answerId: string, noOfAnswers: number) =>
  async (dispatch: Dispatch<FetchAllQuestionsAction>) => {
    try {
      await api.deleteAnswer(id, answerId, noOfAnswers);
      await fetchAllQuestions()(dispatch);
    } catch (error) {
      console.log(error);
    }
  };
