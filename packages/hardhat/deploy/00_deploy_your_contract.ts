import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployCharityFund: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const approvers = [deployer]; // Список одобряющих (мультиподписи)

  await deploy("CharityFund", {
    from: deployer,
    args: [approvers],
    log: true,
  });
};

export default deployCharityFund;
deployCharityFund.tags = ["CharityFund"];
