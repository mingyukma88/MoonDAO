import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule(
  "0xA1837F595d5651460d001911a122cefC14FC4b81",
);

(async () => {
    try {
      //Log the current roles 
      console.log("👀 Roles that exist right now:", 
      await tokenModule.getAllRoleMembers()
      );

      //Revoke all the superpower in the ERC-20 Contract
      await tokenModule.revokeALlRolesFromAddress(process.env.WALLET_ADDRESS);
      console.log( "🎉 Roles after revoking ourselves", await tokenModule.getAllRoleMembers());
      console.log("✅ Successfully revoked our superpowers from the ERC-20 contract");
    }

    catch (err) {
      console.log("Failed to revoke ourselves from the DAO", error);
      
    }



}) ();