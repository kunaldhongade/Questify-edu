// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Questify is ReentrancyGuard {
    address public owner;
    IERC20 public rewardToken;

    struct Question {
        uint id;
        address author;
        string title;
        string content;
        string category;
        uint upvotes;
        uint downvotes;
        uint timestamp;
    }

    struct Answer {
        uint id;
        uint questionId;
        string content;
        address author;
        uint upvotes;
        uint downvotes;
        uint nextMilestone;
        uint timestamp;
    }

    struct UserStats {
        uint totalEarned; // Total rewards earned
        uint totalWithdrawn; // Total rewards withdrawn
        uint currentBalance; // Current rewards available for withdrawal
    }

    uint public questionCounter;
    uint public answerCounter;
    uint public rewardPerMilestone = 10 * 1e18;

    mapping(uint => Question) public questions;
    mapping(uint => Answer) public answers;
    mapping(uint => uint[]) public questionToAnswers;
    mapping(address => mapping(uint => bool)) public hasVotedQuestion;
    mapping(address => mapping(uint => bool)) public hasVotedAnswer;
    mapping(address => UserStats) public userStats;

    event QuestionPosted(uint id, address author, string title);
    event AnswerPosted(uint id, uint questionId, address author);
    event AnswerVoted(uint id, address voter, bool isUpvote);
    event QuestionVoted(uint id, address voter, bool isUpvote);
    event RewardAllocated(address user, uint amount, uint milestone);
    event TokensWithdrawn(address user, uint amount);
    event RewardPoolFunded(uint amount);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor(address _rewardToken) {
        owner = msg.sender;
        rewardToken = IERC20(_rewardToken);
    }

    // Post a question
    function postQuestion(
        string memory _title,
        string memory _category,
        string memory _content
    ) public {
        questionCounter++;
        questions[questionCounter] = Question({
            id: questionCounter,
            author: msg.sender,
            title: _title,
            content: _content,
            category: _category,
            upvotes: 0,
            downvotes: 0,
            timestamp: block.timestamp
        });
        emit QuestionPosted(questionCounter, msg.sender, _title);
    }

    // Post an answer to a specific question
    function postAnswer(uint _questionId, string memory _content) public {
        require(questions[_questionId].id != 0, "The question does not exist");

        answerCounter++;
        answers[answerCounter] = Answer({
            id: answerCounter,
            questionId: _questionId,
            content: _content,
            author: msg.sender,
            upvotes: 0,
            downvotes: 0,
            nextMilestone: 10,
            timestamp: block.timestamp
        });
        questionToAnswers[_questionId].push(answerCounter);
        emit AnswerPosted(answerCounter, _questionId, msg.sender);
    }

    function voteQuestion(uint _questionId, bool isUpvote) public {
        require(questions[_questionId].id != 0, "Question does not exist");
        require(
            !hasVotedQuestion[msg.sender][_questionId],
            "Already voted on this question"
        );

        hasVotedQuestion[msg.sender][_questionId] = true;
        if (isUpvote) {
            questions[_questionId].upvotes++;
        } else {
            questions[_questionId].downvotes++;
        }
        emit QuestionVoted(_questionId, msg.sender, isUpvote);
    }

    function voteAnswer(uint _answerId, bool isUpvote) public {
        require(answers[_answerId].id != 0, "Answer does not exist");
        require(
            !hasVotedAnswer[msg.sender][_answerId],
            "Already voted on this answer"
        );

        hasVotedAnswer[msg.sender][_answerId] = true;
        if (isUpvote) {
            checkAndAllocateReward(_answerId);
            answers[_answerId].upvotes++;
        } else {
            answers[_answerId].downvotes++;
        }
        emit AnswerVoted(_answerId, msg.sender, isUpvote);
    }

    // Withdraw available tokens
    function withdrawTokens() public nonReentrant {
        uint rewards = userStats[msg.sender].currentBalance;
        require(rewards > 0, "No rewards available for withdrawal");
        require(
            rewardToken.balanceOf(address(this)) >= rewards,
            "Not enough tokens in the reward pool"
        );

        userStats[msg.sender].currentBalance = 0;
        userStats[msg.sender].totalWithdrawn += rewards;
        rewardToken.transfer(msg.sender, rewards);

        emit TokensWithdrawn(msg.sender, rewards);
    }

    // Fund the reward pool
    function fundRewardPool(uint _amount) public onlyOwner {
        require(
            rewardToken.transferFrom(msg.sender, address(this), _amount),
            "Funding the reward pool failed"
        );
        emit RewardPoolFunded(_amount);
    }

    // Fetch all questions (Gasless Read Function)
    function getAllQuestions() public view returns (Question[] memory) {
        Question[] memory allQuestions = new Question[](questionCounter);
        for (uint i = 1; i <= questionCounter; i++) {
            allQuestions[i - 1] = questions[i];
        }
        return allQuestions;
    }

    function getQuestionsPaginated(
        uint start,
        uint limit
    ) public view returns (Question[] memory) {
        require(start > 0 && start <= questionCounter, "Invalid start index");

        uint end = start + limit - 1;
        if (end > questionCounter) end = questionCounter;

        Question[] memory paginatedQuestions = new Question[](end - start + 1);
        for (uint i = start; i <= end; i++) {
            paginatedQuestions[i - start] = questions[i];
        }
        return paginatedQuestions;
    }

    // Fetch all answers for a specific question (Gasless Read Function)
    function getAnswersForQuestion(
        uint _questionId
    ) public view returns (Answer[] memory) {
        uint[] memory answerIds = questionToAnswers[_questionId];
        Answer[] memory questionAnswers = new Answer[](answerIds.length);

        for (uint i = 0; i < answerIds.length; i++) {
            questionAnswers[i] = answers[answerIds[i]];
        }
        return questionAnswers;
    }

    function getQuestionDetails(
        uint _questionId
    ) public view returns (Question memory, Answer[] memory) {
        require(questions[_questionId].id != 0, "Question does not exist");
        uint[] memory answerIds = questionToAnswers[_questionId];
        Answer[] memory questionAnswers = new Answer[](answerIds.length);
        for (uint i = 0; i < answerIds.length; i++) {
            questionAnswers[i] = answers[answerIds[i]];
        }
        return (questions[_questionId], questionAnswers);
    }

    function getQuestionsByCategory(
        string memory _category
    ) public view returns (Question[] memory) {
        uint count;
        for (uint i = 1; i <= questionCounter; i++) {
            if (
                keccak256(abi.encodePacked(questions[i].category)) ==
                keccak256(abi.encodePacked(_category))
            ) {
                count++;
            }
        }
        Question[] memory filteredQuestions = new Question[](count);
        uint index = 0;
        for (uint i = 1; i <= questionCounter; i++) {
            if (
                keccak256(abi.encodePacked(questions[i].category)) ==
                keccak256(abi.encodePacked(_category))
            ) {
                filteredQuestions[index++] = questions[i];
            }
        }
        return filteredQuestions;
    }

    // Fetch user stats (Gasless Read Function)
    function getUserStats(
        address _user
    )
        public
        view
        returns (uint totalEarned, uint totalWithdrawn, uint currentBalance)
    {
        UserStats memory stats = userStats[_user];
        return (stats.totalEarned, stats.totalWithdrawn, stats.currentBalance);
    }

    function getRewardPoolBalance() public view returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }

    function getQuestionsByRange(
        uint start,
        uint end
    ) public view returns (Question[] memory) {
        require(
            start > 0 && end >= start && end <= questionCounter,
            "Invalid range"
        );
        Question[] memory questionsRange = new Question[](end - start + 1);
        for (uint i = start; i <= end; i++) {
            questionsRange[i - start] = questions[i];
        }
        return questionsRange;
    }

    function getTotalAllocatedRewards() public view returns (uint256) {
        uint256 totalRewards = 0;
        for (uint i = 1; i <= answerCounter; i++) {
            totalRewards += (answers[i].upvotes / 10) * 10; // Summing up rewards by milestones
        }
        return totalRewards;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function getNetVotesForQuestion(
        uint _questionId
    ) public view returns (int) {
        require(questions[_questionId].id != 0, "Question does not exist");
        return
            int(questions[_questionId].upvotes) -
            int(questions[_questionId].downvotes);
    }

    function getNetVotesForAnswer(uint _answerId) public view returns (int) {
        require(answers[_answerId].id != 0, "Answer does not exist");
        return
            int(answers[_answerId].upvotes) - int(answers[_answerId].downvotes);
    }

    function checkAndAllocateReward(uint _answerId) internal {
        Answer storage ans = answers[_answerId];
        if (ans.upvotes >= ans.nextMilestone) {
            uint rewardAmount = rewardPerMilestone;
            userStats[ans.author].currentBalance += rewardAmount;
            userStats[ans.author].totalEarned += rewardAmount;
            ans.nextMilestone += 10; // Move to the next milestone

            emit RewardAllocated(ans.author, rewardAmount, ans.nextMilestone);
        }
    }

    function rewardTopQuestion(uint _questionId) public onlyOwner {
        require(questions[_questionId].id != 0, "Question does not exist");
        require(
            questions[_questionId].upvotes >= 50,
            "Minimum 50 upvotes required"
        );

        uint rewardAmount = 50 * 1e18; // Example: 50 tokens
        userStats[questions[_questionId].author].currentBalance += rewardAmount;
        userStats[questions[_questionId].author].totalEarned += rewardAmount;

        emit RewardAllocated(questions[_questionId].author, rewardAmount, 0);
    }

    function setRewardPerMilestone(uint _newReward) external onlyOwner {
        rewardPerMilestone = _newReward;
    }

    function hasUserVotedOnQuestion(
        address _user,
        uint _questionId
    ) public view returns (bool) {
        return hasVotedQuestion[_user][_questionId];
    }

    function hasUserVotedOnAnswer(
        address _user,
        uint _answerId
    ) public view returns (bool) {
        return hasVotedAnswer[_user][_answerId];
    }
}
