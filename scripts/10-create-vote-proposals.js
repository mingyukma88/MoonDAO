import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

//Voting contract 
const voteModule = sdk.getVoteModule(
  "0xA8Ec9B1C8e552329EcF9AE7056aD93FB564C9E01"
);

//ERC-20 contract 
const tokenModule = sdk.getTokenModule(
  "0xA1837F595d5651460d001911a122cefC14FC4b81"
);

(async() => {
  try {
    const amount = 300_000;
    //create proposal to mint 300_000 token 
    await voteModule.propose(
    "Should the DAO mint an additional " + amount + " tokens into the treasury?",
    [
       {
         //NativeToken is eth and we are sending nativetokenValue to the proposal which is 0 eth
         //we are minting new tokens to the treaury 
         nativeTokenValue: 0,
         transactionData: tokenModule.contract.interface.encodeFunctionData(
           //mint to the voteModule (treasury)
          "mint",
          [
            voteModule.address,
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
         ),
         //tokenModule execute the mint 
        toAddress: tokenModule.address,
       },

  ]
  );
  console.log("✅ Successfully created proposal to mint tokens");
  } catch (error) {
    console.error("failed to create first proposal", error);
    process.exit(1);
  }

  try {
    const amount = 60_000;
    //create proposal to transfer 60_000 tokens to ourselves 
    await voteModule.propose(
      "Should the DAO transfer " + amount + " token from the treasury to " + process.env.WALLET_ADDRESS + " for being awesome?",
      [
        {
          // we are sending oursleves 0 eth. we are just sending our own tokens
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            //transfer from the treasury to our wallet 
            "transfer",
            [
              process.env.WALLET_ADDRESS,
              ethers.utils.parseUnits(amount.toString(), 18),
            ]
          ),
          toAddress: tokenModule.address,
        },
      ]
    );
   console.log("✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!");
  }
  catch (error) {
    console.error("failed to create second proposal", error);
  }

})();