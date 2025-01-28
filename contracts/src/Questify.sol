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
    }

    struct Answer {
        uint id;
        uint questionId;
        string content;
        address author;
        uint likes;
        uint nextMilestone; // Tracks the next milestone for reward
    }

    struct UserStats {
        uint totalEarned; // Total rewards earned
        uint totalWithdrawn; // Total rewards withdrawn
        uint currentBalance; // Current rewards available for withdrawal
    }

    uint public questionCounter;
    uint public answerCounter;

    mapping(uint => Question) public questions; // Question ID => Question Struct
    mapping(uint => Answer) public answers; // Answer ID => Answer Struct
    mapping(uint => uint[]) public questionToAnswers; // Question ID => List of Answer IDs
    mapping(address => mapping(uint => bool)) public hasLiked; // User Address => (Answer ID => Liked or Not)
    mapping(address => UserStats) public userStats; // User Address => User Statistics

    event QuestionPosted(uint id, address author, string title);
    event AnswerPosted(uint id, uint questionId, address author);
    event AnswerLiked(uint id, address liker);
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
            category: _category
        });

        emit QuestionPosted(questionCounter, msg.sender, _title);
    }

    // Post an answer to a specific question
    function postAnswer(uint _questionId, string memory _content) public {
        require(
            questions[_questionId].id != 0,
            "The question you are answering does not exist"
        );

        answerCounter++;
        answers[answerCounter] = Answer({
            id: answerCounter,
            questionId: _questionId,
            content: _content,
            author: msg.sender,
            likes: 0,
            nextMilestone: 10 // Set the first milestone at 10 likes
        });

        questionToAnswers[_questionId].push(answerCounter);
        emit AnswerPosted(answerCounter, _questionId, msg.sender);
    }

    // Like an answer
    /// @notice Allows a user to like an answer and allocates rewards based on milestones.
    /// @param _answerId The ID of the answer being liked.
    /// @dev Emits an `AnswerLiked` event. Updates `likes` and allocates rewards if milestones are reached.
    function likeAnswer(uint _answerId) public nonReentrant {
        require(
            answers[_answerId].id != 0,
            "The answer you are trying to like does not exist"
        );
        require(
            !hasLiked[msg.sender][_answerId],
            "You have already liked this answer"
        );

        hasLiked[msg.sender][_answerId] = true;
        answers[_answerId].likes++;

        // Check if the answer has reached the next milestone
        if (answers[_answerId].likes >= answers[_answerId].nextMilestone) {
            address author = answers[_answerId].author;

            // Calculate the reward for the milestone
            uint reward = answers[_answerId].nextMilestone;

            // Update user stats and milestone
            userStats[author].totalEarned += reward;
            userStats[author].currentBalance += reward;
            answers[_answerId].nextMilestone += 10; // Set the next milestone

            emit RewardAllocated(
                author,
                reward,
                answers[_answerId].nextMilestone - 10
            );
        }

        emit AnswerLiked(_answerId, msg.sender);
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
            totalRewards += (answers[i].likes / 10) * 10; // Summing up rewards by milestones
        }
        return totalRewards;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
