import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

//address of the printed ERC-20 contract 
const tokenModule = sdk.getTokenModule(
  "0xA1837F595d5651460d001911a122cefC14FC4b81",
);

(async () => {
  try {
    //max supply of the token 
    const amount = 1_000_000;
    // util function from "ethers" to convert the amount
    // to have 18 decimals (which is the standard for ERC20 tokens)
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
    // Interect with the ERC 20 contract and mint the token
    await tokenModule.mint(amountWith18Decimals);
    const totalSupply = await tokenModule.totalSupply();

    // Print out how many of our token's are out there now!
    console.log("✅ There now is",ethers.utils.formatUnits(totalSupply, 18),
      "$MOON in circulation",);
     }
  catch (error) {
    console.error("Failed to print money", error);
  }

})();

