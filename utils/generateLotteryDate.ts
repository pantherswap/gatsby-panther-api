export const firstLottery = new Date(Date.UTC(2021, 3, 30, 14, 0, 0, 0)); // Time of the first Offical Lottery; There are 3 Tests lotteries
export const numberOfTestLotteries = 0;
const hour = 60 * 60 * 1000;
export const generateLotteryDate = (issueIndex: number): Date => {
  const lotteryDate = new Date(firstLottery);
  // if (issueIndex < 48) {
  lotteryDate.setTime(lotteryDate.getTime() + (issueIndex - numberOfTestLotteries) * 12 * hour);
  // } else if (issueIndex < 225) {
  //   lotteryDate.setTime(lotteryDate.getTime() + (48 - numberOfTestLotteries) * 2 * hour);
  //   lotteryDate.setTime(lotteryDate.getTime() + (issueIndex - 47) * 6 * hour);
  // } else {
  //   lotteryDate.setTime(lotteryDate.getTime() + (48 - numberOfTestLotteries) * 2 * hour);
  //   lotteryDate.setTime(lotteryDate.getTime() + (225 - 48) * 6 * hour);
  //   lotteryDate.setTime(lotteryDate.getTime() + (issueIndex - 224 + numberOfTestLotteries) * 12 * hour);
  // }
  return lotteryDate;
};
