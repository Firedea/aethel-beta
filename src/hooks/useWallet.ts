import { useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS =
  "0x70F2C1c1C69465ad6e4690FDd0e6E4761d6DB0eD";

const ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to,uint256 amount) returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "event Transfer(address indexed from,address indexed to,uint256 value)"
];

export function useWallet() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [tokenName, setTokenName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("");
  const [network, setNetwork] = useState("");
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  async function connectWallet() {
    if (!window.ethereum) return;

    const ethereum = window.ethereum;

    try {
  await ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: "0x14a34" }]
  });
} catch (switchError: any) {
  if (switchError?.code !== 4902) {
    throw switchError;
  }

  await ethereum.request({
    method: "wallet_addEthereumChain",
    params: [{
      chainId: "0x14a34",
      chainName: "Base Sepolia",
      nativeCurrency: {
        name: "ETH",
        symbol: "ETH",
        decimals: 18
      },
      rpcUrls: ["https://sepolia.base.org"],
      blockExplorerUrls: ["https://sepolia.basescan.org"]
    }]
  });

  await ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: "0x14a34" }]
  });
}

    const provider = new ethers.BrowserProvider(ethereum);

    const accounts = await ethereum.request({
      method: "eth_requestAccounts"
    });

    const wallet = accounts[0];

    setAccount(wallet);

    const net = await provider.getNetwork();

    setNetwork(`${net.name} - ${net.chainId}`);

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      provider
    );

    setBalance(
      ethers.formatEther(
        await contract.balanceOf(wallet)
      )
    );

    setTokenName(await contract.name());

    setSymbol(await contract.symbol());

    setSupply(
      ethers.formatEther(
        await contract.totalSupply()
      )
    );

    const current =
      await provider.getBlockNumber();

    const sent = await contract.queryFilter(
      contract.filters.Transfer(wallet, null),
      0,
      current
    );

    const received =
      await contract.queryFilter(
        contract.filters.Transfer(null, wallet),
        0,
        current
      );

    const movements = [
      ...sent.map((tx: any) => ({
        type: "Enviado",
        amount: ethers.formatEther(tx.args[2]),
        address: tx.args[1]
      })),
      ...received.map((tx: any) => ({
        type: "Recibido",
        amount: ethers.formatEther(tx.args[2]),
        address: tx.args[0]
      }))
    ];

    setHistory(movements.reverse());

    setStatus("Wallet conectada a Base Sepolia");
  }

  async function sendTokens(
    to: string,
    amount: string
  ) {
    const provider =
      new ethers.BrowserProvider(
        window.ethereum
      );

    const signer =
      await provider.getSigner();

    const contract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        ABI,
        signer
      );

    const tx =
      await contract.transfer(
        to,
        ethers.parseEther(amount)
      );

    setTxHash(tx.hash);

    await tx.wait();

try {
  await connectWallet();
} catch (refreshError) {
  console.warn(
    "La transferencia fue confirmada, pero no se pudo actualizar la interfaz:",
    refreshError
  );
}
  }

  async function addToken() {
    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: CONTRACT_ADDRESS,
          symbol: "AETH",
          decimals: 18,
          image: "/aethel.png"
        }
      }
    });
  }

  return {
    account,
    balance,
    tokenName,
    symbol,
    supply,
    network,
    history,
    txHash,
    status,
    connectWallet,
    sendTokens,
    addToken
  };
}