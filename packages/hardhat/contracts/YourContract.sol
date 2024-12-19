// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CharityFund {
    struct Project {
        string name;
        uint256 totalDonations;
        address payable owner;
        bool isActive;
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCount;
    address[] public approvers;

    constructor(address[] memory _approvers) {
        approvers = _approvers;
    }

    function createProject(string memory name, address payable owner) external {
        projects[projectCount] = Project(name, 0, owner, true);
        projectCount++;
    }

    function donate(uint256 projectId) external payable {
        require(projects[projectId].isActive, "Project is not active");
        projects[projectId].totalDonations += msg.value;
    }

    function withdraw(uint256 projectId, uint256 amount) external {
        Project storage project = projects[projectId];
        require(msg.sender == project.owner, "Only owner can withdraw");
        require(project.totalDonations >= amount, "Insufficient funds");
        require(isApproved(msg.sender), "Not approved by approvers");

        project.totalDonations -= amount;
        project.owner.transfer(amount);
    }

    function isApproved(address requester) internal view returns (bool) {
        for (uint256 i = 0; i < approvers.length; i++) {
            if (approvers[i] == requester) return true;
        }
        return false;
    }

    function getApprovers() external view returns (address[] memory) {
        return approvers;
    }
}
