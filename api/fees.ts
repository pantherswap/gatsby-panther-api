import { NowRequest, NowResponse } from "@vercel/node";
import axios from "axios";

interface Network {
  totalTxs: number;
  totalGasUsed: number;
  totalGas: number;
  totalGasUSDT: number;
  avgGasUsed: number;
  avgGasUSDT: number;
  minGasPrice: number;
  maxGasPrice: number;
  totalFailedTxs: number;
  totalFailedGas: number;
}

interface Transaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
}

const getPrice = async (symbol: string) => {
  const request = await axios.get("https://api.binance.com/api/v3/avgPrice", {
    params: {
      symbol,
    },
  });

  const { price } = request.data;
  return price;
};

const getTxs = async (baseDomain: string, address: string) => {
  const request = await axios.get(`https://api.${baseDomain}/api`, {
    params: {
      module: "account",
      action: "txlist",
      address,
      startblock: 0,
      endblock: 99999999,
      sort: "desc",
      apikey: process.env.API_KEY,
    },
  });

  const { result } = request.data;
  return result;
};

const getStatForNetwork = async (network: string, address: string): Promise<Network> => {
  const baseDomain = network === "ETH" ? "etherscan.io" : "bscscan.com";
  const symbol = network === "ETH" ? "ETHUSDT" : "BNBUSDT";

  const price = await getPrice(symbol);

  const txs = await getTxs(baseDomain, address);
  const succeeded = txs.filter((tx: Transaction) => tx.from === address.toLowerCase());
  const failed = txs.filter((tx: Transaction) => tx.isError === "1");

  // Succeeded transactions.
  const totalTxs = succeeded.length;
  const gasUsed = succeeded.map((tx: Transaction) => parseInt(tx.gasUsed));
  const gasPrice = succeeded.map((tx: Transaction) => parseInt(tx.gasPrice));
  const totalGas =
    succeeded.reduce((acc: number, tx: Transaction) => acc + parseInt(tx.gasUsed) * parseInt(tx.gasPrice), 0) / 1e18;
  const totalGasUSDT =
    (succeeded.reduce((acc: number, tx: Transaction) => acc + parseInt(tx.gasUsed) * parseInt(tx.gasPrice), 0) / 1e18) *
    price;
  const totalGasUsed = gasUsed.reduce((acc: number, value: number) => acc + value, 0);
  const totalGasPrice = gasPrice.reduce((acc: number, value: number) => acc + value, 0);
  const avgGasUsed = totalGasPrice / totalTxs / 1e9;
  const avgGasUSDT = totalGasUSDT / totalTxs;
  const minGasPrice = Math.min(...gasPrice) / 1e9;
  const maxGasPrice = Math.max(...gasPrice) / 1e9;

  // Failed transaction.
  const totalFailedTxs = failed.length;
  const totalFailedGas =
    failed.reduce((acc: number, tx: Transaction) => acc + parseInt(tx.gasUsed) * parseInt(tx.gasPrice), 0) / 1e18;

  return {
    totalTxs,
    totalGasUsed,
    totalGas,
    totalGasUSDT,
    avgGasUsed,
    avgGasUSDT,
    minGasPrice,
    maxGasPrice,
    totalFailedTxs,
    totalFailedGas,
  };
};

export default async (req: NowRequest, res: NowResponse) => {
  const { address } = req.query;

  const ethNetwork = await getStatForNetwork("ETH", address as string);
  const bscNetwork = await getStatForNetwork("BSC", address as string);
  const cheaper = Math.round(ethNetwork.avgGasUSDT / bscNetwork.avgGasUSDT);

  res.json({ address, eth: ethNetwork, bsc: bscNetwork, cheaper });
};
