import sdk from "./1-initialize-sdk.js";

//Grab the app module address
const appModule = sdk.getAppModule("0xE61A4A5E9d678C620ef6136D7B10b61ADE5a3649",);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({

    //Give goverment contract a name 
    name: "MoonDAO's Launch Proposal",

    //ERC20 contract
    votingTokenAddress:"0xA1837F595d5651460d001911a122cefC14FC4b81",

    // Allow members to immediately vote after a proposal is created
    proposalStartWaitTimeInSeconds: 0,

    // Members allow to vote in 24 hours
    proposalVotingTimeInSeconds: 24 * 60 * 60,

    //
    votingQuorumFraction: 0,

    // What's the minimum # of tokens a user needs to be allowed to create a proposal?
    // I set it to 0. Meaning no tokens are required for a user to be allowed to
    // create a proposal.
    minimumNumberOfTokensNeededToPropose: "0",

    });

    console.log("successfully deployed vote module, address: ", voteModule.address,);
  } catch(err) {
    console.error("Failed to deploy vote module", err);
  }

}) ();