// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Market {
    enum State { Funding, Active, Repaid, Defaulted }
    
    State public currentState;
    address public immutable borrower;
    IERC20 public immutable asset;
    uint256 public immutable loanAmount;
    uint256 public immutable interestRateBps;
    uint256 public immutable tenorSeconds;
    string public projectDataCID;
    uint256 public totalDeposited;
    uint256 public fundingDeadline;
    uint256 public loanStartTime;
    mapping(address => uint256) public depositsOf;
    
    event Deposited(address indexed lender, uint256 amount);
    event Claimed(address indexed lender, uint256 amount);
    event LoanStarted(uint256 startTime, uint256 fundingAmount);
    event LoanRepaid(uint256 totalAmount);
    event MarkedAsDefaulted();

    constructor(
        address _asset,
        address _borrower,
        uint256 _loanAmount,
        uint256 _interestRateBps,
        uint256 _tenorSeconds,
        string memory _projectDataCID
    ) {
        asset = IERC20(_asset);
        borrower = _borrower;
        loanAmount = _loanAmount;
        interestRateBps = _interestRateBps;
        tenorSeconds = _tenorSeconds;
        projectDataCID = _projectDataCID;
        currentState = State.Funding;
        fundingDeadline = block.timestamp + 30 days;
    }

    function deposit(uint256 _amount) external {
        require(currentState == State.Funding, "Not in funding state");
        uint256 amountToDeposit = totalDeposited + _amount > loanAmount ? loanAmount - totalDeposited : _amount;
        require(amountToDeposit > 0, "Market is fully funded");
        totalDeposited += amountToDeposit;
        depositsOf[msg.sender] += amountToDeposit;
        asset.transferFrom(msg.sender, address(this), amountToDeposit);
        emit Deposited(msg.sender, amountToDeposit);
    }

    function startAndBorrow() external {
        require(msg.sender == borrower, "Only borrower");
        require(currentState == State.Funding, "Loan not in funding state");
        require(totalDeposited == loanAmount, "Funding not complete");
        currentState = State.Active;
        loanStartTime = block.timestamp;
        asset.transfer(borrower, loanAmount);
        emit LoanStarted(loanStartTime, loanAmount);
    }

    function repay() external {
        require(currentState == State.Active, "Loan is not active");
        require(msg.sender == borrower, "Only borrower can repay");
        
        // Calculate actual time elapsed since loan start
        uint256 timeElapsed = block.timestamp - loanStartTime;
        
        // Cap at tenor seconds to prevent over-calculation
        uint256 actualTime = timeElapsed > tenorSeconds ? tenorSeconds : timeElapsed;
        
        // Interest calculation based on actual time elapsed
        uint256 interest = (loanAmount * interestRateBps * actualTime) / (10000 * 365 days);
        uint256 totalOwed = loanAmount + interest;
        
        currentState = State.Repaid;
        asset.transferFrom(msg.sender, address(this), totalOwed);
        emit LoanRepaid(totalOwed);
    }

    function claim() external {
        require(currentState == State.Repaid || currentState == State.Defaulted, "Loan not finished");
        uint256 principal = depositsOf[msg.sender];
        require(principal > 0, "No deposit to claim");
        uint256 amountToClaim = principal;
        
        if (currentState == State.Repaid) {
            // Calculate interest based on actual time elapsed (same as repay function)
            uint256 timeElapsed = block.timestamp - loanStartTime;
            uint256 actualTime = timeElapsed > tenorSeconds ? tenorSeconds : timeElapsed;
            uint256 totalInterest = (loanAmount * interestRateBps * actualTime) / (10000 * 365 days);
            uint256 myInterest = (principal * totalInterest) / loanAmount;
            amountToClaim += myInterest;
        } else if (currentState == State.Defaulted) {
            // In default state, lenders get partial recovery based on available funds
            uint256 contractBalance = asset.balanceOf(address(this));
            uint256 recoveryRate = 70; // 70% recovery rate if funds available
            uint256 idealRecovery = (principal * recoveryRate) / 100;
            
            // Calculate proportional recovery based on available funds
            if (contractBalance >= totalDeposited * recoveryRate / 100) {
                amountToClaim = idealRecovery;
            } else {
                // Pro-rata recovery based on available balance
                amountToClaim = (principal * contractBalance) / totalDeposited;
            }
        }
        
        depositsOf[msg.sender] = 0;
        asset.transfer(msg.sender, amountToClaim);
        emit Claimed(msg.sender, amountToClaim);
    }

    function markAsDefaulted() external {
        require(currentState == State.Active, "Loan is not active");
        require(block.timestamp > loanStartTime + tenorSeconds, "Loan term not over yet");
        currentState = State.Defaulted;
        emit MarkedAsDefaulted();
    }
}