const messages = {
  en: {
    refresh: 'Refresh prices', chartControls: 'Chart controls', commonIntervals: 'Common intervals',
    allIntervals: 'All intervals', overlays: 'Overlays', overlaySettings: 'Overlay settings',
    bitcoinChart: 'Bitcoin chart', autoScale: 'Auto scale', candlePrices: 'Selected candle prices',
    open: 'Open', high: 'High', low: 'Low', close: 'Close', openShort: 'O', closeShort: 'C',
    chartInstructions: 'Bitcoin price and overlay chart. Drag or pinch horizontally, vertically or diagonally. Tap a candle to inspect its prices. Use the arrow keys to pan, and plus and minus to zoom.',
    retry: 'Retry', viewDemo: 'View demo', visibleRange: 'Visible chart range', all: 'All',
    allPlots: 'All plots', allPlotsTitle: 'Include all overlays in the price scale',
    log: 'Log', logTitle: 'Logarithmic price scale', latest: 'Latest', latestTitle: 'Jump to the latest candle',
    feedStatus: 'Data sources and status', chartInterval: 'Chart interval', dismiss: 'Close',
    endLabels: 'End labels', projections: 'Log-channel projections', dataSources: 'Data sources',
    demoChart: 'View demo chart', returnToBitstamp: 'Return to Bitstamp',
    priceAlert: 'Price alert', repoLink: 'Open the TradingViewBTC GitHub repository',
    help: 'Help me', guideTitle: 'Indicator guide for beginners', languageSetting: 'App language',
    systemLanguage: 'Follow Android', english: 'English', swedish: 'Svenska',
    loadingCandles: 'Loading Bitstamp BTC/USD', fetching: interval => 'Fetching '+interval+' candles',
    candleError: 'Couldn’t load Bitstamp candles',
    checkConnection: 'Check your connection or open the simulated chart.',
    liveCached: 'Live price · cached candles', liveUnavailable: 'Live price · candles unavailable',
    liveHistory: 'Live price · loading candle history', liveTrades: 'Bitstamp · live trades (1s)',
    marketLoading: 'Connecting to Bitstamp', marketHistory: 'Bitstamp · loading older candles',
    marketPartial: 'Bitstamp · history incomplete', marketLive: 'Bitstamp · updated every 30s',
    marketCache: 'Bitstamp · refreshing cached candles', marketStale: 'Bitstamp · showing last available candles',
    marketFailed: 'Bitstamp unavailable', marketDemo: 'Demo · simulated prices and overlays',
    simulatedBadge: 'SIMULATED DATA', cachedBadge: 'CACHED DATA',
    connecting: 'Connecting', feedUnavailable: 'Feed unavailable', cachedData: 'Cached data',
    cachedFeed: 'Cached feed', dailyData: 'Daily data available', waitingHistory: 'Waiting for candle history.',
    candlesAvailable: count => count+' candles available.',
    warmup: (average,heatmap) => 'The 200 Week MA needs '+average+' candles and its heatmap needs '+heatmap+'.',
    simulatedDifficulty: 'Simulated network difficulty.', simulatedHashRate: 'Simulated hash rate.',
    investor: '2-year investor bands', investorInfo: '730-bar average and its 5× band',
    wma: '200 Week MA', wmaInfo: '1,400-bar average and BUY labels',
    heat: '200 WMA heatmap', heatInfo: '30-bar change and parabolic signals',
    pi: 'Pi Cycle Top', piInfo: '111-bar and 2× 350-bar averages',
    golden: 'Golden Ratio Multiplier', goldenInfo: '3× the 350-bar average',
    woo: 'Woo Top Cap', wooInfo: '35× cumulative average adjusted from Genesis',
    sar: 'Lucid SAR', sarInfo: 'Custom parabolic stop and reversal',
    guppy: 'Guppy in one line', guppyInfo: '60-bar EMA colored by the order of the six slow EMAs',
    channel: 'Logarithmic channel', channelInfo: 'Top, middle and bottom curves with signals',
    difficulty: 'Difficulty ribbon', difficultyInfo: 'Eight mining difficulty averages',
    miners: 'Miner signals', minersInfo: '30-day and 60-day hash-rate crossings',
    halvings: 'Halving bands', halvingsInfo: 'Dates and ±2-day bands from the original script',
    wmaLabel: '200 WMA', piFastLabel: 'Pi Top Fast', piSlowLabel: 'Pi Top Slow',
    goldenLabel: 'Golden Ratio 2021', wooLabel: 'Woo Top Cap', guppyLabel: 'Guppy in 1 line',
    overSold: 'Over\nSold', buy: 'BUY', sellPi: 'SELL · Pi Cycle Top',
    parabolic: 'Parabolic · 15%', hyperParabolic: 'Hyper Parabolic · 20%',
    minerCapitulation: 'Miner\nCapitulation', minerIncrease: 'Miner\nIncrease', sellChannel: 'SELL · Log Channel'
  },
  sv: {
    refresh: 'Uppdatera priser', chartControls: 'Diagramkontroller', commonIntervals: 'Vanliga intervall',
    allIntervals: 'Alla intervall', overlays: 'Indikatorer', overlaySettings: 'Indikatorinställningar',
    bitcoinChart: 'Bitcoindiagram', autoScale: 'Autoskala', candlePrices: 'Priser för valt kursljus',
    open: 'Öppning', high: 'Högsta', low: 'Lägsta', close: 'Stängning', openShort: 'Ö', closeShort: 'S',
    chartInstructions: 'Diagram med bitcoinpris och indikatorer. Dra eller nyp vågrätt, lodrätt eller diagonalt. Tryck på ett kursljus för att se priserna. Panorera med piltangenterna och zooma med plus och minus.',
    retry: 'Försök igen', viewDemo: 'Visa demo', visibleRange: 'Synligt tidsintervall', all: 'Alla',
    allPlots: 'Alla linjer', allPlotsTitle: 'Ta med alla indikatorer i prisskalan',
    log: 'Log', logTitle: 'Logaritmisk prisskala', latest: 'Senaste', latestTitle: 'Gå till senaste kursljuset',
    feedStatus: 'Datakällor och status', chartInterval: 'Diagramintervall', dismiss: 'Stäng',
    endLabels: 'Etiketter vid linjernas slut', projections: 'Förläng logaritmkanalen', dataSources: 'Datakällor',
    demoChart: 'Visa demodiagram', returnToBitstamp: 'Tillbaka till Bitstamp',
    priceAlert: 'Prislarm', repoLink: 'Öppna TradingViewBTC på GitHub',
    help: 'Hjälp mig', guideTitle: 'Indikatorguide för nybörjare', languageSetting: 'Appspråk',
    systemLanguage: 'Följ Android', english: 'English', swedish: 'Svenska',
    loadingCandles: 'Laddar BTC/USD från Bitstamp', fetching: interval => 'Hämtar kursljus för '+interval,
    candleError: 'Kunde inte hämta kursljus från Bitstamp',
    checkConnection: 'Kontrollera anslutningen eller öppna demodiagrammet.',
    liveCached: 'Livepris · sparade kursljus', liveUnavailable: 'Livepris · kursljus saknas',
    liveHistory: 'Livepris · hämtar kurshistorik', liveTrades: 'Bitstamp · avslut i realtid (1 s)',
    marketLoading: 'Ansluter till Bitstamp', marketHistory: 'Bitstamp · hämtar äldre kursljus',
    marketPartial: 'Bitstamp · ofullständig historik', marketLive: 'Bitstamp · uppdateras var 30:e sekund',
    marketCache: 'Bitstamp · uppdaterar sparade kursljus', marketStale: 'Bitstamp · visar senast tillgängliga kursljus',
    marketFailed: 'Bitstamp är inte tillgängligt', marketDemo: 'Demo · simulerade priser och indikatorer',
    simulatedBadge: 'SIMULERADE DATA', cachedBadge: 'SPARADE DATA',
    connecting: 'Ansluter', feedUnavailable: 'Datakällan är inte tillgänglig', cachedData: 'Sparade data',
    cachedFeed: 'Sparade nätverksdata', dailyData: 'Dagliga data finns', waitingHistory: 'Väntar på kurshistorik.',
    candlesAvailable: count => count+' kursljus tillgängliga.',
    warmup: (average,heatmap) => '200-veckorsmedelvärdet behöver '+average+' kursljus och värmekartan '+heatmap+'.',
    simulatedDifficulty: 'Simulerad svårighetsgrad.', simulatedHashRate: 'Simulerad hashhastighet.',
    investor: '2-årsband', investorInfo: 'Medelvärde över 730 kursljus och dess 5×-band',
    wma: '200-veckorsmedelvärde', wmaInfo: 'Medelvärde över 1 400 kursljus och KÖP-markeringar',
    heat: '200-veckorsvärmekarta', heatInfo: 'Förändring över 30 kursljus och markeringar för stora rörelser',
    pi: 'Pi Cycle Top', piInfo: 'Medelvärdet över 111 kursljus och det dubbla 350-medelvärdet',
    golden: 'Gyllene snittets multiplikator', goldenInfo: '3× medelvärdet över 350 kursljus',
    woo: 'Woos Top Cap', wooInfo: '35× ackumulerat medelvärde justerat från starten',
    sar: 'Lucid SAR', sarInfo: 'Parabolisk nivå som följer trenden och markerar vändningar',
    guppy: 'Guppy på en linje', guppyInfo: 'EMA över 60 kursljus med färg efter de sex långsamma medelvärdenas ordning',
    channel: 'Logaritmisk kanal', channelInfo: 'Övre, mellersta och nedre kurvor med markeringar',
    difficulty: 'Svårighetsband', difficultyInfo: 'Åtta medelvärden för nätverkets svårighetsgrad',
    miners: 'Gruvsignaler', minersInfo: 'Korsningar mellan hashhastighetens 30- och 60-dagarsmedelvärden',
    halvings: 'Halveringsband', halvingsInfo: 'Datum och band på ±2 dagar från originalskriptet',
    wmaLabel: '200 veckors MA', piFastLabel: 'Pi Top snabb', piSlowLabel: 'Pi Top långsam',
    goldenLabel: 'Gyllene snittet 2021', wooLabel: 'Woos Top Cap', guppyLabel: 'Guppy på en linje',
    overSold: 'Över\n5×-bandet', buy: 'KÖP', sellPi: 'SÄLJ · Pi Cycle Top',
    parabolic: 'Parabolisk · 15 %', hyperParabolic: 'Hyperparabolisk · 20 %',
    minerCapitulation: 'Gruvkapitulation', minerIncrease: 'Ökad\nhashhastighet', sellChannel: 'SÄLJ · Logaritmkanal'
  }
};

