# How to read the Bitcoin indicators

A **candle** shows Bitcoin’s opening price, highest price, lowest price and closing price for one time period. The thin lines above and below the body are **wicks**. On the **1D** chart, a wick records how far price moved during the day, including prices it moved away from before the close.

A **moving average** smooths out price changes. A simple moving average, or **SMA**, gives each close equal weight. An exponential moving average, or **EMA**, gives recent closes more weight. A **crossover** happens when one line moves from one side of another line to the other.

Start on **1D**. Most formulas count candles, so a 111-bar average means 111 days on **1D** and 111 hours on **1h**. Tap **Overlays** to show just a few at a time. Open **All plots** when a line is far from the price. The **BUY** and **SELL** labels are names for chart events. A label on the current candle can change while it is still forming.

## 1. 2-year investor bands

The app averages the last **730 closing prices** and sets an upper band at **five times** that average. The chart shades the gap in green if the candle opens at or below the average, and in red if it opens at or above the upper band. If the close crosses above the upper band, the app uses the original script’s **Over Sold** label. That particular label marks an upward crossing of the upper band.

**How to use it.** Read the colors as a comparison between today’s price and the last two years on the daily chart. If the average were $50,000, the bands would sit at $50,000 and $250,000. The green shading would tell you the opening price was below its long-term average. In a prolonged decline, price can remain in that area for a long time. [2-Year MA Multiplier](https://www.lookintobitcoin.com/charts/bitcoin-investor-tool/)

## 2. 200 Week MA

The white line is the average of the last **1,400 closes**. On **1D**, 1,400 days are 200 weeks. The app prints **BUY** when the low of a candle crosses from at or above the line to below it.

**How to use it.** Look at where Bitcoin is relative to several years of prices. If a wick dips under the line and the candle closes back above it, that tells a different story from several consecutive closes below it. The average moves slowly, so it can remain far from the market for long stretches. It takes 1,400 candles before the line appears. [200 Week Moving Average Heatmap](https://www.lookintobitcoin.com/charts/200-week-moving-average-heatmap/)

## 3. 200 WMA heatmap

The dots show how much the 200 Week MA has **changed in either direction** compared with 30 candles ago. On **1D**, that’s about a month. A cool dot means the average changed little. A hot dot means it changed a lot.

| Dot color | Size of the change |
| --- | --- |
| Purple | 2.5% or less |
| Aqua | Above 2.5% and below 5% |
| Green | 5% to below 10% |
| Yellow | 10% to below 15% |
| Orange | 15% to below 20% |
| Red | 20% or more |

**How to use it.** Check the slope of the white line alongside the dots. An average that moves from $50,000 to $55,000 registers 10% and turns yellow. A fall from $50,000 to $45,000 also registers 10%. The app keeps the most recent **Parabolic** label for changes above 13% through 15%, and the most recent **Hyper Parabolic** label for changes above 15% through 20%. Both require the slow Pi Cycle line to be above the fast one.

## 4. Pi Cycle Top

The fast yellow line averages **111 closing prices**. The slow teal line is **twice the average of 350 closing prices**. When the yellow line crosses above the teal line, the app marks **SELL · Pi Cycle Top**.

**How to use it.** Watch the gap between the two lines on **1D**. A narrowing gap tells you that recent prices are catching up to a much longer-term benchmark. The crossing has been studied around past Bitcoin cycle highs. Both lines are built from past prices, and a crossing can come late in a fast market. [Pi Cycle Top Indicator](https://www.lookintobitcoin.com/charts/pi-cycle-top-indicator/)

## 5. Golden Ratio Multiplier

This app plots one level from the Golden Ratio Multiplier idea, **three times the 350-candle average**. The end label is **Golden Ratio 2021**. If the 350-day average were $50,000, the line would be at $150,000.

**How to use it.** Look at the distance between Bitcoin’s price and the line to see how far a rally has stretched relative to its recent history. The line moves as new prices enter the average. Bitcoin can turn well before reaching it, stay above it, or spend an entire cycle below it. [Golden Ratio Multiplier](https://www.lookintobitcoin.com/charts/golden-ratio-multiplier/)

## 6. Woo Top Cap

The purple line is a price-based model inspired by Willy Woo’s Top Cap. The app adds the closing prices from the start of its loaded history and multiplies that total by **35**. It divides by a count that includes the days from Bitcoin’s genesis date to the first loaded candle plus the candle count through the current bar.

**How to use it.** On **1D**, use it as a high, slow-moving reference when viewing years of Bitcoin history. Values depend on where the available history starts. The formula mixes elapsed days with the number of candles, which makes its meaning less intuitive away from **1D**. The app plots a level in dollars on the price chart. [Top Cap background](https://www.lookintobitcoin.com/charts/top-cap/)

## 7. Lucid SAR

The blue crosses mark a trailing price level. SAR means **stop and reverse**. During an upward trend they generally sit below the candles and move toward them as the trend extends. A reversal flips the crosses above the candles. The pattern works in reverse during a downward trend.

**How to use it.** Follow which side of the candles the crosses are on. A clean run on one side helps you see a sustained trend. Several quick flips tell you the method is getting whipsawed in choppy trading. The crosses show a level from the formula and the app does not place stop orders. [Casey Bowman’s SAR source](https://github.com/casey-bowman/sar)

## 8. Guppy in one line

The app compares six EMAs of **30, 35, 40, 45, 50 and 60 candles**. It draws the 60-candle EMA as small crosses. They appear green when the six averages are aligned upward, orange when their order is mixed, and are hidden when all six are aligned downward.

**How to use it.** Green shows that the faster averages are above the slower ones in order. A switch to orange means at least part of that alignment broke. That can happen during a pause within an existing trend or at the beginning of a reversal. A stretch without crosses can represent a fully bearish alignment.

## 9. Logarithmic channel

Three pale curves show an upper, middle and lower price path based on Bitcoin’s age. The middle sits halfway between the other two in logarithmic space. The app marks **BUY** when a candle low crosses below the lower curve and **SELL · Log Channel** when a candle high crosses above the upper curve. Future extensions are available on supported longer intervals if **Log-channel projections** is on.

**How to use it.** Zoom out and try the **Log** price scale to read the channel over multiple years. Use the lower and upper curves to see where price sits relative to this particular long-term model. The extensions continue the same formulas forward, so their apparent paths depend entirely on the model’s assumptions.

## 10. Difficulty ribbon

Mining **difficulty** describes how hard it is to find a Bitcoin block. The ribbon plots simple averages over **9, 14, 25, 40, 60, 90, 128 and 200 candles**. The input is Bitcoin’s difficulty at the end of each UTC day, scaled down to make the lines easier to plot.

**How to use it.** On **1D**, look for the short averages to bunch up with the long ones or move below them. That shows recent difficulty growth has slowed or reversed. Short averages fanning out above long ones show faster recent growth. Difficulty adjusts only every **2,016 blocks**, so the ribbon reacts slowly. Its numbers represent mining difficulty on a shared chart scale. [Bitcoin developer guide](https://developer.bitcoin.org/devguide/block_chain.html#proof-of-work) · [Mempool mining dashboard](https://mempool.space/mining)

## 11. Miner signals

Hash rate estimates how much computing power miners are using. The app compares a **30-day** average with a **60-day** average of estimated hash rate. It marks **Miner Capitulation** when the shorter average crosses below the longer one and **Miner Increase** when the shorter average crosses back above it.

**How to use it.** Look for a period of weakening or recovering mining activity and compare it with the difficulty ribbon. Hash rate and difficulty measure related things, so agreement is useful context but comes from the same part of the Bitcoin network. A drop in estimated hash rate can also reflect temporary shutdowns or changes in mining economics. [Mempool mining dashboard](https://mempool.space/mining)

## 12. Halving bands

A Bitcoin halving cuts the new bitcoin paid out per mined block. The app shades **two days on either side** of the dates stored in the original script. Its first three bands are centered on **November 28, 2012**, **July 9, 2016**, and **May 11, 2020**.

**How to use it.** Use the bands as historical bookmarks when comparing market cycles. The app preserves the script’s **March 11, 2024** estimate for the fourth halving. The halving actually happened on **April 20, 2024** at block **840,000**. Use the actual date when comparing the fourth halving with a price move. [Bitcoin halving history](https://bitcoin.org/en/halving)

## Try reading three indicators together

On **1D**, enable the **200 Week MA**, **Guppy in one line** and **Miner signals**. Suppose price closes below the 200 Week MA, the Guppy crosses are orange, and a **Miner Increase** marker appears. The first tells you where price stands against its long history. The second shows the more recent price trend is mixed. The third shows that estimated mining activity has picked up. Those readings can all be true at the same time. Comparing them helps you ask better questions about what is changing in Bitcoin’s market and network.
