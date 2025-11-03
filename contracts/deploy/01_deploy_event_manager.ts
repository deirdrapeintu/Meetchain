import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get, execute, log } = hre.deployments;

  const poap = await get("POAPToken");

  const em = await deploy("EventManagerFHE", {
    from: deployer,
    args: [poap.address],
    log: true,
  });
  log(`EventManagerFHE deployed at ${em.address}`);

  // set minter on POAPToken to EventManagerFHE
  await execute("POAPToken", { from: deployer, log: true }, "setMinter", em.address);
};

export default func;
func.id = "deploy_event_manager_fhe";
func.tags = ["EventManager", "all"];