const intervalUnits = {
  en: {m:['minute','minutes'],h:['hour','hours'],D:['day','days'],W:['week','weeks'],M:['month','months'],Y:['year','years']},
  sv: {m:['minut','minuter'],h:['timme','timmar'],D:['dag','dagar'],W:['vecka','veckor'],M:['månad','månader'],Y:['år','år']}
};
const swedishUnits = {m:'m',h:'t',D:'D',W:'V',M:'M',Y:'Å'};

export function chooseLanguage(preference, systemLocale) {
  if (preference === 'en' || preference === 'sv') return preference;
  return /^sv(?:-|$)/i.test(systemLocale || '') ? 'sv' : 'en';
}

export function createLocale(language) {
  const format = language === 'sv' ? 'sv-SE' : 'en-US';
  const t = (key,...args) => {
    const message = messages[language][key];
    return typeof message === 'function' ? message(...args) : message;
  };
  const shortInterval = (label,toolbar = false) => {
    if (language === 'sv') return label.slice(0,-1)+swedishUnits[label.at(-1)];
    return toolbar ? label.toUpperCase() : label;
  };
  const longInterval = label => {
    const count = Number(label.slice(0,-1));
    return count+' '+intervalUnits[language][label.at(-1)][count === 1 ? 0 : 1];
  };
  return {
    language, t, shortInterval, longInterval,
    number: new Intl.NumberFormat(format,{maximumFractionDigits:0}),
    price: new Intl.NumberFormat(format,{maximumFractionDigits:2}),
    quote: new Intl.NumberFormat(format,{style:'currency',currency:'USD',currencyDisplay:'narrowSymbol'}),
    decimal: new Intl.NumberFormat(format,{minimumFractionDigits:2,maximumFractionDigits:2}),
    date: new Intl.DateTimeFormat(format,{month:'short',day:'numeric',timeZone:'UTC'}),
    month: new Intl.DateTimeFormat(format,{month:'short',timeZone:'UTC'}),
    clock: new Intl.DateTimeFormat(format,{hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'UTC'})
  };
}
