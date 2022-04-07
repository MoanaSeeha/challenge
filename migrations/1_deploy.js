const ETHPool = artifacts.require("ETHPool");

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(ETHPool);
};
