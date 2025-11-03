import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;

  const d = await deploy("POAPToken", {
    from: deployer,
    args: ["MeetChain POAP", "MPOAP"],
    log: true,
  });
  log(`POAPToken deployed at ${d.address}`);
};

export default func;
func.id = "deploy_poap";
func.tags = ["POAP", "all"];


