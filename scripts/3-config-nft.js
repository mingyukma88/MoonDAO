import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
   "0x8Ff686c0E29c5C262fB2C9511f8205B7351c76Fb",
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Moon BTC",
        description: "This NFT give you access to MoonDAO",
        image: readFileSync("scripts/assets/btc.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})()


