import { useEffect, useMemo, useState } from "react";
// import thirdweb
import { ThirdwebSDK } from "@3rdweb/sdk";
import { useWeb3 } from "@3rdweb/hooks";
import { ethers } from "ethers";

//Instatiate the sdk on Rinskeby 
const sdk = new ThirdwebSDK("rinkeby");

//Grab a reference to the ERC 1155 contract 
const bundleDropModule = sdk.getBundleDropModule(
  "0x8Ff686c0E29c5C262fB2C9511f8205B7351c76Fb",
);

const tokenModule = sdk.getTokenModule(
  "0xA1837F595d5651460d001911a122cefC14FC4b81"
);

const voteModule = sdk.getVoteModule("0xA8Ec9B1C8e552329EcF9AE7056aD93FB564C9E01");

const App = () => {
  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address)

  //the signer required to sign a transaction on the blockchain 
  // without it it can only read data, not write 
  const signer = provider ? provider.getSigner() : undefined;


  // State Variable to see if the user has the NFT
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming is another state to allow loading while the NFT is being minted 
  const [isClaiming, setIsClaiming] = useState(false);

  //hold the amount of token user had in state 
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});

  //Array holding all of the member address 
  const [memberAddresses, setMemberAddresses] = useState([]);

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  //Retrieve all the existing proposals from the contracts 
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // A simple call to voteModule.getAll() to grab the proposals.
    voteModule.getAll()
    .then((proposals) => {
      // setState 
      setProposals(proposals);
      console.log("🌈 Proposals:", proposals)
    })
    .catch((err) => {
      console.error("failed to get proposal", err);
    });
  }, [hasClaimedNFT]);
   
  //Check if the user has voted 
  useEffect(() => {
    if(!hasClaimedNFT) {
      return;
    }

    //if we haven't finished retriving the proposal yet, 
    //we cannot check if the user has voted
    if(!proposals.length) {
      return;
    }

    // Check if the user has already voted on the proposal
    voteModule
    .hasVoted(proposals[0].proposalId, address)
    .then((hasVoted) => {
      setHasVoted(hasVoted);
      if (hasVoted) {
        console.log("🥵 User has already voted")
      }
    })
    .catch((err) => {
      console.error("failed to check if wallet has voted", err);
    });
    
  }, [hasClaimedNFT, proposals, address]);

  //Function to shorten someone's adddress
  const shortenAddress = (str) => {
     return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // This effect grabs all the address of the members holding the NFT
  useEffect(() => {
  if (!hasClaimedNFT) {
    return;
     }

  //Grab all the user who hold the token ID0 NFT
  bundleDropModule.getAllClaimerAddresses("0")
  .then((addresess) => {
    console.log("🚀 Members addresses", addresess)
      setMemberAddresses(addresess);
  })
  .catch((err) => {
      console.error("failed to get member list", err);
    });
  }, [hasClaimedNFT]);

// Ths useEffect grab the # of token each member hold 
useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }
  

// Grab all the balances
tokenModule.getAllHolderBalances()
.then((amounts) => {
      console.log("👜 Amounts", amounts)
      setMemberTokenAmounts(amounts);
    })
    .catch((err) => {
       console.error("failed to get token amounts", err);
    });
  
},[hasClaimedNFT]);

//Now, combine the memberaddress and memberTokenAmount into a single array 
const memberList = useMemo(() => {
  return memberAddresses.map((address) => {
    return {
      address,
      tokenAmount: ethers.utils.formatUnits(
        // If the address isn't in memberTokenAmounts, it means they don't
        // hold any of our token.
        memberTokenAmounts[address] || 0,
        18,
      ),
    };
  });
}, [memberAddresses, memberTokenAmounts]);



  //another useEffect
  useEffect(() => {
    //pass the signer to the SDK, enabling us to interect with the contract 
    sdk.setProviderOrSigner(signer); }, [signer]);



  useEffect( () => {
     //if they don't have a connected wallet, exit!
     if (!address) {
       return;
     }

     //check if the user has the NFT by using bundleDropModule.balanceOf 
     return bundleDropModule
        .balanceOf(address, "0")
        .then((balance) => {
          // If the balance is greater than 0, they will have the NFT
          if (balance.gt(0)) {
            setHasClaimedNFT(true);
            console.log("🌟 this user has a membership NFT!") }
          else {
            setHasClaimedNFT(false);
            console.log("😭 this user doesn't have a membership NFT.")
          }
        })
        .catch((error) => {
          setHasClaimedNFT(false);
        console.error("failed to nft balance", error);
        }); 
        }, [address]);


  // This is the case where the user hasn't connected their wallet
  // to your web app. Let them call connectWallet.
  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to MoonDAO 🌕 </h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet and get some free money
        </button>
      </div>
    );
  }

  //Add this little piece 
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>🌕MoonDAO Member Page</h1>
        <p>Congratulations on being a proud astronaut</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                //before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true);

                // lets get the votes from the form for the values
                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    //abstain by default
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                // first we need to make sure the user delegates their token to vote
                try {
                  //we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await tokenModule.getDelegationOf(address);
                  // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === ethers.constants.AddressZero) {
                    //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                    await tokenModule.delegateTo(address);
                  }
                  // then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        // before voting we first need to check whether the proposal is open for voting
                        // we first need to get the latest state of the proposal
                        const proposal = await voteModule.get(vote.proposalId);
                        // then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // if it is open for voting, we'll vote on it
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }
                        // if the proposal is not open for voting we just return nothing, letting us continue
                        return;
                      })
                    );
                    try {
                      // if any of the propsals are ready to be executed we'll need to execute them
                      // a proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async (vote) => {
                          // we'll first get the latest state of the proposal again, since we may have just voted before
                          const proposal = await voteModule.get(
                            vote.proposalId
                          );

                          //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId);
                          }
                        })
                      );
                      // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true);
                      // and log out a success message
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  // in *either* case we need to set the isVoting state to false to enable the button again
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          //default the "abstain" vote to chedked
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You Already Voted"
                    : "Submit Votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Render mint nft screen.
  return (
    <div className="mint-nft">
      <h1>Mint your free 🌕 MoonDAO Membership NFT</h1>
      <button
        disabled={isClaiming}
        onClick={() => {
          setIsClaiming(true);
          // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
          bundleDropModule
            .claim("0", 1)
            .catch((err) => {
              console.error("failed to claim", err);
              setIsClaiming(false);
            })
            .finally(() => {
              // Stop loading state.
              setIsClaiming(false);
              // Set claim state.
              setHasClaimedNFT(true);
              // Show user their fancy new NFT!
              console.log(
                `Successfully Minted! Check it our on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
              );
            });
        }}
      >
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
};

export default App;
