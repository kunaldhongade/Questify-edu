import React from "react";
import Questions from "./Questions";

interface Question {
  _id: string;
  upVote: number[];
  downVote: number[];
  noOfAnswers: number;
  questionTags: string[];
  questionTitle: string;
  askedOn: Date;
  userPosted: string;
}

interface QuestionListProps {
  questionsList: Question[];
}

const QuestionList: React.FC<QuestionListProps> = ({ questionsList }) => {
  return (
    <>
      {questionsList.map((question) => (
        <Questions question={question} key={question._id} />
      ))}
    </>
  );
};

export default QuestionList;
