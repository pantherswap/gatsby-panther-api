import { NowRequest, NowResponse } from '@now/node';
import Web3 from 'web3'

const chefABI = require('../contracts/chef')

const web3 = new Web3(
    new Web3.providers.HttpProvider(
        "https://bsc-dataseed.binance.org"
    )
);

const pending = async (pid: number, address: string) => {
  const chef = new web3.eth.Contract(chefABI, '0x73feaa1eE314F8c655E354234017bE2193C9E24E');
  const pending = await chef.methods.pendingCake(pid, address).call()
  return pending;
}

export default async (_req: NowRequest, res: NowResponse) => {
  const { address = '0x0F9399FC81DaC77908A2Dde54Bb87Ee2D17a3373', pid='0' } = _req.query
  const data = await pending(pid, address)
  res.status(200).send(data);
};
