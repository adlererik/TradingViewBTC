# How to use the Bitcoin indicators

Start on **1D** (the daily chart). Each candle shows where Bitcoin opened and closed that day, and its thin lines, called **wicks**, show the highest and lowest prices. A **moving average** smooths out the day-to-day moves. A simple moving average (**SMA**) gives each day equal weight. An exponential moving average (**EMA**) gives recent days more weight. A **cross** happens when one value moves from one side of another to the other.

If you're new to the app, open **Overlays** and start with just two or three. Tap a candle to inspect its prices. Read signals after the daily candle closes because a marker on a forming candle can change. If you can't see a line, try **All plots** or zoom out and load more history. The 200 Week MA needs about four years of daily candles.

| What you're trying to figure out | Start with |
| --- | --- |
| Is a big rally getting overheated? | [Pi Cycle Top](#4-pi-cycle-top) and [Golden Ratio Multiplier](#5-golden-ratio-multiplier) |
| Is a deep sell-off near an area worth watching? | [2-year investor bands](#1-2-year-investor-bands) and [200 Week MA](#2-200-week-ma) |
| Is the current trend holding up or weakening? | [Guppy in one line](#8-guppy-in-one-line) and [Lucid SAR](#7-lucid-sar) |
| Are miners under stress or starting to recover? | [Difficulty ribbon](#10-difficulty-ribbon) and [Miner signals](#11-miner-signals) |

## 1. 2-year investor bands

**What it does.** Philip Swift built this to spot periods when Bitcoin is unusually cheap or expensive relative to the past two years. The app averages 730 daily closes and sets the upper band at five times that average. Green shading means the day opened at or below the average. Red shading means it opened at or above the upper band. The Android app's **Over Sold** arrow actually marks a close crossing **above** the upper band, an overheated reading. [Swift's 2-Year MA Multiplier](https://dev.decentrader.com/charts/bitcoin-investor-tool-2-year-ma-multiplier/)

**How to use it.** If the two-year average is $40,000, the levels to watch are $40,000 and $200,000. Green shading during a deep bear market flags an area where a long-term investor might start looking for signs that the decline is easing. Red shading after a long rally is a reason to review how much exposure you want to keep. Either condition can persist, so check how price behaves over the following days.

## 2. 200 Week MA

**What it does.** This white line tracks roughly four years of prices. The app averages **1,400 daily closes**, so use **1D** to get the intended lookback. A wick crossing below the line triggers the **BUY** label. The line is a long-term reference that Bitcoin has sometimes approached during major sell-offs.

**How to use it.** If the line is at $25,000 and Bitcoin dips to $24,000 but closes at $26,000, it recovered the level by the close. If several days instead close below $25,000, watch whether Bitcoin can get back above it before calling the market a recovery. In 2022, Bitcoin traded below its 200-week average repeatedly. Treat the line as an area to investigate during a sell-off and leave room for a deeper decline. [Galaxy's August 2022 Bitcoin analysis](https://www.galaxy.com/insights/research/bitcoin-outlook-as-key-levels-breached)

## 3. 200 WMA heatmap

**What it does.** Inspired by PlanB's heatmap, the dots show how much the white 200 Week MA has moved in roughly a month. Purple and aqua mean little change. Yellow, orange and red mean progressively larger changes. This implementation uses the **size** of the move in either direction. [Blockchain.com's explanation of PlanB's heatmap](https://www.blockchain.com/explorer/charts/200w-moving-avg-heatmap)

| Dot color | Change in the average over 30 daily candles |
| --- | --- |
| Purple | 2.5% or less |
| Aqua | Above 2.5% and below 5% |
| Green | 5% to below 10% |
| Yellow | 10% to below 15% |
| Orange | 15% to below 20% |
| Red | 20% or more |

**How to use it.** After a long rally, warmer dots **and** a rising white line tell you the four-year average has been climbing quickly. If the white line is falling, the same hot color measures a large decline. Purple near a sell-off low tells you the average barely moved that month. Use the price chart to see whether buyers have actually returned. The **Parabolic** and **Hyper Parabolic** labels flag changes above 13% through 15% and above 15% through 20%, respectively, while Pi Cycle's slow line is still above its fast line.

## 4. Pi Cycle Top

**What it does.** This is Philip Swift's dedicated **bull-market top warning**. The yellow line is Bitcoin's **111-day average**. The teal line is **twice the 350-day average**. When yellow crosses above teal, the app prints **SELL · Pi Cycle Top**. Crosses appeared near highs in 2013, 2017 and April 2021. Bitcoin made a higher peak in November 2021 without another cross. [Glassnode's Pi Cycle Top explanation](https://studio.glassnode.com/charts/indicators.PiCycleTop) · [Historical Pi Cycle chart](https://charts.perly.io/chart/pi-cycle)

**How to use it.** Watch the two lines after a sustained Bitcoin rally. If yellow steadily closes in on teal, the recent run is getting unusually strong relative to the past year. An actual cross is a reason to revisit a profit-taking plan or check how much of a pullback you could tolerate. If Bitcoin makes new highs while the lines stay apart, the chart can still turn without the signal.

## 5. Golden Ratio Multiplier

**What it does.** Philip Swift marked several multiples of Bitcoin's 350-day average as possible areas for rally highs during or at the end of a cycle. TradingViewBTC shows the **3×** line, labeled **Golden Ratio 2021**. Swift proposed that level in 2019 as a candidate for the next cycle high. The dollar level moves with the underlying average. [Swift's original Golden Ratio Multiplier article](https://positivecrypto.medium.com/the-golden-ratio-multiplier-c2567401e12a)

**How to use it.** If the 350-day average is $40,000, the line is $120,000. As Bitcoin approaches it, look at the daily closes. A wick through $120,000 followed by closes back below it suggests the rally struggled there. Several closes above it show that price has held above the level so far. Use it as an area to review risk during a strong rally. A peak can form before price ever reaches the line.

## 6. Woo Top Cap

**What it does.** Willy Woo's experimental model was designed to estimate the upper end of a Bitcoin bull cycle. His original uses the all-time average of Bitcoin's **market capitalization** (price times circulating supply), multiplies it by **35**, and divides by supply to express the result as a price. The app's purple line is a simpler price-based approximation built from the daily closes it has loaded. It can differ materially from Woo's chart, especially when older history is missing. [Woo's original Bitcoin Price Models](https://woocharts.com/bitcoin-price-models/) · [Glassnode's Top Cap models](https://studio.glassnode.com/charts/btc-top-cap-model?zoom=all)

**How to use it.** Open several years on **1D** and use the purple line to put an unusually big rally in historical perspective. If Bitcoin stalls well below it while other top indicators warn of overheating, take the price slowdown seriously. A fixed multiplier calibrated to early Bitcoin cycles can sit well above a later cycle's peak. [Glassnode's Top Cap models](https://studio.glassnode.com/charts/btc-top-cap-model?zoom=all)

## 7. Lucid SAR

**What it does.** The blue crosses follow an established trend. They usually trail below price as Bitcoin rises and above it as Bitcoin falls. A flip to the other side means the price moved through the indicator's trailing level. **SAR** stands for **stop and reverse**. [Casey Bowman's Lucid SAR source](https://github.com/casey-bowman/sar) · [Fidelity's explanation of Parabolic SAR](https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/PSAR)

**How to use it.** If the crosses have followed Bitcoin upward for several weeks and then move above the candles, review whether the uptrend has broken. In a sideways market the crosses can flip back and forth. The level shows where the formula sees a change, and any actual stop order is set separately.

## 8. Guppy in one line

**What it does.** The app uses the six slower averages from Daryl Guppy's trend indicator (30, 35, 40, 45, 50 and 60 days). It draws the 60-day average. The crosses are **green** when the six averages are stacked in a bullish order, **orange** when the order is mixed, and hidden when they're fully stacked in a bearish order. [Daryl Guppy's original GMMA explanation](https://www.guppytraders.com/gmma-info)

**How to use it.** During a rally, a run of green crosses tells you the uptrend has held across several lookbacks. When the crosses turn orange, check whether price is just pausing or starting to close lower day after day. After a sell-off, a move from hidden to orange to green can help you follow a recovery as it develops. The averages react to moves that have already happened.

## 9. Logarithmic channel

**What it does.** The three pale curves are a long-term price model based on Bitcoin's age. The app puts a **BUY** marker on a wick crossing below the lower curve and a **SELL · Log Channel** marker on a wick crossing above the upper one. The curves can extend into the future using the same model.

**How to use it.** Zoom out to years and tap **Log** so equal percentage moves take up equal space. Near the bottom curve, see whether Bitcoin falls through and stays there or climbs back into the channel. Near the top curve, see whether a long rally is still holding its gains. Read the projected curves as where the model's boundaries would be on future dates. Bitcoin can spend a long time outside those boundaries.

## 10. Difficulty ribbon

**What it does.** Willy Woo stacked eight moving averages of Bitcoin's mining difficulty, from 9 to 200 days. When the faster lines bunch up with the slower ones or fall below them, difficulty has stopped rising or started falling. Woo looked for this during periods of stress when some miners shut off equipment. The protocol adjusts difficulty every 2,016 blocks, roughly two weeks at the target pace, so the ribbon responds slowly. [Woo's original Difficulty Ribbon article](https://woobull.com/introducing-the-difficulty-ribbon-the-best-times-to-buy-bitcoin/) · [Bitcoin's developer guide](https://developer.bitcoin.org/devguide/block_chain.html#proof-of-work)

**How to use it.** On **1D**, watch the shortest lines bend toward the longest ones in a deep Bitcoin sell-off. Then check whether price has stopped making new lows and whether **Miner Increase** appears. Compare the ribbon lines with each other. They measure mining difficulty on a scaled axis even though the app draws them alongside the dollar price.

## 11. Miner signals

**What it does.** Based on Charles Edwards's Hash Ribbons method, the app compares the **30-day** and **60-day** averages of estimated mining power. **Miner Capitulation** means the faster average crossed down and mining activity has weakened. **Miner Increase** means it crossed back up and mining activity has started to recover. Edwards's original buy setup also required positive **price** momentum, using the 10-day price average above the 20-day average. The app's marker reports the mining crossover alone. [Edwards's original Hash Ribbons article](https://capriole.com/hash-ribbons-bitcoin-bottoms)

**How to use it.** After a sharp sell-off, start watching for recovery when **Miner Capitulation** appears. If **Miner Increase** follows while Bitcoin is still making lower lows, mining has improved while the price trend is still weak. If price is also starting to hold above recent lows, you have evidence of improvement in both. The Difficulty Ribbon and Miner signals track related parts of mining and can respond to the same event.

## 12. Halving bands

**What they do.** A halving cuts the new bitcoin issued per block in half. On the daily chart, the app shades the marked day and two days on either side for comparing cycles. The first three halvings fell on **November 28, 2012**, **July 9, 2016**, and **May 11, 2020**. The fourth happened on **April 20, 2024** at block **840,000**. The Android app still shows the original script's **March 11, 2024** estimate for that fourth band. [Bitcoin halving history](https://bitcoin.org/en/halving)

**How to use them.** When reviewing a halving, look at prices and mining conditions in the weeks or months on either side. The band marks a change in Bitcoin's issuance schedule. Demand, price and miner activity can respond on different timelines.

## Two examples on the daily chart

- **After a long rally.** Suppose Bitcoin closed at $122,000 after touching the $120,000 Golden Ratio line, and Pi Cycle's yellow line is at $78,000 and rising toward teal at $80,000. Bitcoin has reached a level worth watching and the Pi Cycle lines are close. The Pi Cycle signal itself requires the **two averages** to cross. If subsequent candles close below $120,000 and Guppy turns orange, you can see the recent rally weakening even before a Pi Cycle cross.
- **After a deep sell-off.** Suppose Bitcoin falls below its $25,000 200 Week MA, then closes back above it several days in a row. If a **Miner Increase** marker appears around the same time, you have two different observations. Price has recovered a long-term level, and estimated mining power has begun to recover. Several closes back below $25,000 would weaken the price side of that reading.
