import axios from "axios";

const API = axios.create({
  baseURL: "https://stack-overflow-clone-server-vq27.onrender.com",
});

API.interceptors.request.use((req) => {
  const profile = localStorage.getItem("Profile");
  if (profile) {
    req.headers.authorization = `Bearer ${JSON.parse(profile).token}`;
  }
  return req;
});

// Types
interface AuthData {
  email: string;
  password: string;
}

interface QuestionData {
  title: string;
  body: string;
  tags: string[];
}

interface UpdatedData {
  name?: string;
  about?: string;
  tags?: string[];
}

// AUTH
export const logIn = (authData: AuthData) => API.post("/user/login", authData);
export const signUp = (authData: AuthData) =>
  API.post("/user/signup", authData);

// QUESTION
export const postQuestion = (questionData: QuestionData) =>
  API.post("/questions/Ask", questionData);
export const getAllQuestions = () => API.get("/questions/All");
export const deleteQuestion = (id: string) =>
  API.delete(`/questions/delete/${id}`);
export const voteQuestion = (id: string, value: string, userId: string) =>
  API.patch(`/questions/vote/${id}`, { value, userId });

// ANSWER
export const postAnswer = (
  id: string,
  noOfAnswers: number,
  answerBody: string,
  userAnswered: string,
  userId: string
) =>
  API.patch(`/answer/post/${id}`, {
    id,
    noOfAnswers,
    answerBody,
    userAnswered,
    userId,
  });
export const deleteAnswer = (
  id: string,
  answerId: string,
  noOfAnswers: number
) => API.patch(`/answer/delete/${id}`, { answerId, noOfAnswers });

// USER
export const fetchAllUsers = () => API.get("/user/getAllUsers");
export const updateProfile = (id: string, updatedData: UpdatedData) =>
  API.patch(`/user/update/${id}`, updatedData);
