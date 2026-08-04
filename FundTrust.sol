// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FundTrust {
// ==========================
// 1. State Variables
// ==========================
address public owner;
uint256 public programCounter;

// ==========================
// 2. Struct
// ==========================
struct AidProgram {
    uint256 id;
    string title;
    string description;
    uint256 totalFund;
    uint256 depositedFund;
    uint256 remainingFund;
    bool active;
}

struct RecipientAllocation {
    uint256 allocatedAmount;
    bool released;
    bool claimed;
}

// ==========================
// 3. Mapping
// ==========================
mapping(uint256 => AidProgram) public programs;
mapping(uint256 => address[]) public programRecipients;
mapping(uint256 => mapping(address => RecipientAllocation)) public allocations;

// ==========================
// 4. Events
// ==========================
event ProgramCreated(
    uint256 indexed programId,
    string title,
    uint256 totalFund
);

event FundDeposited(
    uint256 indexed programId,
    uint256 amount
);

event FundAllocated(
    uint256 indexed programId,
    address indexed recipient,
    uint256 amount
);

event FundReleased(
    uint256 indexed programId,
    address indexed recipient,
    uint256 amount
);

event AidClaimed(
    uint256 indexed programId,
    address indexed recipient,
    uint256 amount
);

// ==========================
// 5. Constructor
// ==========================
constructor() {
    owner = msg.sender;
}

receive() external payable {}

// ==========================
// 6. Modifier
// ==========================
modifier onlyAdmin() {
    require(msg.sender == owner, "Only admin can perform this action");
    _;
}

// ==========================
// 7. Functions
// ==========================
function createProgram(
    string memory _title,
    string memory _description,
    uint256 _totalFund
) public onlyAdmin {

    require(bytes(_title).length > 0, "Title cannot be empty");
    require(bytes(_description).length > 0, "Description cannot be empty");
    require(_totalFund > 0, "Fund must be greater than 0");

programCounter++;

programs[programCounter] = AidProgram({
    id: programCounter,
    title: _title,
    description: _description,
    totalFund: _totalFund,
    depositedFund: 0,
    remainingFund: 0,
    active: true
});

    emit ProgramCreated(
        programCounter,
        _title,
        _totalFund
    );
}

function depositFund(
    uint256 _programId
) public payable onlyAdmin {

    require(
        _programId > 0 &&
        _programId <= programCounter,
        "Invalid program"
    );

    AidProgram storage program = programs[_programId];

    require(program.active, "Program is not active");

    require(msg.value > 0, "Deposit must be greater than 0");

    require(
        program.depositedFund + msg.value <= program.totalFund,
        "Deposit exceeds target fund"
    );

    program.depositedFund += msg.value;
    program.remainingFund += msg.value;

    emit FundDeposited(
        _programId,
        msg.value
    );
}

function allocateFund(
    uint256 _programId,
    address _recipient,
    uint256 _amount
) public onlyAdmin {

    // ==========================
    // Validation
    // ==========================

    require(
        _programId > 0 &&
        _programId <= programCounter,
        "Invalid program"
    );

    require(
        _recipient != address(0),
        "Invalid recipient"
    );

    require(
        _amount > 0,
        "Amount must be greater than 0"
    );

    AidProgram storage program = programs[_programId];

    require(
        program.active,
        "Program is not active"
    );

    require(
        program.remainingFund >= _amount,
        "Insufficient remaining fund"
    );

    RecipientAllocation storage allocation =
        allocations[_programId][_recipient];

    require(
        allocation.allocatedAmount == 0,
        "Recipient already allocated"
    );

    // ==========================
    // Allocate
    // ==========================

    allocation.allocatedAmount = _amount;
    allocation.released = false;
    allocation.claimed = false;

    program.remainingFund -= _amount;

    programRecipients[_programId].push(_recipient);

    emit FundAllocated(
        _programId,
        _recipient,
        _amount
    );
}

function releaseFund(
    uint256 _programId,
    address _recipient
) public onlyAdmin {

    require(
        _programId > 0 &&
        _programId <= programCounter,
        "Invalid program"
    );

    RecipientAllocation storage allocation =
        allocations[_programId][_recipient];

    require(
        allocation.allocatedAmount > 0,
        "Recipient not allocated"
    );

    require(
        !allocation.released,
        "Fund already released"
    );

    allocation.released = true;

    emit FundReleased(
        _programId,
        _recipient,
        allocation.allocatedAmount
    );
}

function claimAid(
    uint256 _programId
) public {

    RecipientAllocation storage allocation =
        allocations[_programId][msg.sender];

    require(
        allocation.allocatedAmount > 0,
        "No allocation found"
    );

    require(
        allocation.released,
        "Fund has not been released"
    );

    require(
        !allocation.claimed,
        "Aid already claimed"
    );

    require(
        _programId > 0 &&
         _programId <= programCounter,
        "Invalid program"
    );

    allocation.claimed = true;

    payable(msg.sender).transfer(
        allocation.allocatedAmount
    );

    emit AidClaimed(
        _programId,
        msg.sender,
        allocation.allocatedAmount
    );
}

function getProgram(
    uint256 _programId
)
    public
    view
    returns (
        uint256,
        string memory,
        string memory,
        uint256,
        uint256,
        uint256,
        bool
    )
{
    AidProgram memory program = programs[_programId];

    return (
        program.id,
        program.title,
        program.description,
        program.totalFund,
        program.depositedFund,
        program.remainingFund,
        program.active
    );
}

function getAllocation(
    uint256 _programId,
    address _recipient
)
    public
    view
    returns (
        uint256,
        bool,
        bool
    )
{
    RecipientAllocation memory allocation =
        allocations[_programId][_recipient];

    return (
        allocation.allocatedAmount,
        allocation.released,
        allocation.claimed
    );
}

function getProgramRecipients(
    uint256 _programId
)
    public
    view
    returns (address[] memory)
{
    return programRecipients[_programId];
}

function getContractBalance()
    public
    view
    returns (uint256)
{
    return address(this).balance;
}

}
