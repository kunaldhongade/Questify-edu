import MDEditor from "@uiw/react-md-editor";
import { readContract, writeContract } from "@wagmi/core";
import moment from "moment";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiSolidDownvote, BiSolidUpvote } from "react-icons/bi";
import { TfiSharethis } from "react-icons/tfi";
import { useAccount } from "wagmi";
import { questifyABI } from "../../abi/questifyABI";
import Avatar from "../../components/Avatar/Avatar";
import { config } from "../../config";
import { questifyAddress } from "../../constants";

interface Answer {
  id: bigint;
  content: string;
  author: string;
  upvotes: bigint;
  downvotes: bigint;
  timestamp: bigint;
}

interface DisplayAnswerProps {
  answers: Answer[];
  onVoteSuccess: () => void; // Callback to refresh data after voting
}

const DisplayAnswer: React.FC<DisplayAnswerProps> = ({
  answers,
  onVoteSuccess,
}) => {
  const { address } = useAccount();
  const [voteStatus, setVoteStatus] = useState<{ [key: string]: boolean }>({});
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Check vote status for all answers when address changes
  useEffect(() => {
    const checkVotes = async () => {
      const status: { [key: string]: boolean } = {};
      for (const answer of answers) {
        if (address) {
          try {
            const hasVoted = await readContract(config, {
              address: questifyAddress,
              abi: questifyABI,
              functionName: "hasUserVotedOnAnswer",
              args: [address, answer.id],
            });
            status[answer.id.toString()] = hasVoted as boolean;
          } catch (error) {
            console.error("Error checking vote status:", error);
            status[answer.id.toString()] = false;
          }
        }
      }
      setVoteStatus(status);
    };

    checkVotes();
  }, [address, answers]);

  const handleVote = async (answerId: bigint, isUpvote: boolean) => {
    if (!address) {
      toast.error("Please connect your wallet to vote");
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [answerId.toString()]: true }));

    try {
      await writeContract(config, {
        address: questifyAddress,
        abi: questifyABI,
        functionName: "voteAnswer",
        args: [answerId, isUpvote],
      });

      // Update local vote status immediately
      setVoteStatus((prev) => ({
        ...prev,
        [answerId.toString()]: true,
      }));

      // Trigger data refresh in parent component
      onVoteSuccess();
      toast.success(
        `Answer ${isUpvote ? "upvoted" : "downvoted"} successfully`
      );
    } catch (error) {
      console.error("Voting failed:", error);
      toast.error(`Failed to ${isUpvote ? "upvote" : "downvote"} answer`);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [answerId.toString()]: false }));
    }
  };

  const getNetVotes = (answer: Answer) => {
    return Number(answer.upvotes) - Number(answer.downvotes);
  };

  return (
    <div className="space-y-6">
      {answers.map((answer) => {
        const answerIdStr = answer.id.toString();
        const hasVoted = voteStatus[answerIdStr] || false;
        const isLoading = loadingStates[answerIdStr] || false;

        return (
          <div key={answerIdStr} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar
                  backgroundColor="#f0f4ff"
                  px="12px"
                  py="6px"
                  borderRadius="4px"
                  fontSize="1rem"
                >
                  {answer.author.slice(2, 4).toUpperCase()}
                </Avatar>
                <div>
                  <p className="font-medium text-gray-700">
                    {answer.author.slice(0, 6)}...{answer.author.slice(-4)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {moment(Number(answer.timestamp) * 1000).fromNow()}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
                className="text-gray-500 hover:text-gray-700"
              >
                <TfiSharethis size={18} />
              </button>
            </div>

            <MDEditor.Markdown
              source={answer.content}
              style={{
                whiteSpace: "pre-wrap",
                backgroundColor: "black",
                padding: "1rem",
                borderRadius: "1rem",
              }}
            />

            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => handleVote(answer.id, true)}
                disabled={hasVoted || isLoading}
                className={`flex items-center gap-2 px-3 py-1 rounded-md ${
                  hasVoted
                    ? "bg-gray-100 cursor-not-allowed"
                    : "bg-blue-50 hover:bg-blue-100"
                } ${isLoading ? "opacity-50 cursor-wait" : ""}`}
              >
                <BiSolidUpvote className="text-blue-600" />
                <span className="font-medium text-gray-700">
                  {getNetVotes(answer)}
                </span>
              </button>

              <button
                onClick={() => handleVote(answer.id, false)}
                disabled={hasVoted || isLoading}
                className={`px-3 py-1 rounded-md ${
                  hasVoted
                    ? "bg-gray-100 cursor-not-allowed"
                    : "bg-red-50 hover:bg-red-100"
                } ${isLoading ? "opacity-50 cursor-wait" : ""}`}
              >
                <BiSolidDownvote className="text-red-600" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DisplayAnswer;
