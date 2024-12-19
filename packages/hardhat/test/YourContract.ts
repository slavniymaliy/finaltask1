import { expect } from "chai";
import { ethers } from "hardhat";

describe("CharityFund", function () {
  let charityFund: any;
  let owner: any;
  let projectOwner: any;
  
  const approvers = [
    "0x0000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000002",
  ];

  before(async () => {
    [owner, projectOwner] = await ethers.getSigners();

    const CharityFundFactory = await ethers.getContractFactory("CharityFund");

    charityFund = await CharityFundFactory.deploy(approvers);
  });

  describe("Deployment", function () {
    it("Должен развернуть контракт с правильными approvers", async function () {
      const approversFromContract = await charityFund.getApprovers();
      expect(approversFromContract.length).to.equal(2);
      expect(approversFromContract[0]).to.equal(approvers[0]);
      expect(approversFromContract[1]).to.equal(approvers[1]);
    });
  });

  describe("Create Project", function () {
    it("Создать проект с верными данными", async function () {
      await charityFund.createProject("Project 1", projectOwner.address);
      
      const project = await charityFund.projects(0);
      expect(project.name).to.equal("Project 1");
      expect(project.owner).to.equal(projectOwner.address);
      expect(project.isActive).to.equal(true);
    });
  });
});
