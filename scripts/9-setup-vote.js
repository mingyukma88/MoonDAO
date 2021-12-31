import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

//Governance Contract 
const voteModule = sdk.getVoteModule("0xA8Ec9B1C8e552329EcF9AE7056aD93FB564C9E01");

//ERC20 Module 
const tokenModule = sdk.getTokenModule("0xA1837F595d5651460d001911a122cefC14FC4b81"); 

(async () => {
  try {
    //give treasury to mine additional token if needed 
    await tokenModule.grantRole("minter", voteModule.address);

    console.log("Successfully gave vote module permissions to act on token module");  
  }
  catch(error) {
    console.error("failed to grant vote module permissions on token module", error);
    process.exit(1);
  }

  try {
    // Grab our wallet's token balance, remember -- we hold basically the entire supply right now!
    const ownedTokenBalance = await tokenModule.balanceOf(
    process.env.WALLET_ADDRESS
  );

    // Grab 90% of the supply that we hold.
    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent90 = ownedAmount.div(100).mul(90);

    //Transfer 90% of the supply to the voting contract 
    await tokenModule.transfer(
      voteModule.address,
      percent90
    );

    console.log("✅ Successfully transferred tokens to vote module");    
  } catch(err) {
    console.error("failed to transfer tokens to vote module", err);
  }

})();