// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IBetOracle
 * @dev Interface for oracle integration
 */
interface IBetOracle {
    function requestOutcome(string memory eventId) external returns (uint256 requestId);
    function getOutcome(uint256 requestId) external view returns (bool outcome, bool isSettled);
}

/**
 * @title ILiquidityPool
 * @dev Interface for liquidity pool integration
 */
interface ILiquidityPool {
    function calculateEntryPrice(uint256 betId) external view returns (uint256);
    function provideLiquidity(uint256 betId) external returns (bool);
}

/**
 * @title CoreBetting
 * @dev Implements the core betting functionality with support for oracle and liquidity pool integration
 */
contract CoreBettingBackup is  Ownable {
    // Represents the current state of a bet
    enum BetState { Created, Active, Settled, Cancelled }
    
    // Detailed information about each bet
    struct Bet {
        string eventId;           // Unique identifier for the event
        address creator;          // Address of the bet creator
        uint256 amount;          // Initial bet amount
        uint256 oracleRequestId; // ID for oracle request
        bool creatorPrediction;  // The outcome creator is betting on
        BetState state;          // Current state of the bet
        uint256 totalPool;       // Total amount in the betting pool
        mapping(address => Position) positions; // Tracks all positions in this bet
    }

    // Represents a position in a bet
    struct Position {
        uint256 amount;         // Amount staked
        bool prediction;        // Predicted outcome
        uint256 entryPrice;    // Price at which position was taken
    }

    // Contract dependencies
    IERC20 public bettingToken;
    IBetOracle public oracle;
    ILiquidityPool public liquidityPool;
    
    // Storage
    mapping(uint256 => Bet) public bets;
    uint256 public nextBetId;
    
    // Events
    event BetCreated(uint256 indexed betId, address indexed creator, string eventId, uint256 amount);
    event PositionTaken(uint256 indexed betId, address indexed user, uint256 amount, bool prediction, uint256 entryPrice);
    event BetSettled(uint256 indexed betId, bool outcome);
    event BetCancelled(uint256 indexed betId);

    constructor(
        address _bettingToken,
        address _oracle,
        address _liquidityPool
    ) Ownable(msg.sender) {
        bettingToken = IERC20(_bettingToken);
        oracle = IBetOracle(_oracle);
        liquidityPool = ILiquidityPool(_liquidityPool);
    }

    /**
     * @dev Creates a new bet for an event
     * @param eventId Unique identifier for the event
     * @param amount Initial bet amount
     * @param prediction Predicted outcome
     */
    function createBet(
        string memory eventId,
        uint256 amount,
        bool prediction
    ) external returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from creator
        require(bettingToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        // Create new bet
        uint256 betId = nextBetId++;
        Bet storage bet = bets[betId];
        bet.eventId = eventId;
        bet.creator = msg.sender;
        bet.amount = amount;
        bet.creatorPrediction = prediction;
        bet.state = BetState.Created;
        bet.totalPool = amount;
        
        // Record creator's position
        bet.positions[msg.sender] = Position({
            amount: amount,
            prediction: prediction,
            entryPrice: amount // Initial entry price is the same as amount
        });
        
        // Request outcome from oracle
        bet.oracleRequestId = oracle.requestOutcome(eventId);
        
        emit BetCreated(betId, msg.sender, eventId, amount);
        return betId;
    }

    /**
     * @dev Takes a position in an existing bet
     * @param betId ID of the bet
     * @param prediction Predicted outcome
     */
    function takePosition(
        uint256 betId,
        bool prediction
    ) external {
        Bet storage bet = bets[betId];
        require(bet.state == BetState.Created, "Bet not available");
        
        // Calculate entry price from liquidity pool
        uint256 entryPrice = liquidityPool.calculateEntryPrice(betId);
        require(entryPrice > 0, "Invalid entry price");
        
        // Transfer tokens from user
        require(bettingToken.transferFrom(msg.sender, address(this), entryPrice), "Token transfer failed");
        
        // Update bet state
        bet.totalPool += entryPrice;
        bet.positions[msg.sender] = Position({
            amount: entryPrice,
            prediction: prediction,
            entryPrice: entryPrice
        });
        
        // Request liquidity if needed
        if (liquidityPool.provideLiquidity(betId)) {
            bet.state = BetState.Active;
        }
        
        emit PositionTaken(betId, msg.sender, entryPrice, prediction, entryPrice);
    }

    /**
     * @dev Settles a bet after oracle provides outcome
     * @param betId ID of the bet to settle
     */
    function settleBet(uint256 betId) external {
        Bet storage bet = bets[betId];
        require(bet.state == BetState.Active, "Bet not active");
        
        // Get outcome from oracle
        (bool outcome, bool isSettled) = oracle.getOutcome(bet.oracleRequestId);
        require(isSettled, "Outcome not available");
        
        bet.state = BetState.Settled;
        
        // Calculate and distribute winnings
        _distributeWinnings(betId, outcome);
        
        emit BetSettled(betId, outcome);
    }

    /**
     * @dev Internal function to distribute winnings
     * @param betId ID of the bet
     * @param outcome Final outcome from oracle
     */
    function _distributeWinnings(uint256 betId, bool outcome) internal {
        Bet storage bet = bets[betId];
        
        // Calculate total winning amount
        uint256 totalWinningAmount = 0;
        address[] memory winners = new address[](nextBetId); // Maximum possible winners
        uint256 winnerCount = 0;
        
        // Identify winners and calculate total winning amount
        for (uint256 i = 0; i < nextBetId; i++) {
            address participant = address(uint160(i)); // Convert index to address
            Position memory position = bet.positions[participant];
            
            if (position.amount > 0 && position.prediction == outcome) {
                winners[winnerCount] = participant;
                totalWinningAmount += position.amount;
                winnerCount++;
            }
        }
        
        // Distribute winnings proportionally
        for (uint256 i = 0; i < winnerCount; i++) {
            address winner = winners[i];
            Position memory position = bet.positions[winner];
            
            uint256 share = (position.amount * bet.totalPool) / totalWinningAmount;
            require(bettingToken.transfer(winner, share), "Transfer failed");
        }
    }

    /**
     * @dev Allows cancellation of a bet before it becomes active
     * @param betId ID of the bet to cancel
     */
    function cancelBet(uint256 betId) external {
        Bet storage bet = bets[betId];
        require(msg.sender == bet.creator, "Not creator");
        require(bet.state == BetState.Created, "Cannot cancel");
        
        bet.state = BetState.Cancelled;
        
        // Refund all participants
        for (uint256 i = 0; i < nextBetId; i++) {
            address participant = address(uint160(i));
            Position memory position = bet.positions[participant];
            
            if (position.amount > 0) {
                require(bettingToken.transfer(participant, position.amount), "Refund failed");
            }
        }
        
        emit BetCancelled(betId);
    }

    /**
     * @dev View function to get bet details
     * @param betId ID of the bet
     */
    function getBetDetails(uint256 betId) external view returns (
        string memory eventId,
        address creator,
        uint256 amount,
        bool creatorPrediction,
        BetState state,
        uint256 totalPool
    ) {
        Bet storage bet = bets[betId];
        return (
            bet.eventId,
            bet.creator,
            bet.amount,
            bet.creatorPrediction,
            bet.state,
            bet.totalPool
        );
    }
}