// Offline copies of the beginner's guide. See INDICATORS.md for sources.
export const guides = {
  en: `
<p>Start on <strong>1D</strong> (the daily chart). Each candle shows where Bitcoin opened and closed that day, and its thin lines, called <strong>wicks</strong>, show the highest and lowest prices. A <strong>moving average</strong> smooths out the day-to-day moves. A simple moving average (<strong>SMA</strong>) gives each day equal weight. An exponential moving average (<strong>EMA</strong>) gives recent days more weight. A <strong>cross</strong> happens when one value moves from one side of another to the other.</p>
<p>If you're new to the app, open <strong>Overlays</strong> and start with just two or three. Tap a candle to inspect its prices. Read signals after the daily candle closes because a marker on a forming candle can change. If you can't see a line, try <strong>All plots</strong> or zoom out and load more history. The 200 Week MA needs about four years of daily candles.</p>
<table>
<thead>
<tr>
<th>What you're trying to figure out</th>
<th>Start with</th>
</tr>
</thead>
<tbody>
<tr>
<td>Is a big rally getting overheated?</td>
<td>Pi Cycle Top and Golden Ratio Multiplier</td>
</tr>
<tr>
<td>Is a deep sell-off near an area worth watching?</td>
<td>2-year investor bands and 200 Week MA</td>
</tr>
<tr>
<td>Is the current trend holding up or weakening?</td>
<td>Guppy in one line and Lucid SAR</td>
</tr>
<tr>
<td>Are miners under stress or starting to recover?</td>
<td>Difficulty ribbon and Miner signals</td>
</tr>
</tbody>
</table>
<h3>1. 2-year investor bands</h3>
<p><strong>What it does.</strong> Philip Swift built this to spot periods when Bitcoin is unusually cheap or expensive relative to the past two years. The app averages 730 daily closes and sets the upper band at five times that average. Green shading means the day opened at or below the average. Red shading means it opened at or above the upper band. The Android app's <strong>Over Sold</strong> arrow actually marks a close crossing <strong>above</strong> the upper band, an overheated reading.</p>
<p><strong>How to use it.</strong> If the two-year average is $40,000, the levels to watch are $40,000 and $200,000. Green shading during a deep bear market flags an area where a long-term investor might start looking for signs that the decline is easing. Red shading after a long rally is a reason to review how much exposure you want to keep. Either condition can persist, so check how price behaves over the following days.</p>
<h3>2. 200 Week MA</h3>
<p><strong>What it does.</strong> This white line tracks roughly four years of prices. The app averages <strong>1,400 daily closes</strong>, so use <strong>1D</strong> to get the intended lookback. A wick crossing below the line triggers the <strong>BUY</strong> label. The line is a long-term reference that Bitcoin has sometimes approached during major sell-offs.</p>
<p><strong>How to use it.</strong> If the line is at $25,000 and Bitcoin dips to $24,000 but closes at $26,000, it recovered the level by the close. If several days instead close below $25,000, watch whether Bitcoin can get back above it before calling the market a recovery. In 2022, Bitcoin traded below its 200-week average repeatedly. Treat the line as an area to investigate during a sell-off and leave room for a deeper decline.</p>
<h3>3. 200 WMA heatmap</h3>
<p><strong>What it does.</strong> Inspired by PlanB's heatmap, the dots show how much the white 200 Week MA has moved in roughly a month. Purple and aqua mean little change. Yellow, orange and red mean progressively larger changes. This implementation uses the <strong>size</strong> of the move in either direction.</p>
<table>
<thead>
<tr>
<th>Dot color</th>
<th>Change in the average over 30 daily candles</th>
</tr>
</thead>
<tbody>
<tr>
<td>Purple</td>
<td>2.5% or less</td>
</tr>
<tr>
<td>Aqua</td>
<td>Above 2.5% and below 5%</td>
</tr>
<tr>
<td>Green</td>
<td>5% to below 10%</td>
</tr>
<tr>
<td>Yellow</td>
<td>10% to below 15%</td>
</tr>
<tr>
<td>Orange</td>
<td>15% to below 20%</td>
</tr>
<tr>
<td>Red</td>
<td>20% or more</td>
</tr>
</tbody>
</table>
<p><strong>How to use it.</strong> After a long rally, warmer dots <strong>and</strong> a rising white line tell you the four-year average has been climbing quickly. If the white line is falling, the same hot color measures a large decline. Purple near a sell-off low tells you the average barely moved that month. Use the price chart to see whether buyers have actually returned. The <strong>Parabolic</strong> and <strong>Hyper Parabolic</strong> labels flag changes above 13% through 15% and above 15% through 20%, respectively, while Pi Cycle's slow line is still above its fast line.</p>
<h3>4. Pi Cycle Top</h3>
<p><strong>What it does.</strong> This is Philip Swift's dedicated <strong>bull-market top warning</strong>. The yellow line is Bitcoin's <strong>111-day average</strong>. The teal line is <strong>twice the 350-day average</strong>. When yellow crosses above teal, the app prints <strong>SELL · Pi Cycle Top</strong>. Crosses appeared near highs in 2013, 2017 and April 2021. Bitcoin made a higher peak in November 2021 without another cross. </p>
<p><strong>How to use it.</strong> Watch the two lines after a sustained Bitcoin rally. If yellow steadily closes in on teal, the recent run is getting unusually strong relative to the past year. An actual cross is a reason to revisit a profit-taking plan or check how much of a pullback you could tolerate. If Bitcoin makes new highs while the lines stay apart, the chart can still turn without the signal.</p>
<h3>5. Golden Ratio Multiplier</h3>
<p><strong>What it does.</strong> Philip Swift marked several multiples of Bitcoin's 350-day average as possible areas for rally highs during or at the end of a cycle. TradingViewBTC shows the <strong>3×</strong> line, labeled <strong>Golden Ratio 2021</strong>. Swift proposed that level in 2019 as a candidate for the next cycle high. The dollar level moves with the underlying average.</p>
<p><strong>How to use it.</strong> If the 350-day average is $40,000, the line is $120,000. As Bitcoin approaches it, look at the daily closes. A wick through $120,000 followed by closes back below it suggests the rally struggled there. Several closes above it show that price has held above the level so far. Use it as an area to review risk during a strong rally. A peak can form before price ever reaches the line.</p>
<h3>6. Woo Top Cap</h3>
<p><strong>What it does.</strong> Willy Woo's experimental model was designed to estimate the upper end of a Bitcoin bull cycle. His original uses the all-time average of Bitcoin's <strong>market capitalization</strong> (price times circulating supply), multiplies it by <strong>35</strong>, and divides by supply to express the result as a price. The app's purple line is a simpler price-based approximation built from the daily closes it has loaded. It can differ materially from Woo's chart, especially when older history is missing. </p>
<p><strong>How to use it.</strong> Open several years on <strong>1D</strong> and use the purple line to put an unusually big rally in historical perspective. If Bitcoin stalls well below it while other top indicators warn of overheating, take the price slowdown seriously. A fixed multiplier calibrated to early Bitcoin cycles can sit well above a later cycle's peak.</p>
<h3>7. Lucid SAR</h3>
<p><strong>What it does.</strong> The blue crosses follow an established trend. They usually trail below price as Bitcoin rises and above it as Bitcoin falls. A flip to the other side means the price moved through the indicator's trailing level. <strong>SAR</strong> stands for <strong>stop and reverse</strong>. </p>
<p><strong>How to use it.</strong> If the crosses have followed Bitcoin upward for several weeks and then move above the candles, review whether the uptrend has broken. In a sideways market the crosses can flip back and forth. The level shows where the formula sees a change, and any actual stop order is set separately.</p>
<h3>8. Guppy in one line</h3>
<p><strong>What it does.</strong> The app uses the six slower averages from Daryl Guppy's trend indicator (30, 35, 40, 45, 50 and 60 days). It draws the 60-day average. The crosses are <strong>green</strong> when the six averages are stacked in a bullish order, <strong>orange</strong> when the order is mixed, and hidden when they're fully stacked in a bearish order.</p>
<p><strong>How to use it.</strong> During a rally, a run of green crosses tells you the uptrend has held across several lookbacks. When the crosses turn orange, check whether price is just pausing or starting to close lower day after day. After a sell-off, a move from hidden to orange to green can help you follow a recovery as it develops. The averages react to moves that have already happened.</p>
<h3>9. Logarithmic channel</h3>
<p><strong>What it does.</strong> The three pale curves are a long-term price model based on Bitcoin's age. The app puts a <strong>BUY</strong> marker on a wick crossing below the lower curve and a <strong>SELL · Log Channel</strong> marker on a wick crossing above the upper one. The curves can extend into the future using the same model.</p>
<p><strong>How to use it.</strong> Zoom out to years and tap <strong>Log</strong> so equal percentage moves take up equal space. Near the bottom curve, see whether Bitcoin falls through and stays there or climbs back into the channel. Near the top curve, see whether a long rally is still holding its gains. Read the projected curves as where the model's boundaries would be on future dates. Bitcoin can spend a long time outside those boundaries.</p>
<h3>10. Difficulty ribbon</h3>
<p><strong>What it does.</strong> Willy Woo stacked eight moving averages of Bitcoin's mining difficulty, from 9 to 200 days. When the faster lines bunch up with the slower ones or fall below them, difficulty has stopped rising or started falling. Woo looked for this during periods of stress when some miners shut off equipment. The protocol adjusts difficulty every 2,016 blocks, roughly two weeks at the target pace, so the ribbon responds slowly. </p>
<p><strong>How to use it.</strong> On <strong>1D</strong>, watch the shortest lines bend toward the longest ones in a deep Bitcoin sell-off. Then check whether price has stopped making new lows and whether <strong>Miner Increase</strong> appears. Compare the ribbon lines with each other. They measure mining difficulty on a scaled axis even though the app draws them alongside the dollar price.</p>
<h3>11. Miner signals</h3>
<p><strong>What it does.</strong> Based on Charles Edwards's Hash Ribbons method, the app compares the <strong>30-day</strong> and <strong>60-day</strong> averages of estimated mining power. <strong>Miner Capitulation</strong> means the faster average crossed down and mining activity has weakened. <strong>Miner Increase</strong> means it crossed back up and mining activity has started to recover. Edwards's original buy setup also required positive <strong>price</strong> momentum, using the 10-day price average above the 20-day average. The app's marker reports the mining crossover alone.</p>
<p><strong>How to use it.</strong> After a sharp sell-off, start watching for recovery when <strong>Miner Capitulation</strong> appears. If <strong>Miner Increase</strong> follows while Bitcoin is still making lower lows, mining has improved while the price trend is still weak. If price is also starting to hold above recent lows, you have evidence of improvement in both. The Difficulty Ribbon and Miner signals track related parts of mining and can respond to the same event.</p>
<h3>12. Halving bands</h3>
<p><strong>What they do.</strong> A halving cuts the new bitcoin issued per block in half. On the daily chart, the app shades the marked day and two days on either side for comparing cycles. The first three halvings fell on <strong>November 28, 2012</strong>, <strong>July 9, 2016</strong>, and <strong>May 11, 2020</strong>. The fourth happened on <strong>April 20, 2024</strong> at block <strong>840,000</strong>. The Android app still shows the original script's <strong>March 11, 2024</strong> estimate for that fourth band.</p>
<p><strong>How to use them.</strong> When reviewing a halving, look at prices and mining conditions in the weeks or months on either side. The band marks a change in Bitcoin's issuance schedule. Demand, price and miner activity can respond on different timelines.</p>
<h3>Two examples on the daily chart</h3>
<ul>
<li><strong>After a long rally.</strong> Suppose Bitcoin closed at $122,000 after touching the $120,000 Golden Ratio line, and Pi Cycle's yellow line is at $78,000 and rising toward teal at $80,000. Bitcoin has reached a level worth watching and the Pi Cycle lines are close. The Pi Cycle signal itself requires the <strong>two averages</strong> to cross. If subsequent candles close below $120,000 and Guppy turns orange, you can see the recent rally weakening even before a Pi Cycle cross.</li>
<li><strong>After a deep sell-off.</strong> Suppose Bitcoin falls below its $25,000 200 Week MA, then closes back above it several days in a row. If a <strong>Miner Increase</strong> marker appears around the same time, you have two different observations. Price has recovered a long-term level, and estimated mining power has begun to recover. Several closes back below $25,000 would weaken the price side of that reading.</li>
</ul>
`,
  sv: `
<p>Börja med <strong>1D</strong> (dagsdiagrammet). Varje kursljus visar var bitcoinpriset öppnade och stängde för dagen. De tunna strecken, som kallas vekar, visar dagens högsta och lägsta pris. Ett <strong>glidande medelvärde</strong> jämnar ut de dagliga svängningarna. Ett enkelt glidande medelvärde (<strong>SMA</strong>) ger varje dag samma vikt. Ett exponentiellt glidande medelvärde (<strong>EMA</strong>) ger de senaste dagarna större vikt. En <strong>korsning</strong> sker när ett värde rör sig från den ena sidan av ett annat värde till den andra.</p>
<p>Öppna <strong>Indikatorer</strong> och börja med två eller tre. Tryck på ett kursljus för att se priserna. Läs signalerna efter dagens stängning. En markering kan ändras medan kursljuset fortfarande bildas. Om en linje saknas, prova <strong>Alla linjer</strong> eller zooma ut och ladda in mer historik. 200-veckorsmedelvärdet behöver ungefär fyra års dagsdata.</p>
<table>
<thead><tr><th>Det du vill undersöka</th><th>Börja med</th></tr></thead>
<tbody>
<tr><td>Börjar en uppgång bli överhettad?</td><td>Pi Cycle Top och gyllene snittets multiplikator</td></tr>
<tr><td>Närmar sig ett stort prisfall en nivå värd att bevaka?</td><td>2-årsband och 200-veckorsmedelvärde</td></tr>
<tr><td>Håller trenden i sig eller mattas den av?</td><td>Guppy på en linje och Lucid SAR</td></tr>
<tr><td>Är bitcoinbrytningen pressad eller på väg att återhämta sig?</td><td>Svårighetsband och gruvsignaler</td></tr>
</tbody>
</table>

<h3>1. 2-årsband</h3>
<p><strong>Vad indikatorn visar.</strong> Philip Swift tog fram den för att se när bitcoin är ovanligt billigt eller dyrt jämfört med de senaste två åren. Appen räknar ut medelvärdet av 730 dagliga stängningspriser och lägger det övre bandet på fem gånger medelvärdet. Grönt betyder att dagen öppnade vid eller under medelvärdet. Rött betyder att dagen öppnade vid eller över det övre bandet. Pilen <strong>Över 5×-bandet</strong> visas när stängningspriset korsar upp över det övre bandet.</p>
<p><strong>Så använder du den.</strong> Om tvåårsmedelvärdet är 40 000 USD ligger nivåerna på 40 000 och 200 000 USD. Grönt efter ett stort prisfall visar ett område där du kan börja leta efter tecken på att nedgången avtar. Rött efter en lång uppgång är ett tillfälle att se över hur stor del av innehavet du vill behålla. Båda lägena kan vara långvariga. Följ hur priset utvecklas de kommande dagarna.</p>

<h3>2. 200-veckorsmedelvärde</h3>
<p><strong>Vad indikatorn visar.</strong> Den vita linjen jämnar ut ungefär fyra års priser. Appen räknar på <strong>1 400 kursljus</strong>, så välj <strong>1D</strong> för rätt tidsperiod. När ett kursljus lägsta pris korsar ned under linjen visas <strong>KÖP</strong>. Linjen har legat nära priset under flera större nedgångar.</p>
<p><strong>Så använder du den.</strong> Om linjen ligger på 25 000 USD och bitcoin faller till 24 000 men stänger på 26 000, har priset återhämtat nivån före stängning. Om flera dagar stänger under 25 000 USD, håll utkik efter om bitcoin klarar att ta sig tillbaka över den. Under 2022 handlades bitcoin under sitt 200-veckorsmedelvärde vid upprepade tillfällen. Priset kan falla betydligt längre än till den vita linjen.</p>

<h3>3. 200-veckorsvärmekarta</h3>
<p><strong>Vad indikatorn visar.</strong> Prickarna är inspirerade av PlanB:s värmekarta och visar hur mycket 200-veckorsmedelvärdet har rört sig på ungefär en månad. Lila och turkos visar små förändringar. Gult, orange och rött visar allt större förändringar. Färgen anger förändringens storlek i båda riktningarna.</p>
<table>
<thead><tr><th>Färg</th><th>Förändring över 30 dagar</th></tr></thead>
<tbody>
<tr><td>Lila</td><td>Högst 2,5 %</td></tr>
<tr><td>Turkos</td><td>Över 2,5 % men under 5 %</td></tr>
<tr><td>Grön</td><td>Minst 5 % men under 10 %</td></tr>
<tr><td>Gul</td><td>Minst 10 % men under 15 %</td></tr>
<tr><td>Orange</td><td>Minst 15 % men under 20 %</td></tr>
<tr><td>Röd</td><td>Minst 20 %</td></tr>
</tbody>
</table>
<p><strong>Så använder du den.</strong> Efter en lång uppgång visar varmare prickar tillsammans med en stigande vit linje att fyraårsmedelvärdet har ökat snabbt. Om linjen faller visar samma färg en stor nedgång. Lila vid låga priser betyder att medelvärdet knappt rörde sig den månaden. Titta på priset för att se om köparna börjat återvända. <strong>Parabolisk</strong> och <strong>Hyperparabolisk</strong> visas vid förändringar över 13 % till och med 15 % respektive över 15 % till och med 20 %, medan den långsamma Pi Cycle-linjen ligger över den snabba.</p>

<h3>4. Pi Cycle Top</h3>
<p><strong>Vad indikatorn visar.</strong> Philip Swift tog fram den som en <strong>varning för en möjlig topp efter en stor uppgång</strong>. Den gula linjen visar bitcoins <strong>111-dagarsmedelvärde</strong>. Den blågröna visar <strong>två gånger 350-dagarsmedelvärdet</strong>. När gult korsar upp över blågrönt visas <strong>SÄLJ · Pi Cycle Top</strong>. Korsningar kom nära topparna 2013, 2017 och april 2021. Vid den högre toppen i november 2021 uteblev signalen.</p>
<p><strong>Så använder du den.</strong> Följ avståndet mellan linjerna efter en lång uppgång. När den gula linjen närmar sig den blågröna har de senaste månadernas pris stigit ovanligt snabbt jämfört med det senaste året. Vid en korsning kan du se över en plan för vinsthemtagning och hur stor nedgång du klarar. Toppar kan också komma när linjerna har gott om utrymme mellan sig.</p>

<h3>5. Gyllene snittets multiplikator</h3>
<p><strong>Vad indikatorn visar.</strong> Philip Swift markerade flera multiplar av bitcoins 350-dagarsmedelvärde som möjliga toppnivåer under eller i slutet av en cykel. Appen visar <strong>3×</strong>, med etiketten <strong>Gyllene snittet 2021</strong>. Nivån rör sig när medelvärdet förändras.</p>
<p><strong>Så använder du den.</strong> Om 350-dagarsmedelvärdet är 40 000 USD ligger linjen på 120 000 USD. Titta på stängningspriserna när bitcoin närmar sig linjen. En vek som når över nivån följd av stängningar under den tyder på att uppgången hade svårt att hålla där. Flera stängningar över linjen visar att priset hittills hållit sig ovanför nivån. En topp kan bildas innan priset når linjen.</p>

<h3>6. Woos Top Cap</h3>
<p><strong>Vad indikatorn visar.</strong> Willy Woos experimentella modell uppskattar den övre delen av en bitcoinuppgång över en hel cykel. Originalet tar bitcoins genomsnittliga börsvärde över hela historiken, multiplicerar med <strong>35</strong> och delar med antalet bitcoin i omlopp för att få ett pris. Appens lila linje är en förenklad uppskattning som bygger på de dagliga stängningspriser som har laddats in. Den kan avvika från Woos diagram, särskilt om äldre prisdata saknas.</p>
<p><strong>Så använder du den.</strong> Visa flera år på <strong>1D</strong> för att sätta en ovanligt stor uppgång i ett historiskt perspektiv. Om priset tappar fart långt under linjen och andra indikatorer samtidigt varnar för överhettning, följ prisets utveckling. En fast multipel från bitcoins tidiga cykler kan ligga långt över en senare topp.</p>

<h3>7. Lucid SAR</h3>
<p><strong>Vad indikatorn visar.</strong> De blå kryssen brukar ligga under kursljusen när bitcoin stiger och ovanför dem när bitcoin faller. När kryssen byter sida har priset passerat den nivå som följer trenden. <strong>SAR</strong> står för <em>stop and reverse</em>.</p>
<p><strong>Så använder du den.</strong> Om kryssen har följt bitcoin uppåt i flera veckor och sedan flyttar över kursljusen, undersök om upptrenden har brutits. När priset går sidledes kan kryssen byta sida flera gånger. Nivån visar när formeln ser en förändring. Eventuella stoppordrar lägger du separat.</p>

<h3>8. Guppy på en linje</h3>
<p><strong>Vad indikatorn visar.</strong> Appen använder de sex långsammare medelvärdena från Daryl Guppys trendindikator (30, 35, 40, 45, 50 och 60 dagar). Den ritar ut 60-dagarsmedelvärdet. Kryssen är <strong>gröna</strong> när de sex medelvärdena ligger i ordning för en upptrend, <strong>orange</strong> när ordningen är blandad och dolda när de alla ligger i ordning för en nedtrend.</p>
<p><strong>Så använder du den.</strong> En rad gröna kryss visar att upptrenden hållit i sig över flera tidsperioder. När kryssen blir orange, se om priset bara tar en paus eller börjar stänga lägre dag efter dag. Efter en nedgång kan kryss som går från dolda till orange och sedan gröna hjälpa dig att följa en återhämtning. Medelvärdena bygger på prisrörelser som redan har hänt.</p>

<h3>9. Logaritmisk kanal</h3>
<p><strong>Vad indikatorn visar.</strong> De tre ljusa kurvorna visar en långsiktig prismodell baserad på bitcoins ålder. Appen visar <strong>KÖP</strong> när ett kursljus lägsta passerar ned genom den nedre kurvan och <strong>SÄLJ · Logaritmkanal</strong> när högsta passerar upp genom den övre. Kurvorna kan förlängas framåt med samma modell.</p>
<p><strong>Så använder du den.</strong> Zooma ut till flera år och tryck på <strong>Log</strong> så att lika stora procentuella rörelser får lika mycket plats i höjdled. Vid den nedre kurvan, se om priset blir kvar under den eller tar sig tillbaka in i kanalen. Vid den övre kurvan, se om uppgången håller i sig. De förlängda kurvorna visar modellens gränser vid framtida datum. Priset kan ligga utanför dem länge.</p>

<h3>10. Svårighetsband</h3>
<p><strong>Vad indikatorn visar.</strong> Willy Woo lade åtta glidande medelvärden av svårighetsgraden för bitcoinbrytning ovanpå varandra, från 9 till 200 dagar. När de snabbare linjerna klumpar ihop sig med de långsammare eller sjunker under dem, har svårighetsgraden slutat stiga eller börjat falla. Woo tittade efter detta när pressade aktörer stängde av utrustning. Svårighetsgraden justeras vart 2 016:e block, ungefär varannan vecka vid normal blocktakt.</p>
<p><strong>Så använder du den.</strong> Vid ett stort prisfall på <strong>1D</strong>, se om de snabbare linjerna böjer sig mot de långsammare. Kontrollera sedan om priset slutat sätta nya bottnar och om <strong>Ökad hashhastighet</strong> visas. Jämför linjerna med varandra. Appen ritar dem tillsammans med dollarpriset, men linjerna mäter svårighetsgrad.</p>

<h3>11. Gruvsignaler</h3>
<p><strong>Vad indikatorn visar.</strong> Appen bygger på Charles Edwards metod Hash Ribbons och jämför <strong>30- och 60-dagarsmedelvärdena</strong> för nätverkets uppskattade beräkningskraft. <strong>Gruvkapitulation</strong> visas när det snabbare medelvärdet korsar ned genom det långsammare. <strong>Ökad hashhastighet</strong> visas när det korsar upp igen. Edwards tittade också på <strong>prisets</strong> utveckling och krävde att 10-dagarsmedelvärdet för priset låg över 20-dagarsmedelvärdet. Appens markering visar korsningen för beräkningskraften.</p>
<p><strong>Så använder du den.</strong> Efter ett kraftigt prisfall kan gruvkapitulation vara ett skäl att börja följa en möjlig återhämtning. Om ökad hashhastighet kommer medan bitcoin sätter nya bottnar har beräkningskraften vänt upp, medan prisutvecklingen fortfarande är svag. Om priset börjar hålla sig ovanför sina senaste bottnar syns tecken på förbättring på båda håll. Svårighetsbandet och gruvsignalerna kan reagera på samma händelse i nätverket.</p>

<h3>12. Halveringsband</h3>
<p><strong>Vad indikatorn visar.</strong> En halvering halverar antalet nya bitcoin per block. I dagsdiagrammet skuggas dagen och två dagar på vardera sidan så att du kan jämföra cykler. De tre första halveringarna skedde <strong>28 november 2012</strong>, <strong>9 juli 2016</strong> och <strong>11 maj 2020</strong>. Den fjärde ägde rum <strong>20 april 2024</strong> vid block <strong>840 000</strong>. Android-appen visar originalskriptets uppskattade datum <strong>11 mars 2024</strong> för det fjärde bandet.</p>
<p><strong>Så använder du den.</strong> Studera priset och villkoren för bitcoinbrytning under veckorna eller månaderna före och efter en halvering. Bandet markerar att utgivningen förändras. Efterfrågan, priset och aktiviteten i nätverket kan reagera vid olika tidpunkter.</p>

<h3>Två exempel i dagsdiagrammet</h3>
<ul>
<li><strong>Efter en lång uppgång.</strong> Anta att bitcoin stänger på 122 000 USD efter att ha nått gyllene snittets linje på 120 000 USD, och att Pi Cycle-indikatorns gula linje ligger på 78 000 och närmar sig den blågröna på 80 000. Priset har nått en nivå värd att bevaka. Pi Cycle-signalen kommer först när <strong>de två medelvärdena</strong> korsas. Stängningar tillbaka under 120 000 USD och orange Guppy-kryss kan visa att uppgången mattas av även innan Pi Cycle-linjerna korsas.</li>
<li><strong>Efter ett stort prisfall.</strong> Anta att bitcoin faller under 200-veckorsmedelvärdet på 25 000 USD och sedan stänger ovanför det flera dagar i rad. Om du samtidigt ser <strong>Ökad hashhastighet</strong> har priset återtagit en långsiktig nivå samtidigt som nätverkets beräkningskraft har börjat återhämta sig. Om priset stänger under 25 000 USD flera gånger igen försvagas tecknet på en prisåterhämtning.</li>
</ul>
`
};
