import MarkdownPreview from "@uiw/react-markdown-preview";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import { readContract, writeContract } from "@wagmi/core";
import copy from "copy-to-clipboard";
import moment from "moment";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { BiSolidDownvote, BiSolidUpvote } from "react-icons/bi";
import { TfiSharethis } from "react-icons/tfi";
import { useParams } from "react-router-dom";
import { questifyABI } from "../../abi/questifyABI"; // Import your ABI
import Avatar from "../../components/Avatar/Avatar";
import Loader from "../../components/Loader/Loader";
import { config } from "../../config"; // Import your Wagmi config
import { questifyAddress } from "../../constants"; // Import your contract address

import DisplayAnswer from "./DisplayAnswer";
type Question = {
  id: bigint;
  title: string;
  content: string;
  category: string;
  author: string;
  upvotes: bigint;
  downvotes: bigint;
  timestamp: bigint;
};

type Answer = {
  id: bigint;
  questionId: bigint;
  content: string;
  author: string;
  upvotes: bigint;
  downvotes: bigint;
  timestamp: bigint;
};

const QuestionsDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [answer, setAnswer] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const url = "https://questify-edu.vercel.app";

  // Fetch question details and answers from the blockchain
  useEffect(() => {
    const fetchQuestionAndAnswers = async () => {
      try {
        const [questionResult, answersResult] = (await readContract(config, {
          address: questifyAddress,
          abi: questifyABI,
          functionName: "getQuestionDetails",
          args: [id ? BigInt(id) : BigInt(0)], // Convert ID to BigInt
        })) as [Question, Answer[]];

        // Transform blockchain data to match frontend structure
        setQuestion(questionResult);
        setAnswers(answersResult);
      } catch (error) {
        console.error("Error fetching question details:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionAndAnswers();
  }, [id]);

  interface CleanMarkdownInput {
    (input: string): string;
  }

  const cleanMarkdownInput: CleanMarkdownInput = (input) => {
    return input
      .split("\n")
      .filter(
        (line, index, arr) =>
          line.trim() !== "" || (index > 0 && arr[index - 1].trim() !== "")
      )
      .join("\n");
  };

  // Handle posting an answer
  const handlePostAns = async (e: FormEvent) => {
    e.preventDefault();
    if (answer === "") {
      toast.error("Enter an answer before submitting");
      return;
    }

    const cleanedData = cleanMarkdownInput(answer);

    try {
      await writeContract(config, {
        address: questifyAddress,
        abi: questifyABI,
        functionName: "postAnswer",
        args: [BigInt(id ? id : 0), cleanedData], // Convert ID to BigInt
      });
      setAnswer("");
      toast.success("Answer posted successfully");
    } catch (error) {
      console.error("Error posting answer:", error);
      toast.error("Failed to post answer");
    }
  };

  // Handle upvoting the question
  const handleUpVoteQuestion = async () => {
    try {
      await writeContract(config, {
        address: questifyAddress,
        abi: questifyABI,
        functionName: "voteQuestion",
        args: [BigInt(id ? id : 0), true], // Convert ID to BigInt and pass true for upvote
      });
      toast.success("Upvoted successfully");
    } catch (error) {
      console.error("Error upvoting question:", error);
      toast.error("Failed to upvote");
    }
  };

  // Handle downvoting the question
  const handleDownVoteQuestion = async () => {
    try {
      await writeContract(config, {
        address: questifyAddress,
        abi: questifyABI,
        functionName: "voteQuestion",
        args: [BigInt(id ? id : 0), false], // Convert ID to BigInt and pass false for downvote
      });
      toast.success("Downvoted successfully");
    } catch (error) {
      console.error("Error downvoting question:", error);
      toast.error("Failed to downvote");
    }
  };

  // Handle upvoting an answer
  const handleUpVoteAnswer = async (answerId: bigint) => {
    try {
      await writeContract(config, {
        address: questifyAddress,
        abi: questifyABI,
        functionName: "voteAnswer",
        args: [answerId, true], // Pass true for upvote
      });
      toast.success("Upvoted answer successfully");
    } catch (error) {
      console.error("Error upvoting answer:", error);
      toast.error("Failed to upvote answer");
    }
  };

  // Handle downvoting an answer
  const handleDownVoteAnswer = async (answerId: bigint) => {
    try {
      await writeContract(config, {
        address: questifyAddress,
        abi: questifyABI,
        functionName: "voteAnswer",
        args: [answerId, false], // Pass false for downvote
      });
      toast.success("Downvoted answer successfully");
    } catch (error) {
      console.error("Error downvoting answer:", error);
      toast.error("Failed to downvote answer");
    }
  };

  const handleVoteSuccess = async () => {
    // Re-fetch question and answers data
    const [updatedQuestion, updatedAnswers] = await readContract(config, {
      address: questifyAddress,
      abi: questifyABI,
      functionName: "getQuestionDetails",
      args: [BigInt(id || 0)],
    });
    setQuestion(updatedQuestion);
    setAnswers(updatedAnswers);
  };

  // In your render:

  // Handle sharing the question URL
  const handleShare = () => {
    copy(url + `/questions/${id}`);
    toast.success("URL copied to clipboard");
  };

  // Check if the user is on a mobile device
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) return <Loader />;
  if (isError)
    return <p className="text-red-500">Error fetching question details</p>;
  if (!question) return <p className="text-red-500">Question not found</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-1 md:ml-2">
      <div key={question.id.toString()}>
        <section className="p-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {question.title}
          </h1>
          <div className="flex flex-col md:flex-row mt-4 gap-6">
            {!isMobile && (
              <div className="flex flex-col items-center">
                <div
                  className="p-2 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-full cursor-pointer transition duration-300"
                  onClick={handleUpVoteQuestion}
                >
                  <BiSolidUpvote className="w-6 h-6" />
                </div>
                <p className="text-lg font-bold text-gray-700 mt-1">
                  {Number(question.upvotes) - Number(question.downvotes)}
                </p>
                <div
                  className="p-2 bg-gray-100 hover:bg-red-500 hover:text-white rounded-full cursor-pointer transition duration-300 mt-1"
                  onClick={handleDownVoteQuestion}
                >
                  <BiSolidDownvote className="w-6 h-6" />
                </div>
              </div>
            )}
            <div className="flex-1">
              <MarkdownPreview
                source={question.content}
                wrapperElement={{
                  "data-color-mode": "light",
                }}
                style={{
                  padding: "1rem",
                  color: "#333",
                  backgroundColor: "whitesmoke",
                  borderRadius: "1rem",
                }}
              />
              <div className="flex flex-wrap gap-2 mt-3 justify-between ">
                {isMobile && (
                  <div className="flex items-center gap-2">
                    <div
                      className="p-2 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-full cursor-pointer transition duration-300"
                      onClick={handleUpVoteQuestion}
                    >
                      <BiSolidUpvote className="w-6 h-6" />
                    </div>
                    <p className="text-lg font-bold text-gray-700">
                      {Number(question.upvotes) - Number(question.downvotes)}
                    </p>
                    <div
                      className="p-2 bg-gray-100 hover:bg-red-500 hover:text-white rounded-full cursor-pointer transition duration-300"
                      onClick={handleDownVoteQuestion}
                    >
                      <BiSolidDownvote className="w-6 h-6" />
                    </div>
                  </div>
                )}
                <span className="px-4 py-2 text-sm bg-gray-100 text-gray-800 border border-gray-100 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 ease-in-out cursor-pointer">
                  {question.category}
                </span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-4">
                  <button
                    className="text-blue-500 hover:underline inline-flex items-center"
                    onClick={handleShare}
                  >
                    <TfiSharethis className="mr-1" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-gray-500 text-sm">
                    asked {moment(Number(question.timestamp) * 1000).fromNow()}
                  </p>
                  <div className="flex items-center gap-2 text-blue-500 hover:underline">
                    <Avatar
                      backgroundColor="bg-blue-300"
                      fontSize="0.5"
                      px="7px"
                      py="5px"
                      borderRadius="4px"
                    >
                      <span
                        onClick={() => {
                          copy(question.author);
                          toast.success("Author name copied to clipboard");
                        }}
                        className="cursor-pointer bg-slate-400 border border-slate-500 text-white px-2 py-1 rounded-lg"
                      >
                        {question.author.length > 10
                          ? question.author.substring(0, 10) + "..."
                          : question.author}
                      </span>
                    </Avatar>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <button
            onClick={() => setIsVisible((prev) => !prev)}
            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200"
          >
            {isVisible ? (
              <AiOutlineMinus className="inline" />
            ) : (
              <AiOutlinePlus className="inline" />
            )}{" "}
            {isVisible ? "Cancel Reply" : "Write a Reply"}
          </button>
          {isVisible && (
            <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800">
                Your Answer
              </h3>
              <form onSubmit={handlePostAns} className="mt-4">
                <MDEditor
                  value={answer}
                  onChange={(value) => setAnswer(value || "")}
                  data-color-mode="light"
                  height={300}
                  className="rounded-xl"
                  autoFocus
                />
                <button
                  type="submit"
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Post Your Answer
                </button>
              </form>
            </div>
          )}
        </section>

        {answers.length > 0 && (
          <section className="mt-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-800">
              {answers.length} Answers
            </h3>
            {answers.map((answer) => (
              <div key={answer.id.toString()} className="mt-4">
                <DisplayAnswer
                  answers={answers}
                  onVoteSuccess={handleVoteSuccess}
                  handleUpVote={() => handleUpVoteAnswer(answer.id)}
                  handleDownVote={() => handleDownVoteAnswer(answer.id)}
                />
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default QuestionsDetails;
