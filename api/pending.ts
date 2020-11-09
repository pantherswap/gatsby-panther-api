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
  let pending = await chef.methods.pendingCake(pid, address).call()
  return pending;
}

export default async (_req: NowRequest, res: NowResponse) => {
  const data = await pending(1, '0x83b7F4547401141F4c1fD21e86e3F72579bbe3Ec')
  res.status(200).send({_req, data});
};
