const ETHPool = artifacts.require("ETHPool");

const { BN } = require("@openzeppelin/test-helpers");
module.exports = async (callBack) => {
  const ethpool = await ETHPool.at(
    "0x735aBD18d69cd66098A7bDB457B4Bed8Bc891a92"
  );
  let balance = await ethpool.totalBalance();
  console.log(
    "ETH depositted in the contract :",
    Number(new BN(balance)),
    "wei"
  );
};
