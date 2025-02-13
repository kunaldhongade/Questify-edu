import moment from "moment";
import { BiSolidUpvote } from "react-icons/bi";
import { Link } from "react-router-dom";

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

const Questions = ({ question }: { question: Question }) => {
  return (
    <Link to={`/Questions/${question._id}`}>
      <div className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 mb-4 transform hover:-translate-y-1">
        <div className="flex-grow">
          <Link
            to={`/Questions/${question._id}`}
            className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-300"
          >
            {question.questionTitle?.length >
            (window.innerWidth <= 400 ? 70 : 90)
              ? question.questionTitle.substring(
                  0,
                  window.innerWidth <= 400 ? 70 : 90
                ) + "..."
              : question.questionTitle}
          </Link>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex flex-wrap gap-2">
            {question.questionTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium text-gray-600  border border-gray-300 rounded-full hover:bg-blue-50 transition-colors duration-300"
              >
                {tag}
              </span>
            ))}
          </div>

          <span className="px-2 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded-full items-center flex content-between">
            {question.noOfAnswers} <BiSolidUpvote />
          </span>

          <span className="px-2 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded-full">
            {question.noOfAnswers} 💬
          </span>
        </div>

        <div className="flex justify-between items-center text-gray-600 text-sm">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-gray-500">
              asked {moment(question.askedOn).fromNow()}
            </span>
          </div>
          <span className="font-medium text-slate-400 hover:text-blue-200 transition-colors duration-300">
            {question.userPosted.length > 10
              ? question.userPosted.substring(0, 10) + "..."
              : question.userPosted}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Questions;
