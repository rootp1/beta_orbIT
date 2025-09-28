// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TaskEscrow - Decentralized task completion and reward system
/// @notice Handles staking funds for tasks and automatic reward distribution
contract TaskEscrow {
    
    // --- Structs ---
    
    struct Task {
        string taskId;
        address developer;
        uint256 rewardPerCompletion;
        uint256 totalFunded;
        uint256 totalCompletions;
        uint256 maxCompletions;
        bool isActive;
        mapping(address => bool) hasCompleted;
    }
    
    struct Stake {
        address staker;
        string taskId;
        uint256 amount;
        uint256 timestamp;
        bool isActive;
    }
    
    // --- State Variables ---
    
    address public owner;
    uint256 public platformFeePercent = 250; // 2.5% in basis points
    address public feeRecipient;
    
    mapping(string => Task) public tasks;
    mapping(address => string[]) public userTasks;
    mapping(string => address[]) public taskStakers;
    mapping(bytes32 => Stake) public stakes; // keccak256(staker, taskId) => Stake
    
    string[] public allTaskIds;
    
    // --- Events ---
    
    event TaskCreated(
        string indexed taskId,
        address indexed developer,
        uint256 rewardPerCompletion,
        uint256 maxCompletions
    );
    
    event TaskFunded(
        string indexed taskId,
        address indexed staker,
        uint256 amount,
        uint256 totalFunded
    );
    
    event TaskCompleted(
        string indexed taskId,
        address indexed tester,
        uint256 reward
    );
    
    event StakeWithdrawn(
        string indexed taskId,
        address indexed staker,
        uint256 amount
    );
    
    event TaskDeactivated(string indexed taskId, address indexed developer);
    
    // --- Modifiers ---
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier taskExists(string memory taskId) {
        require(bytes(tasks[taskId].taskId).length > 0, "Task does not exist");
        _;
    }
    
    modifier taskActive(string memory taskId) {
        require(tasks[taskId].isActive, "Task is not active");
        _;
    }
    
    // --- Constructor ---
    
    constructor() {
        owner = msg.sender;
        feeRecipient = msg.sender;
    }
    
    // --- Core Functions ---
    
    /**
     * @notice Creates a new task that can be funded and completed
     * @param taskId Unique identifier for the task
     * @param rewardPerCompletion Amount paid per task completion
     * @param maxCompletions Maximum number of completions allowed
     */
    function createTask(
        string memory taskId,
        uint256 rewardPerCompletion,
        uint256 maxCompletions
    ) external {
        require(bytes(taskId).length > 0, "Task ID cannot be empty");
        require(bytes(tasks[taskId].taskId).length == 0, "Task already exists");
        require(rewardPerCompletion > 0, "Reward must be > 0");
        require(maxCompletions > 0, "Max completions must be > 0");
        
        Task storage newTask = tasks[taskId];
        newTask.taskId = taskId;
        newTask.developer = msg.sender;
        newTask.rewardPerCompletion = rewardPerCompletion;
        newTask.totalFunded = 0;
        newTask.totalCompletions = 0;
        newTask.maxCompletions = maxCompletions;
        newTask.isActive = true;
        
        allTaskIds.push(taskId);
        userTasks[msg.sender].push(taskId);
        
        emit TaskCreated(taskId, msg.sender, rewardPerCompletion, maxCompletions);
    }
    
    /**
     * @notice Fund a task with ETH (staking mechanism)
     * @param taskId The task to fund
     */
    function fundTask(string memory taskId) 
        external 
        payable 
        taskExists(taskId) 
        taskActive(taskId) 
    {
        require(msg.value > 0, "Must send ETH to fund task");
        
        Task storage task = tasks[taskId];
        bytes32 stakeKey = keccak256(abi.encodePacked(msg.sender, taskId));
        
        // Update or create stake record
        if (stakes[stakeKey].amount == 0) {
            stakes[stakeKey] = Stake({
                staker: msg.sender,
                taskId: taskId,
                amount: msg.value,
                timestamp: block.timestamp,
                isActive: true
            });
            taskStakers[taskId].push(msg.sender);
        } else {
            stakes[stakeKey].amount += msg.value;
        }
        
        task.totalFunded += msg.value;
        
        emit TaskFunded(taskId, msg.sender, msg.value, task.totalFunded);
    }
    
    /**
     * @notice Mark task as completed by a tester and distribute reward
     * @param taskId The completed task
     * @param tester Address of the tester who completed the task
     */
    function completeTask(string memory taskId, address tester) 
        external 
        taskExists(taskId) 
        taskActive(taskId) 
    {
        Task storage task = tasks[taskId];
        
        // Only developer or contract owner can mark completions
        require(
            msg.sender == task.developer || msg.sender == owner,
            "Only developer or owner can mark completion"
        );
        require(!task.hasCompleted[tester], "Tester already completed this task");
        require(task.totalCompletions < task.maxCompletions, "Task completion limit reached");
        
        uint256 reward = task.rewardPerCompletion;
        require(task.totalFunded >= reward, "Insufficient funds for reward");
        
        // Calculate platform fee
        uint256 platformFee = (reward * platformFeePercent) / 10000;
        uint256 testerReward = reward - platformFee;
        
        // Mark as completed
        task.hasCompleted[tester] = true;
        task.totalCompletions++;
        task.totalFunded -= reward;
        
        // Transfer rewards
        if (testerReward > 0) {
            (bool success, ) = payable(tester).call{value: testerReward}("");
            require(success, "Failed to send reward to tester");
        }
        
        if (platformFee > 0) {
            (bool feeSuccess, ) = payable(feeRecipient).call{value: platformFee}("");
            require(feeSuccess, "Failed to send platform fee");
        }
        
        // Deactivate task if max completions reached
        if (task.totalCompletions >= task.maxCompletions) {
            task.isActive = false;
        }
        
        emit TaskCompleted(taskId, tester, testerReward);
    }
    
    /**
     * @notice Withdraw staked funds (only if task is inactive or by developer)
     * @param taskId The task to withdraw from
     */
    function withdrawStake(string memory taskId) 
        external 
        taskExists(taskId) 
    {
        Task storage task = tasks[taskId];
        bytes32 stakeKey = keccak256(abi.encodePacked(msg.sender, taskId));
        Stake storage stake = stakes[stakeKey];
        
        require(stake.amount > 0, "No stake to withdraw");
        require(stake.isActive, "Stake already withdrawn");
        
        // Can withdraw if task is inactive or if you're the developer
        require(
            !task.isActive || msg.sender == task.developer,
            "Can only withdraw from inactive tasks or as developer"
        );
        
        uint256 withdrawAmount = stake.amount;
        stake.amount = 0;
        stake.isActive = false;
        
        // Update task funding
        task.totalFunded -= withdrawAmount;
        
        (bool success, ) = payable(msg.sender).call{value: withdrawAmount}("");
        require(success, "Failed to send withdrawal");
        
        emit StakeWithdrawn(taskId, msg.sender, withdrawAmount);
    }
    
    /**
     * @notice Deactivate a task (developer only)
     * @param taskId The task to deactivate
     */
    function deactivateTask(string memory taskId) 
        external 
        taskExists(taskId) 
    {
        Task storage task = tasks[taskId];
        require(msg.sender == task.developer, "Only developer can deactivate");
        require(task.isActive, "Task already inactive");
        
        task.isActive = false;
        
        emit TaskDeactivated(taskId, msg.sender);
    }
    
    // --- View Functions ---
    
    /**
     * @notice Get task details
     */
    function getTask(string memory taskId) 
        external 
        view 
        returns (
            address developer,
            uint256 rewardPerCompletion,
            uint256 totalFunded,
            uint256 totalCompletions,
            uint256 maxCompletions,
            bool isActive
        ) 
    {
        Task storage task = tasks[taskId];
        return (
            task.developer,
            task.rewardPerCompletion,
            task.totalFunded,
            task.totalCompletions,
            task.maxCompletions,
            task.isActive
        );
    }
    
    /**
     * @notice Check if a tester has completed a specific task
     */
    function hasCompletedTask(string memory taskId, address tester) 
        external 
        view 
        returns (bool) 
    {
        return tasks[taskId].hasCompleted[tester];
    }
    
    /**
     * @notice Get user's stake in a task
     */
    function getUserStake(address user, string memory taskId) 
        external 
        view 
        returns (uint256 amount, bool isActive) 
    {
        bytes32 stakeKey = keccak256(abi.encodePacked(user, taskId));
        Stake storage stake = stakes[stakeKey];
        return (stake.amount, stake.isActive);
    }
    
    /**
     * @notice Get all task IDs
     */
    function getAllTasks() external view returns (string[] memory) {
        return allTaskIds;
    }
    
    /**
     * @notice Get tasks created by a user
     */
    function getUserTasks(address user) external view returns (string[] memory) {
        return userTasks[user];
    }
    
    /**
     * @notice Get available reward pool for a task
     */
    function getAvailableRewards(string memory taskId) 
        external 
        view 
        returns (uint256 availableRewards, uint256 possibleCompletions) 
    {
        Task storage task = tasks[taskId];
        availableRewards = task.totalFunded;
        possibleCompletions = task.totalFunded / task.rewardPerCompletion;
        
        // Cap by max completions remaining
        uint256 remainingCompletions = task.maxCompletions - task.totalCompletions;
        if (possibleCompletions > remainingCompletions) {
            possibleCompletions = remainingCompletions;
        }
    }
    
    // --- Admin Functions ---
    
    /**
     * @notice Update platform fee (owner only)
     */
    function setPlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercent = newFeePercent;
    }
    
    /**
     * @notice Update fee recipient (owner only)
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }
    
    /**
     * @notice Emergency withdrawal (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }
    
    // --- Receive ETH ---
    
    receive() external payable {
        // Allow contract to receive ETH
    }
}
