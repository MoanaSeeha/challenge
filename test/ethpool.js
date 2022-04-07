const {
  expectRevert,
  expectAlmostEqualMantissa,
  bnMantissa,
  BN,
} = require("./Utils/JS");

const ETHPool = artifacts.require("ETHPoolHarness");

const oneMantissa = new BN(10).pow(new BN(18));

contract("ETHPool", function (accounts) {
  let root = accounts[0];
  let userA = accounts[1];
  let userB = accounts[2];

  const zeroMatinssa = new BN(0);

  const depositAAmount0 = oneMantissa.mul(new BN(10));
  const depositBAmount0 = oneMantissa.mul(new BN(30));
  const depositReward0 = oneMantissa.mul(new BN(20));
  const depositReward1 = oneMantissa.mul(new BN(40));
  const TIME_START = new BN(1600000000);
  const TIME_1WEEK = new BN(7 * 24 * 3600);

  let ethpool;

  before(async () => {
    ethpool = await ETHPool.new();
  });

  it("deposit user A", async () => {
    await ethpool.deposit({ from: userA, value: depositAAmount0 });
    expectAlmostEqualMantissa(
      await ethpool.depositAmount(userA),
      depositAAmount0
    );
    expectAlmostEqualMantissa(await ethpool.totalBalance(), depositAAmount0);
  });

  it("fails if deposit 0", async () => {
    await expectRevert(ethpool.deposit({ from: userA }), "must deposit");
  });

  it("userA deposit and team deposit", async () => {
    await ethpool.setBlockTimestamp(TIME_START);
    //    console.log("current time stamp", await ethpool.getBlockTimestamp());
    await ethpool.depositReward({ from: root, value: depositReward0 });
    expectAlmostEqualMantissa(
      await ethpool.depositAmount(userA),
      depositAAmount0.add(depositReward0)
    );
    expectAlmostEqualMantissa(
      await ethpool.totalBalance(),
      depositAAmount0.add(depositReward0)
    );
    //withdraw fails too early
    // expectRevert(
    //   ethpool.withdraw({ from: userA }),
    //   "You can withdraw after a week"
    // );
    // team deposit too early
    expectRevert(
      ethpool.depositReward({ from: root, value: depositReward1 }),
      "can deposit once per week"
    );
  });

  it("withdraw after 1 week", async () => {
    await ethpool.setBlockTimestamp(TIME_START.add(TIME_1WEEK));
    expectAlmostEqualMantissa(
      await ethpool.getBlockTimestamp(),
      TIME_START.add(TIME_1WEEK)
    );
    await ethpool.withdraw({ from: userA });

    expectAlmostEqualMantissa(await ethpool.depositAmount(userA), zeroMatinssa);
  });

  it("userA deposit and userB deposit, team deposit.  withdraw after 1 week", async () => {
    await ethpool.setBlockTimestamp(TIME_START.add(TIME_1WEEK.mul(new BN(2))));
    await ethpool.deposit({ from: userA, value: depositAAmount0 });
    await ethpool.deposit({ from: userB, value: depositBAmount0 });
    await ethpool.depositReward({ from: root, value: depositReward0 });

    //    console.log(await ethpool.depositAmount(userA));

    expectAlmostEqualMantissa(
      await ethpool.depositAmount(userA),
      depositAAmount0.add(
        depositReward0
          .mul(depositAAmount0)
          .div(depositAAmount0.add(depositBAmount0))
      )
    );

    expectAlmostEqualMantissa(
      await ethpool.depositAmount(userB),
      depositBAmount0.add(
        depositReward0
          .mul(depositBAmount0)
          .div(depositAAmount0.add(depositBAmount0))
      )
    );

    await ethpool.setBlockTimestamp(TIME_START.add(TIME_1WEEK.mul(new BN(3))));
    await ethpool.withdraw({ from: userA });
    expectAlmostEqualMantissa(await ethpool.depositAmount(userA), zeroMatinssa);
    expectAlmostEqualMantissa(
      await ethpool.totalBalance(),
      await ethpool.depositAmount(userB)
    );

    await ethpool.withdraw({ from: userB });
    expectAlmostEqualMantissa(await ethpool.depositAmount(userB), zeroMatinssa);
    expectAlmostEqualMantissa(await ethpool.totalBalance(), zeroMatinssa);
  });
});
//https://rinkeby.etherscan.io/address/0x735aBD18d69cd66098A7bDB457B4Bed8Bc891a92#code
