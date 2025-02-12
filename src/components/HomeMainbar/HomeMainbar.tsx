import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { questifyABI } from "../../abi/questifyABI";
import { config } from "../../config";
import { questifyAddress } from "../../constants";
import Loader from "../Loader/Loader";
import QuestionList from "./QuestionList";

const HomeMainBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  interface Question {
    id: bigint;
    title: string;
    content: string;
    author: string;
    upvotes: bigint; // Updated to match blockchain data
    downvotes: bigint; // Updated to match blockchain data
    timestamp: bigint;
    category: string;
  }

  interface TransformedQuestion {
    _id: string;
    id: number;
    title: string;
    body: string;
    upvotes: bigint; // Updated to match blockchain data
    downvotes: bigint; // Updated to match blockchain data
    noOfAnswers: number;
    questionTags: string[];
    userPosted: string;
    userId: string;
    askedOn: string; // Changed to string for easier rendering
  }

  const [questionsData, setQuestionsData] = useState<TransformedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // Fetch all questions from the blockchain
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const result = (await readContract(config, {
          address: questifyAddress,
          abi: questifyABI,
          functionName: "getAllQuestions",
        })) as Question[];

        // Log the raw result for debugging
        console.log("Raw questions data from blockchain:", result);

        // Transform the data to match the TransformedQuestion interface
        const transformedQuestions = result.map((question: Question) => ({
          _id: question.id.toString(),
          id: Number(question.id),
          title: question.title,
          body: question.content,
          upvotes: question.upvotes, // Keep as BigInt
          downvotes: question.downvotes, // Keep as BigInt
          upVote: Number(question.upvotes), // Convert BigInt to number
          downVote: Number(question.downvotes), // Convert BigInt to number
          noOfAnswers: 0, // Placeholder, replace with actual answer count if available
          questionTags: [question.category],
          userId: question.author,
          userPosted: question.author, // Add this line
          askedOn: new Date(Number(question.timestamp) * 1000).toISOString(), // Convert timestamp to ISO string
        }));

        // setQuestionsData(transformedQuestions);
        // Sort questions by timestamp in descending order (newest first)
        transformedQuestions.sort((a, b) => Number(b.id) - Number(a.id));

        setQuestionsData(transformedQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const checkAuth = () => {
    navigate("/AskQuestion");
  };

  console.log("Transformed questions list:", questionsData); // Debugging

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        {location.pathname === "/" ? (
          <h1 className="text-xl font-bold text-gray-800">Top Questions</h1>
        ) : (
          <h1 className="text-xl font-bold text-gray-800">All Questions</h1>
        )}
        <button
          onClick={checkAuth}
          className="bg-white text-black px-4 py-2 rounded-lg hover:bg-blue-300 transition duration-200 shadow-md"
        >
          Ask Question
        </button>
      </div>
      <div>
        {isLoading ? (
          <Loader />
        ) : isError ? (
          <p className="text-red-500">Error fetching questions</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {questionsData.length} questions
            </p>
            <QuestionList
              questionsList={questionsData.map((question) => ({
                ...question,
                questionTitle: question.title,
                upVote: question.upvotes, // Add this line
                downVote: question.downvotes, // Add this line
                userPosted: question.userPosted, // Pass userPosted
              }))}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default HomeMainBar;
