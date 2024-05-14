import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(1);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showAddress, setShowAddress] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }
    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account && account.length > 0) {
      console.log("Account connected: ", account[0]);
      setAccount(account[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }
    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const contractBalance = await atm.getBalance();
      setBalance(contractBalance.toNumber());
    }
  };

  const deposit = async () => {
    if (atm && depositAmount) {
      let tx = await atm.deposit(Number(depositAmount));
      await tx.wait();
      setBalance(balance + Number(depositAmount)); // Update balance locally
      setDepositAmount(""); // Clear the input field after the transaction
    }
  };

  const withdraw = async () => {
    if (atm && withdrawAmount) {
      let tx = await atm.withdraw(Number(withdrawAmount));
      await tx.wait();
      setBalance(balance - Number(withdrawAmount)); // Update balance locally
      setWithdrawAmount(""); // Clear the input field after the transaction
    }
  };

  const toggleAddress = () => {
    setShowAddress(!showAddress);
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }
    if (!account) {
      return (
        <button className="button connect-button" onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }
    return (
      <div>
        <button className="button toggle-button" onClick={toggleAddress}>
          {showAddress ? "Hide Address" : "Show Address"}
        </button>
        <p>Your Account: {showAddress ? account : "************"}</p>
        <p>Your Balance: {balance}</p>
        <div className="input-group">
          <input
            type="text"
            placeholder="Amount to deposit"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <button className="button deposit-button" onClick={deposit}>
            Deposit
          </button>
        </div>
        <div className="input-group">
          <input
            type="text"
            placeholder="Amount to withdraw"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <button className="button withdraw-button" onClick={withdraw}>
            Withdraw
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Range ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          padding: 20px;
          font-family: Arial, sans-serif;
          background-color: #f0f8ff;
        }
        .button {
          padding: 10px 20px;
          margin: 10px 0;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        .connect-button {
          background-color: #ff6347;
          color: white;
        }
        .connect-button:hover {
          background-color: #ff4500;
        }
        .toggle-button {
          background-color: #1e90ff;
          color: white;
        }
        .toggle-button:hover {
          background-color: #1c86ee;
        }
        .deposit-button {
          background-color: #32cd32;
          color: white;
        }
        .deposit-button:hover {
          background-color: #2eb82e;
        }
        .withdraw-button {
          background-color: #ffa500;
          color: white;
        }
        .withdraw-button:hover {
          background-color: #ff8c00;
        }
        .input-group {
          margin: 10px 0;
        }
        input[type="text"] {
          padding: 10px;
          margin-right: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 16px;
        }
        header h1 {
          margin-bottom: 20px;
        }
      `}</style>
    </main>
  );
}
