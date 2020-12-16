export interface Rates {
  burn: number;
  jackpot: number;
  match3: number;
  match2: number;
}
// Rates since lotteryNo 206
export const rates: Rates = {
  burn: 20,
  jackpot: 50,
  match3: 20,
  match2: 10,
};
// Old rates before lotteryNo 206
export const ratesOld: Rates = {
  burn: 10,
  jackpot: 60,
  match3: 20,
  match2: 10,
};
