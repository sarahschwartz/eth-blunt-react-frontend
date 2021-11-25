import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abiJSON from './utils/BluntPortal.json'

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allHits, setAllHits] = useState([]);
  const [name, setName] = useState("");

  const contractAddress = '0xfbc7Ee45A8CeB763D1aabC8533d01c69aFcF685a'
  const contractABI = abiJSON.abi

  const getAllHits = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bluntPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const hits = await bluntPortalContract.getAllHits();

        let hitsCleaned = [];
        hits.forEach((hit, index) => {
          // if(index>){
          hitsCleaned.push({
            address: hit.smoker,
            timestamp: new Date(hit.timestamp * 1000),
            message: hit.message
          });

          // }
        });

        hitsCleaned.reverse();

        /*
         * Store our data in React State
         */
        setAllHits(hitsCleaned);
      } else {
        // console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      // console.log(error);
    }
  }

  useEffect(() => {
    let bluntPortalContract;

    const onNewHit = (from, timestamp, message) => {
      console.log('NewHit', from, timestamp, message);
      setAllHits(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      bluntPortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      bluntPortalContract.on('NewHit', onNewHit);
    }

    return () => {
      if (bluntPortalContract) {
        bluntPortalContract.off('NewHit', onNewHit);
      }
    };
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        // console.log("Make sure you have metamask!");
        return;
      } else {
        // console.log("We have the ethereum object", ethereum);
        getAllHits();
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        // console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        // console.log("No authorized account found")
      }
    } catch (error) {
      // console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      // console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      // console.log(error)
    }
  }

  const smoke = async (inputName) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bluntPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const bluntTxn = await bluntPortalContract.smokeTheBlunt(inputName, { gasLimit: 300000 });
        console.log("Mining...", bluntTxn.hash);

        await bluntTxn.wait();
        console.log("Mined -- ", bluntTxn.hash);

      } else {
        // console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      // console.log(error)
    }
  }

  const handleSubmit = () => {
    if (name.length > 0) {
      smoke(name)
    } else {
      smoke("Anon")
    }

  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])


  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <header>
          <div className="header-title">
            🥳💨 Hit the ETH Blunt
        </div>

          {currentAccount && (
            <div className="input-container">
              <label>Enter your name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <button className="smokeButton" onClick={handleSubmit}>
                Smoke the ETH Blunt
          </button>
            </div>
          )}

          {!currentAccount && (
            <div className="bio">
              Connect your Ethereum wallet to hit the ETH blunt
          </div>
          )}

          {!currentAccount && (
            <button className="connectWalletButton" onClick={connectWallet}>
              Connect Wallet
          </button>
          )}
        </header>

        {allHits.length > 0 && (
          <div className="blunt-log-title">
            Blunt Log
      </div>
        )}

        {allHits.map((hit, index) => {
          return (
            <div key={index} className="hit-info-container">
              <div>{hit.message} hit the ETH blunt at {hit.timestamp.toLocaleTimeString()}</div>
              <div>{hit.address}</div>
            </div>)
        })}

      </div>
    </div>
  );
}

export default App