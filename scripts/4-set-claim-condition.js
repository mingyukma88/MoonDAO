import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule(
  "0x8Ff686c0E29c5C262fB2C9511f8205B7351c76Fb",
);

(async () => {
  try{
    const claimConditionFactory = bundleDrop.getClaimConditionFactory();
    // specify condition 
    claimConditionFactory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 66_666,
      maxQuantityTransaction: 1,

    });

    await bundleDrop.setClaimCondition(0, claimConditionFactory);
        console.log("✅ Sucessfully set claim condition on bundle drop:", bundleDrop.address);
  } catch (error) {
    console.error("Failed to set claim condition", error);
  }


})()
