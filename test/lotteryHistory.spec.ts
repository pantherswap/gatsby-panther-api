import * as lotteryHistory from "../api/lotteryHistory";

describe("Lottery History", () => {
  it("lottery History", async () => {
    const lotteryResponse = await lotteryHistory.lotteryHistory();
    expect(lotteryResponse).toBeDefined();
  });
});
