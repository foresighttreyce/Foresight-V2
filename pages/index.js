import { useState, useEffect } from 'react'
import Head from 'next/head'


export default function ForesightEnterprise() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [marketData, setMarketData] = useState(null)
  const [stockData, setStockData] = useState({})
  const [loading, setLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showPortfolioDetail, setShowPortfolioDetail] = useState(false)
  const [showCustodyPrompt, setShowCustodyPrompt] = useState(false)
  const [showMultisigModal, setShowMultisigModal] = useState(false)
  const [pendingBtcTrade, setPendingBtcTrade] = useState(null)
  const [selectedTrade, setSelectedTrade] = useState(null)
  const [selectedAsset, setSelectedAsset] = useState('BTC')
  const [tradeAmount, setTradeAmount] = useState('')
  const [tradeSide, setTradeSide] = useState('BUY')
  const [transferAmount, setTransferAmount] = useState('')
  const [reportFilters, setReportFilters] = useState({
    period: '30d',
    type: 'performance',
    format: 'pdf'
  })
  
  const [portfolio, setPortfolio] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('foresight-portfolio')
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return {
      cashUSD: 1000000,
      btcHoldings: 0,
      btcHoldingsHot: 0,
      btcHoldingsCold: 0,
      totalValue: 1000000,
      unrealizedPL: 0,
      costBasis: 0,
      trades: [],
      stocks: {
        MSTR: { shares: 0, costBasis: 0 },
        STRE: { shares: 0, costBasis: 0 },
        STRK: { shares: 0, costBasis: 0 },
        STRF: { shares: 0, costBasis: 0 },
        STRD: { shares: 0, costBasis: 0 }
      }
    }
  })


  const [coldStorage, setColdStorage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('foresight-cold-storage')
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return {
      totalBTC: 0,
      transactions: [],
      multisigConfig: {
        requiredSignatures: 3,
        totalSigners: 5,
        signers: [
          { name: 'Treasury Lead', status: 'pending' },
          { name: 'CFO', status: 'pending' },
          { name: 'Security Officer', status: 'pending' },
          { name: 'Compliance', status: 'pending' },
          { name: 'CEO', status: 'pending' }
        ]
      }
    }
  })


  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('foresight-portfolio', JSON.stringify(portfolio))
      localStorage.setItem('foresight-cold-storage', JSON.stringify(coldStorage))
    }
  }, [portfolio, coldStorage])


  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true)
        
        const btcResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true')
        const btcData = await btcResponse.json()
        
        const stockSymbols = ['MSTR', 'STRE', 'STRK', 'STRF', 'STRD']
        const stockDataObj = {}
        stockSymbols.forEach(symbol => {
          stockDataObj[symbol] = {
            usd: Math.random() * 200 + 50,
            usd_24h_change: (Math.random() - 0.5) * 20
          }
        })
        
        setMarketData(btcData.bitcoin)
        setStockData(stockDataObj)
      } catch (error) {
        console.error('Error fetching market data:', error)
      } finally {
        setLoading(false)
      }
    }


    fetchMarketData()
    const interval = setInterval(fetchMarketData, 30000)
    return () => clearInterval(interval)
  }, [])


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }


  const formatBTC = (amount) => {
    return amount.toFixed(6) + ' BTC'
  }


  const calculateStockValue = () => {
    return Object.keys(portfolio.stocks).reduce((total, symbol) => {
      const stock = portfolio.stocks[symbol]
      const price = stockData[symbol]?.usd || 0
      return total + (stock.shares * price)
    }, 0)
  }


  const updateUnrealizedPL = () => {
    if (!marketData) return
    const currentBtcValue = portfolio.btcHoldings * marketData.usd
    const stockValue = calculateStockValue()
    const stockCostBasis = Object.values(portfolio.stocks).reduce((total, stock) => total + stock.costBasis, 0)
    
    const newUnrealizedPL = (currentBtcValue - portfolio.costBasis) + (stockValue - stockCostBasis)
    const newTotalValue = portfolio.cashUSD + currentBtcValue + stockValue
    
    setPortfolio(prev => ({
      ...prev,
      unrealizedPL: newUnrealizedPL,
      totalValue: newTotalValue
    }))
  }


  useEffect(() => {
    updateUnrealizedPL()
  }, [marketData, stockData])


  const executeTrade = async (side, amount, asset = 'BTC') => {
    if (!marketData && asset === 'BTC') return
    
    const price = asset === 'BTC' ? marketData.usd : stockData[asset]?.usd
    if (!price) return


    const fee = amount * 0.005
    const netAmount = amount - fee


    if (side === 'BUY') {
      if (portfolio.cashUSD < amount) {
        alert('Insufficient funds!')
        return
      }


      let assetAmount, newPortfolio


      if (asset === 'BTC') {
        assetAmount = netAmount / price
        newPortfolio = {
          ...portfolio,
          cashUSD: portfolio.cashUSD - amount,
          btcHoldings: portfolio.btcHoldings + assetAmount,
          btcHoldingsHot: portfolio.btcHoldingsHot + assetAmount,
          totalValue: portfolio.cashUSD - amount + (portfolio.btcHoldings + assetAmount) * price + calculateStockValue(),
          costBasis: portfolio.costBasis + netAmount,
          trades: [...portfolio.trades, {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            side,
            asset,
            amount: assetAmount,
            priceUSD: price,
            totalUSD: amount,
            feeUSD: fee,
            storage: 'hot'
          }]
        }


        setPendingBtcTrade({
          amount: assetAmount,
          trade: newPortfolio.trades[newPortfolio.trades.length - 1]
        })
        setPortfolio(newPortfolio)
        setShowCustodyPrompt(true)
        
      } else {
        assetAmount = netAmount / price
        const currentStock = portfolio.stocks[asset]
        newPortfolio = {
          ...portfolio,
          cashUSD: portfolio.cashUSD - amount,
          stocks: {
            ...portfolio.stocks,
            [asset]: {
              shares: currentStock.shares + assetAmount,
              costBasis: currentStock.costBasis + netAmount
            }
          },
          totalValue: portfolio.cashUSD - amount + portfolio.btcHoldings * (marketData?.usd || 0) + calculateStockValue() + netAmount,
          trades: [...portfolio.trades, {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            side,
            asset,
            amount: assetAmount,
            priceUSD: price,
            totalUSD: amount,
            feeUSD: fee
          }]
        }
        setPortfolio(newPortfolio)
      }


    } else {
      if (asset === 'BTC') {
        const availableBTC = portfolio.btcHoldingsHot
        const btcToSell = netAmount / price
        
        if (availableBTC < btcToSell) {
          if (portfolio.btcHoldingsCold > 0) {
            alert(`Insufficient BTC in hot wallet! You have ${portfolio.btcHoldingsCold.toFixed(6)} BTC in cold storage. Please transfer to hot wallet first via multisig process.`)
          } else {
            alert('Insufficient BTC in hot wallet!')
          }
          return
        }


        const newPortfolio = {
          ...portfolio,
          cashUSD: portfolio.cashUSD + netAmount,
          btcHoldings: portfolio.btcHoldings - btcToSell,
          btcHoldingsHot: portfolio.btcHoldingsHot - btcToSell,
          totalValue: portfolio.cashUSD + netAmount + (portfolio.btcHoldings - btcToSell) * price + calculateStockValue(),
          trades: [...portfolio.trades, {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            side,
            asset,
            amount: btcToSell,
            priceUSD: price,
            totalUSD: amount,
            feeUSD: fee,
            storage: 'hot'
          }]
        }
        setPortfolio(newPortfolio)
        
      } else {
        const currentStock = portfolio.stocks[asset]
        const sharesToSell = netAmount / price
        
        if (currentStock.shares < sharesToSell) {
          alert(`Insufficient ${asset} shares!`)
          return
        }


        const newPortfolio = {
          ...portfolio,
          cashUSD: portfolio.cashUSD + netAmount,
          stocks: {
            ...portfolio.stocks,
            [asset]: {
              shares: currentStock.shares - sharesToSell,
              costBasis: Math.max(0, currentStock.costBasis - (currentStock.costBasis * (sharesToSell / currentStock.shares)))
            }
          },
          totalValue: portfolio.cashUSD + netAmount + portfolio.btcHoldings * (marketData?.usd || 0) + calculateStockValue() - netAmount,
          trades: [...portfolio.trades, {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            side,
            asset,
            amount: sharesToSell,
            priceUSD: price,
            totalUSD: amount,
            feeUSD: fee
          }]
        }
        setPortfolio(newPortfolio)
      }
    }


    updateUnrealizedPL()
  }


  const handleCustodyDecision = (moveToCold) => {
    if (!pendingBtcTrade) return


    if (moveToCold) {
      const newPortfolio = {
        ...portfolio,
        btcHoldingsHot: portfolio.btcHoldingsHot - pendingBtcTrade.amount,
        btcHoldingsCold: portfolio.btcHoldingsCold + pendingBtcTrade.amount
      }
      
      const newColdStorage = {
        ...coldStorage,
        totalBTC: coldStorage.totalBTC + pendingBtcTrade.amount,
        transactions: [...coldStorage.transactions, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          type: 'deposit',
          amount: pendingBtcTrade.amount,
          tradeId: pendingBtcTrade.trade.id,
          status: 'completed'
        }]
      }
      
      setPortfolio(newPortfolio)
      setColdStorage(newColdStorage)
    }
    
    setShowCustodyPrompt(false)
    setPendingBtcTrade(null)
  }


  const startMultisigTransfer = (amount) => {
    if (coldStorage.totalBTC < amount) {
      alert('Insufficient BTC in cold storage!')
      return
    }
    
    setSelectedTrade({ amount, type: 'cold-to-hot' })
    setShowMultisigModal(true)
    
    const resetSigners = coldStorage.multisigConfig.signers.map(signer => ({
      ...signer,
      status: 'pending'
    }))
    
    setColdStorage({
      ...coldStorage,
      multisigConfig: {
        ...coldStorage.multisigConfig,
        signers: resetSigners
      }
    })
  }


  const processMultisigSignature = () => {
    const signers = [...coldStorage.multisigConfig.signers]
    const pendingSigner = signers.find(s => s.status === 'pending')
    
    if (pendingSigner) {
      pendingSigner.status = 'signed'
      
      setColdStorage({
        ...coldStorage,
        multisigConfig: {
          ...coldStorage.multisigConfig,
          signers
        }
      })
      
      const signedCount = signers.filter(s => s.status === 'signed').length
      
      if (signedCount >= coldStorage.multisigConfig.requiredSignatures) {
        setTimeout(() => {
          completeMultisigTransfer()
        }, 1000)
      }
    }
  }


  const completeMultisigTransfer = () => {
    if (!selectedTrade) return
    
    const transferAmount = selectedTrade.amount
    
    const newPortfolio = {
      ...portfolio,
      btcHoldingsHot: portfolio.btcHoldingsHot + transferAmount,
      btcHoldingsCold: portfolio.btcHoldingsCold - transferAmount
    }
    
    const newColdStorage = {
      ...coldStorage,
      totalBTC: coldStorage.totalBTC - transferAmount,
      transactions: [...coldStorage.transactions, {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: 'withdrawal',
        amount: transferAmount,
        status: 'completed',
        multisigApproved: true
      }]
    }
    
    setPortfolio(newPortfolio)
    setColdStorage(newColdStorage)
    setShowMultisigModal(false)
    setSelectedTrade(null)
  }


  const resetDemo = () => {
    const initialPortfolio = {
      cashUSD: 1000000,
      btcHoldings: 0,
      btcHoldingsHot: 0,
      btcHoldingsCold: 0,
      totalValue: 1000000,
      unrealizedPL: 0,
      costBasis: 0,
      trades: [],
      stocks: {
        MSTR: { shares: 0, costBasis: 0 },
        STRE: { shares: 0, costBasis: 0 },
        STRK: { shares: 0, costBasis: 0 },
        STRF: { shares: 0, costBasis: 0 },
        STRD: { shares: 0, costBasis: 0 }
      }
    }
    
    const initialColdStorage = {
      totalBTC: 0,
      transactions: [],
      multisigConfig: {
        requiredSignatures: 3,
        totalSigners: 5,
        signers: [
          { name: 'Treasury Lead', status: 'pending' },
          { name: 'CFO', status: 'pending' },
          { name: 'Security Officer', status: 'pending' },
          { name: 'Compliance', status: 'pending' },
          { name: 'CEO', status: 'pending' }
        ]
      }
    }
    
    setPortfolio(initialPortfolio)
    setColdStorage(initialColdStorage)
    setShowUserMenu(false)
  }


  const generateReport = (type, format) => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: reportFilters.period,
      portfolio: portfolio,
      coldStorage: coldStorage,
      marketData: marketData,
      stockData: stockData
    }
    
    if (format === 'pdf') {
      // Simulate PDF download
      const fileName = `foresight-${type}-report-${new Date().toISOString().split('T')[0]}.pdf`
      alert(`Generating ${fileName}...\n\nThis would download a professional PDF report in a real implementation.`)
    } else if (format === 'csv') {
      // Generate CSV
      const csvData = portfolio.trades.map(trade => ({
        Date: new Date(trade.timestamp).toLocaleDateString(),
        Asset: trade.asset,
        Side: trade.side,
        Amount: trade.amount,
        Price: trade.priceUSD,
        Total: trade.totalUSD,
        Fee: trade.feeUSD,
        Storage: trade.storage || 'N/A'
      }))
      
      const csvContent = [
        Object.keys(csvData[0] || {}).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `foresight-trades-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }


  const currentPrice = selectedAsset === 'BTC' ? marketData?.usd : stockData[selectedAsset]?.usd
  const estimatedAssetAmount = tradeAmount && currentPrice ? parseFloat(tradeAmount) / currentPrice : 0
  const maxBuyAmount = portfolio.cashUSD
  const maxSellAmount = selectedAsset === 'BTC' 
    ? portfolio.btcHoldingsHot * (currentPrice || 0)
    : (portfolio.stocks[selectedAsset]?.shares || 0) * (currentPrice || 0)
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1629 0%, #1a2332 25%, #0f1629 50%, #1a2332 75%, #0f1629 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Head>
        <title>Foresight Enterprise™ - Bitcoin Treasury Management</title>
        <meta name="description" content="Enterprise Bitcoin Treasury Management Platform" />
      </Head>


      {/* Enhanced Animated Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {/* Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            borderRadius: '50%',
            background: `rgba(6, 182, 212, ${0.3 + Math.random() * 0.4})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${8 + Math.random() * 12}s linear infinite`,
            animationDelay: `${Math.random() * 8}s`
          }} />
        ))}
        
        {/* Gradient Orbs */}
        {[...Array(8)].map((_, i) => (
          <div key={`orb-${i}`} style={{
            position: 'absolute',
            width: `${150 + i * 75}px`,
            height: `${150 + i * 75}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(6, 182, 212, ${0.15 - i * 0.015}) 0%, rgba(8, 145, 178, ${0.08 - i * 0.008}) 40%, transparent 70%)`,
            left: `${15 + i * 12}%`,
            top: `${10 + i * 8}%`,
            animation: `pulse ${4 + i * 0.5}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.3}s`
          }} />
        ))}


        {/* Network Lines */}
        <svg style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.1
        }}>
          {[...Array(6)].map((_, i) => (
            <line
              key={`line-${i}`}
              x1={`${i * 20}%`}
              y1="0%"
              x2={`${100 - i * 15}%`}
              y2="100%"
              stroke="rgba(6, 182, 212, 0.3)"
              strokeWidth="1"
              style={{
                animation: `lineGlow ${3 + i}s ease-in-out infinite alternate`
              }}
            />
          ))}
        </svg>
      </div>


      {/* Main Container */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Enhanced Header */}
        <header style={{
          background: 'rgba(15, 22, 41, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
          padding: '20px 40px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1600px',
            margin: '0 auto'
          }}>
            {/* Enhanced Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '24px',
                boxShadow: '0 8px 25px rgba(6, 182, 212, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                  animation: 'shine 3s ease-in-out infinite'
                }} />
                F
              </div>
              <div>
                <h1 style={{ 
                  margin: 0, 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#e2e8f0',
                  background: 'linear-gradient(135deg, #e2e8f0 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Foresight Enterprise™
                </h1>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                  by Foresight Capital
                </p>
              </div>
            </div>


            {/* Enhanced Navigation */}
            <nav style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(6, 182, 212, 0.05)', borderRadius: '16px', padding: '8px' }}>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'trade', label: 'Trading', icon: '💹' },
                { id: 'custody', label: 'Custody', icon: '🔐' },
                { id: 'reporting', label: 'Reports', icon: '📋' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id 
                      ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' 
                      : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#94a3b8',
                    border: 'none',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '15px',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: activeTab === tab.id ? 'translateY(-1px)' : 'translateY(0)',
                    boxShadow: activeTab === tab.id ? '0 4px 15px rgba(6, 182, 212, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.background = 'rgba(6, 182, 212, 0.1)'
                      e.target.style.color = '#e2e8f0'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.background = 'transparent'
                      e.target.style.color = '#94a3b8'
                    }
                  }}
                >
                  <span style={{ marginRight: '8px', fontSize: '16px' }}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>


            {/* Enhanced User Menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  border: '2px solid rgba(6, 182, 212, 0.3)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)'
                  e.target.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.boxShadow = '0 4px 15px rgba(6, 182, 212, 0.3)'
                }}
              >
                TC
              </button>


              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '65px',
                  right: 0,
                  background: 'rgba(15, 22, 41, 0.98)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                  padding: '20px',
                  minWidth: '240px',
                  zIndex: 200,
                  animation: 'slideDown 0.3s ease-out'
                }}>
                  <div style={{ 
                    padding: '16px 20px', 
                    borderBottom: '1px solid rgba(6, 182, 212, 0.1)',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontWeight: '600', color: '#e2e8f0', fontSize: '16px' }}>Treasury Corp</div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>treasury@corp.com</div>
                  </div>
                  
                  {[
                    { id: 'company', label: 'Company Profile', icon: '🏢' },
                    { id: 'privacy', label: 'Privacy Policy', icon: '🔒' },
                    { id: 'terms', label: 'Terms & Conditions', icon: '📄' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setShowUserMenu(false) }}
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        color: '#94a3b8',
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '4px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(6, 182, 212, 0.1)'
                        e.target.style.color = '#e2e8f0'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'none'
                        e.target.style.color = '#94a3b8'
                      }}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                  
                  <hr style={{ 
                    margin: '16px 0', 
                    border: 'none', 
                    borderTop: '1px solid rgba(6, 182, 212, 0.1)' 
                  }} />
                  
                  <button
                    onClick={resetDemo}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                      color: '#f87171',
                      fontWeight: '600',
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(248, 113, 113, 0.1)'
                      e.target.style.color = '#fca5a5'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'none'
                      e.target.style.color = '#f87171'
                    }}
                  >
                    <span>🔄</span>
                    Reset Demo
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>


        {/* Enhanced Main Content */}
        <main style={{ 
          padding: '40px', 
          maxWidth: '1600px', 
          margin: '0 auto',
          minHeight: 'calc(100vh - 100px)'
        }}>
          {/* Dashboard Tab with Enhanced Styling */}
          {activeTab === 'dashboard' && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '40px',
              animation: 'slideUp 0.6s ease-out'
            }}>
              {/* Hero Section */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.05) 50%, rgba(6, 182, 212, 0.1) 100%)',
                borderRadius: '28px',
                padding: '60px',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Subtle animated background pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306B6D4' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  animation: 'backgroundMove 20s linear infinite'
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h1 style={{ 
                    fontSize: '42px', 
                    fontWeight: '800', 
                    color: '#e2e8f0', 
                    marginBottom: '12px',
                    background: 'linear-gradient(135deg, #e2e8f0 0%, #06b6d4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Treasury Dashboard
                  </h1>
                  <p style={{ 
                    color: '#94a3b8', 
                    marginBottom: '40px', 
                    fontSize: '20px',
                    fontWeight: '400',
                    lineHeight: '1.6'
                  }}>
                    Real-time portfolio overview and institutional-grade Bitcoin treasury management
                  </p>


                  {/* Enhanced Market Data Bar */}
                  {marketData && (
                    <div style={{
                      background: 'rgba(6, 182, 212, 0.08)',
                      borderRadius: '20px',
                      padding: '32px',
                      marginBottom: '40px',
                      border: '1px solid rgba(6, 182, 212, 0.15)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '32px',
                        alignItems: 'center'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                            Bitcoin Price
                          </div>
                          <div style={{ 
                            fontSize: '32px', 
                            fontWeight: 'bold', 
                            color: '#06b6d4',
                            textShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
                          }}>
                            {formatCurrency(marketData.usd)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                            24h Change
                          </div>
                          <div style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: marketData.usd_24h_change >= 0 ? '#10b981' : '#ef4444',
                            textShadow: `0 0 20px ${marketData.usd_24h_change >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                          }}>
                            {marketData.usd_24h_change >= 0 ? '+' : ''}{marketData.usd_24h_change?.toFixed(2)}%
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                            Market Cap
                          </div>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e2e8f0' }}>
                            {formatCurrency(marketData.usd_market_cap)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                            24h Volume
                          </div>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e2e8f0' }}>
                            {formatCurrency(marketData.usd_24h_vol)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* Enhanced Portfolio KPIs */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                    gap: '32px' 
                  }}>
                    <div 
                      onClick={() => setShowPortfolioDetail(true)}
                      style={{
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.1) 100%)',
                        borderRadius: '24px',
                        padding: '40px',
                        border: '1px solid rgba(6, 182, 212, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.4s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                        e.currentTarget.style.boxShadow = '0 30px 60px rgba(6, 182, 212, 0.2)'
                        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.2)'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'linear-gradient(45deg, transparent, rgba(6, 182, 212, 0.1), transparent)',
                        animation: 'shine 4s ease-in-out infinite',
                        opacity: 0.5
                      }} />
                      
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start', 
                        marginBottom: '24px',
                        position: 'relative',
                        zIndex: 1
                      }}>
                        <h3 style={{ color: '#e2e8f0', fontSize: '20px', margin: 0, fontWeight: '600' }}>
                          Total Portfolio Value
                        </h3>
                        <div style={{ 
                          fontSize: '32px',
                          filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.5))'
                        }}>💎</div>
                      </div>
                      <div style={{ 
                        fontSize: '36px', 
                        fontWeight: 'bold', 
                        color: '#06b6d4', 
                        marginBottom: '12px',
                        textShadow: '0 0 30px rgba(6, 182, 212, 0.4)',
                        position: 'relative',
                        zIndex: 1
                      }}>
                        {formatCurrency(portfolio.totalValue)}
                      </div>
                      <div style={{ 
                        fontSize: '15px', 
                        color: '#64748b',
                        position: 'relative',
                        zIndex: 1
                      }}>
                        Click for detailed breakdown →
                      </div>
                    </div>


                    <div style={{
                      background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(251, 113, 133, 0.1) 100%)',
                      borderRadius: '24px',
                      padding: '40px',
                      border: '1px solid rgba(251, 146, 60, 0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start', 
                        marginBottom: '24px' 
                      }}>
                        <h3 style={{ color: '#e2e8f0', fontSize: '20px', margin: 0, fontWeight: '600' }}>
                          Bitcoin Holdings
                        </h3>
                        <div style={{ 
                          fontSize: '32px',
                          filter: 'drop-shadow(0 0 10px rgba(251, 146, 60, 0.5))'
                        }}>₿</div>
                      </div>
                      <div style={{ 
                        fontSize: '36px', 
                        fontWeight: 'bold', 
                        color: '#f59e0b', 
                        marginBottom: '12px',
                        textShadow: '0 0 30px rgba(251, 146, 60, 0.4)'
                      }}>
                        {formatBTC(portfolio.btcHoldings)}
                      </div>
                      <div style={{ fontSize: '15px', color: '#64748b' }}>
                        🔥 Hot: {formatBTC(portfolio.btcHoldingsHot)} | ❄️ Cold: {formatBTC(portfolio.btcHoldingsCold)}
                      </div>
                    </div>


                    <div style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                      borderRadius: '24px',
                      padding: '40px',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start', 
                        marginBottom: '24px' 
                      }}>
                        <h3 style={{ color: '#e2e8f0', fontSize: '20px', margin: 0, fontWeight: '600' }}>
                          Unrealized P&L
                        </h3>
                        <div style={{ 
                          fontSize: '32px',
                          filter: `drop-shadow(0 0 10px ${portfolio.unrealizedPL >= 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'})`
                        }}>
                          {portfolio.unrealizedPL >= 0 ? '📈' : '📉'}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: portfolio.unrealizedPL >= 0 ? '#10b981' : '#ef4444',
                        marginBottom: '12px',
                        textShadow: `0 0 30px ${portfolio.unrealizedPL >= 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                      }}>
                        {portfolio.unrealizedPL >= 0 ? '+' : ''}{formatCurrency(portfolio.unrealizedPL)}
                      </div>
                      <div style={{ fontSize: '15px', color: '#64748b' }}>
                        Cost Basis: {formatCurrency(portfolio.costBasis)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Enhanced Recent Trades */}
              {portfolio.trades.length > 0 && (
                <div style={{
                  background: 'rgba(6, 182, 212, 0.05)',
                  borderRadius: '28px',
                  padding: '40px',
                  border: '1px solid rgba(6, 182, 212, 0.15)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)'
                }}>
                  <h2 style={{ 
                    color: '#e2e8f0', 
                    marginBottom: '32px', 
                    fontSize: '28px', 
                    fontWeight: '700',
                    textAlign: 'center'
                  }}>
                    Recent Trading Activity
                  </h2>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '16px', 
                    maxHeight: '400px', 
                    overflow: 'auto',
                    paddingRight: '8px'
                  }}>
                    {portfolio.trades.slice(-8).reverse().map((trade, index) => (
                      <div key={trade.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '24px',
                        background: 'rgba(6, 182, 212, 0.08)',
                        borderRadius: '16px',
                        border: '1px solid rgba(6, 182, 212, 0.1)',
                        transition: 'all 0.3s ease',
                        animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: trade.side === 'BUY' ? '#10b981' : '#ef4444',
                            boxShadow: `0 0 15px ${trade.side === 'BUY' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`
                          }} />
                          <div>
                            <div style={{ fontWeight: '600', color: '#e2e8f0', fontSize: '16px' }}>
                              {trade.side} {trade.asset}
                            </div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                              {new Date(trade.timestamp).toLocaleString()}
                              {trade.storage && ` • ${trade.storage} wallet`}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ 
                            fontWeight: '700', 
                            color: trade.side === 'BUY' ? '#10b981' : '#ef4444',
                            fontSize: '16px'
                          }}>
                            {trade.side === 'BUY' ? '+' : '-'}
                            {trade.asset === 'BTC' ? formatBTC(trade.amount) : `${trade.amount.toFixed(2)} shares`}
                          </div>
                          <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                            {formatCurrency(trade.totalUSD)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Enhanced Trading Tab */}
          {activeTab === 'trade' && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '40px',
              animation: 'slideUp 0.6s ease-out'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.05) 100%)',
                borderRadius: '28px',
                padding: '60px',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2306B6D4' fill-opacity='0.02'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v20h20z'/%3E%3C/g%3E%3C/svg%3E")`,
                  animation: 'backgroundMove 15s linear infinite'
                }} />


                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h1 style={{ 
                    fontSize: '42px', 
                    fontWeight: '800', 
                    color: '#e2e8f0', 
                    marginBottom: '16px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #e2e8f0 0%, #06b6d4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Advanced Trading Interface
                  </h1>
                  <p style={{ 
                    color: '#94a3b8', 
                    marginBottom: '50px', 
                    fontSize: '18px',
                    textAlign: 'center',
                    maxWidth: '600px',
                    margin: '0 auto 50px auto'
                  }}>
                    Execute Bitcoin and leveraged equity trades with institutional-grade precision
                  </p>


                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>
                    {/* Enhanced Asset Selection */}
                    <div style={{
                      background: 'rgba(6, 182, 212, 0.05)',
                      borderRadius: '24px',
                      padding: '40px',
                      border: '1px solid rgba(6, 182, 212, 0.1)'
                    }}>
                      <h3 style={{ color: '#e2e8f0', marginBottom: '24px', fontSize: '24px', fontWeight: '700' }}>
                        Select Asset
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                          onClick={() => setSelectedAsset('BTC')}
                          style={{
                            padding: '20px',
                            background: selectedAsset === 'BTC' 
                              ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' 
                              : 'rgba(6, 182, 212, 0.08)',
                            border: `2px solid ${selectedAsset === 'BTC' ? '#06b6d4' : 'rgba(6, 182, 212, 0.2)'}`,
                            borderRadius: '16px',
                            color: selectedAsset === 'BTC' ? 'white' : '#e2e8f0',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '16px',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedAsset !== 'BTC') {
                              e.target.style.borderColor = 'rgba(6, 182, 212, 0.4)'
                              e.target.style.background = 'rgba(6, 182, 212, 0.12)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedAsset !== 'BTC') {
                              e.target.style.borderColor = 'rgba(6, 182, 212, 0.2)'
                              e.target.style.background = 'rgba(6, 182, 212, 0.08)'
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '24px' }}>₿</span>
                              <span>Bitcoin (BTC)</span>
                            </div>
                            <span style={{ fontWeight: 'bold' }}>
                              {loading ? 'Loading...' : formatCurrency(marketData?.usd || 0)}
                            </span>
                          </div>
                        </button>
                        
                        {['MSTR', 'STRE', 'STRK', 'STRF', 'STRD'].map(symbol => (
                          <button
                            key={symbol}
                            onClick={() => setSelectedAsset(symbol)}
                            style={{
                              padding: '20px',
                              background: selectedAsset === symbol 
                                ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' 
                                : 'rgba(6, 182, 212, 0.08)',
                              border: `2px solid ${selectedAsset === symbol ? '#06b6d4' : 'rgba(6, 182, 212, 0.2)'}`,
                              borderRadius: '16px',
                              color: selectedAsset === symbol ? 'white' : '#e2e8f0',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '16px',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedAsset !== symbol) {
                                e.target.style.borderColor = 'rgba(6, 182, 212, 0.4)'
                                e.target.style.background = 'rgba(6, 182, 212, 0.12)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedAsset !== symbol) {
                                e.target.style.borderColor = 'rgba(6, 182, 212, 0.2)'
                                e.target.style.background = 'rgba(6, 182, 212, 0.08)'
                              }
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '20px' }}>📈</span>
                                <span>{symbol}</span>
                              </div>
                              <span style={{ fontWeight: 'bold' }}>
                                {loading ? 'Loading...' : formatCurrency(stockData[symbol]?.usd || 0)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>


                    {/* Enhanced Trade Form */}
                    <div style={{
                      background: 'rgba(6, 182, 212, 0.05)',
                      borderRadius: '24px',
                      padding: '40px',
                      border: '1px solid rgba(6, 182, 212, 0.1)'
                    }}>
                      <h3 style={{ color: '#e2e8f0', marginBottom: '24px', fontSize: '24px', fontWeight: '700' }}>
                        Execute Trade
                      </h3>
                      
                      {/* Enhanced Buy/Sell Toggle */}
                      <div style={{ 
                        display: 'flex', 
                        marginBottom: '32px', 
                        background: 'rgba(6, 182, 212, 0.08)', 
                        borderRadius: '16px', 
                        padding: '6px',
                        border: '1px solid rgba(6, 182, 212, 0.2)'
                      }}>
                        <button
                          onClick={() => setTradeSide('BUY')}
                          style={{
                            flex: 1,
                            padding: '16px',
                            background: tradeSide === 'BUY' 
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                              : 'transparent',
                            border: 'none',
                            borderRadius: '12px',
                            color: tradeSide === 'BUY' ? 'white' : '#94a3b8',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: tradeSide === 'BUY' ? '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none'
                          }}
                        >
                          BUY
                        </button>
                        <button
                          onClick={() => setTradeSide('SELL')}
                          style={{
                            flex: 1,
                            padding: '16px',
                            background: tradeSide === 'SELL' 
                              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                              : 'transparent',
                            border: 'none',
                            borderRadius: '12px',
                            color: tradeSide === 'SELL' ? 'white' : '#94a3b8',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: tradeSide === 'SELL' ? '0 4px 15px rgba(239, 68, 68, 0.3)' : 'none'
                          }}
                        >
                          SELL
                        </button>
                      </div>


                      {/* Enhanced Amount Input */}
                      <div style={{ marginBottom: '32px' }}>
                        <label style={{ 
                          display: 'block', 
                          color: '#e2e8f0', 
                          fontWeight: '600', 
                          marginBottom: '12px',
                          fontSize: '16px'
                        }}>
                          Amount (USD)
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="number"
                            value={tradeAmount}
                            onChange={(e) => setTradeAmount(e.target.value)}
                            placeholder="Enter USD amount"
                            style={{
                              width: '100%',
                              padding: '20px',
                              paddingRight: '80px',
                              border: '2px solid rgba(6, 182, 212, 0.2)',
                              borderRadius: '16px',
                              fontSize: '18px',
                              background: 'rgba(6, 182, 212, 0.05)',
                              color: '#e2e8f0',
                              fontWeight: '600',
                              transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = 'rgba(6, 182, 212, 0.5)'
                              e.target.style.boxShadow = '0 0 20px rgba(6, 182, 212, 0.2)'
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'rgba(6, 182, 212, 0.2)'
                              e.target.style.boxShadow = 'none'
                            }}
                          />
                          <button
                            onClick={() => setTradeAmount((tradeSide === 'BUY' ? maxBuyAmount : maxSellAmount).toString())}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                              border: 'none',
                              borderRadius: '10px',
                              color: 'white',
                              padding: '10px 16px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-50%) scale(1.05)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(-50%) scale(1)'
                            }}
                          >
                            MAX
                          </button>
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                          Max {tradeSide.toLowerCase()}: {formatCurrency(tradeSide === 'BUY' ? maxBuyAmount : maxSellAmount)}
                        </div>
                      </div>


                      {/* Enhanced Trade Preview */}
                      {tradeAmount && currentPrice && (
                        <div style={{
                          background: 'rgba(6, 182, 212, 0.08)',
                          borderRadius: '16px',
                          padding: '24px',
                          marginBottom: '32px',
                          border: '1px solid rgba(6, 182, 212, 0.2)',
                          animation: 'slideIn 0.3s ease-out'
                        }}>
                          <h4 style={{ color: '#e2e8f0', marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                            Trade Preview
                          </h4>
                          {[
                            ['Estimated ' + selectedAsset, selectedAsset === 'BTC' ? `${estimatedAssetAmount.toFixed(6)} BTC` : `${estimatedAssetAmount.toFixed(2)} shares`],
                            ['Price', formatCurrency(currentPrice)],
                            ['Fee (0.5%)', formatCurrency(parseFloat(tradeAmount || 0) * 0.005)]
                          ].map(([label, value], index) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              marginBottom: '12px',
                              padding: '8px 0'
                            }}>
                              <span style={{ color: '#94a3b8' }}>{label}:</span>
                              <span style={{ fontWeight: '600', color: '#e2e8f0' }}>{value}</span>
                            </div>
                          ))}
                          <hr style={{ 
                            margin: '16px 0', 
                            border: 'none', 
                            borderTop: '1px solid rgba(6, 182, 212, 0.2)' 
                          }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#e2e8f0', fontWeight: '700', fontSize: '18px' }}>Total:</span>
                            <span style={{ 
                              fontWeight: '700', 
                              color: '#06b6d4', 
                              fontSize: '20px',
                              textShadow: '0 0 15px rgba(6, 182, 212, 0.3)'
                            }}>
                              {formatCurrency(parseFloat(tradeAmount || 0))}
                            </span>
                          </div>
                        </div>
                      )}


                      {/* Warning for BTC sell from cold storage */}
                      {tradeSide === 'SELL' && selectedAsset === 'BTC' && portfolio.btcHoldingsHot < estimatedAssetAmount && portfolio.btcHoldingsCold > 0 && (
                        <div style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '2px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '16px',
                          padding: '20px',
                          marginBottom: '32px',
                          animation: 'slideIn 0.3s ease-out'
                        }}>
                          <div style={{ 
                            color: '#f87171', 
                            fontWeight: '700', 
                            marginBottom: '8px',
                            fontSize: '16px'
                          }}>⚠️ Insufficient Hot Wallet Balance</div>
                          <div style={{ color: '#fca5a5', fontSize: '14px', lineHeight: '1.5' }}>
                            You have {portfolio.btcHoldingsCold.toFixed(6)} BTC in cold storage. 
                            Transfer to hot wallet first via multisig process.
                          </div>
                        </div>
                      )}


                      {/* Enhanced Execute Button */}
                      <button
                        onClick={() => executeTrade(tradeSide, parseFloat(tradeAmount), selectedAsset)}
                        disabled={!tradeAmount || !currentPrice || loading}
                        style={{
                          width: '100%',
                          padding: '24px',
                          background: !tradeAmount || !currentPrice || loading
                            ? 'rgba(94, 108, 132, 0.3)'
                            : tradeSide === 'BUY' 
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          border: 'none',
                          borderRadius: '16px',
                          color: 'white',
                          fontSize: '20px',
                          fontWeight: '700',
                          cursor: !tradeAmount || !currentPrice || loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: !tradeAmount || !currentPrice || loading 
                            ? 'none'
                            : tradeSide === 'BUY'
                              ? '0 8px 25px rgba(16, 185, 129, 0.3)'
                              : '0 8px 25px rgba(239, 68, 68, 0.3)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                          if (!(!tradeAmount || !currentPrice || loading)) {
                            e.target.style.transform = 'translateY(-2px)'
                            e.target.style.boxShadow = tradeSide === 'BUY'
                              ? '0 12px 35px rgba(16, 185, 129, 0.4)'
                              : '0 12px 35px rgba(239, 68, 68, 0.4)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!(!tradeAmount || !currentPrice || loading)) {
                            e.target.style.transform = 'translateY(0)'
                            e.target.style.boxShadow = tradeSide === 'BUY'
                              ? '0 8px 25px rgba(16, 185, 129, 0.3)'
                              : '0 8px 25px rgba(239, 68, 68, 0.3)'
                          }
                        }}
                      >
                        {loading ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              border: '2px solid rgba(255, 255, 255, 0.3)',
                              borderTop: '2px solid white',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }} />
                            Loading...
                          </div>
                        ) : (
                          `${tradeSide} ${selectedAsset}`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Enhanced Custody Tab */}
          {activeTab === 'custody' && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '40px',
              animation: 'slideUp 0.6s ease-out'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.05) 100%)',
                borderRadius: '28px',
                padding: '60px',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(20px)'
              }}>
                <h1 style={{ 
                  fontSize: '42px', 
                  fontWeight: '800', 
                  color: '#e2e8f0', 
                  marginBottom: '16px',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #e2e8f0 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Bitcoin Custody Management
                </h1>
                <p style={{ 
                  color: '#94a3b8', 
                  marginBottom: '50px', 
                  fontSize: '18px',
                  textAlign: 'center',
                  maxWidth: '600px',
                  margin: '0 auto 50px auto'
                }}>
                  Military-grade security with multi-signature protection and institutional insurance
                </p>


                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                  gap: '40px' 
                }}>
                  {/* Enhanced Hot Wallet */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(251, 113, 133, 0.1) 100%)',
                    borderRadius: '24px',
                    padding: '40px',
                    border: '1px solid rgba(251, 146, 60, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'linear-gradient(45deg, transparent, rgba(251, 146, 60, 0.1), transparent)',
                      animation: 'shine 6s ease-in-out infinite'
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '32px' 
                      }}>
                        <h3 style={{ color: '#e2e8f0', fontSize: '24px', margin: 0, fontWeight: '700' }}>
                          🔥 Hot Wallet
                        </h3>
                        <div style={{
                          background: 'rgba(251, 146, 60, 0.3)',
                          color: '#f59e0b',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          ACTIVE
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ 
                          fontSize: '36px', 
                          fontWeight: 'bold', 
                          color: '#f59e0b', 
                          marginBottom: '8px',
                          textShadow: '0 0 30px rgba(251, 146, 60, 0.4)'
                        }}>
                          {portfolio.btcHoldingsHot.toFixed(6)} BTC
                        </div>
                        <div style={{ fontSize: '18px', color: '#94a3b8', fontWeight: '600' }}>
                          {formatCurrency(portfolio.btcHoldingsHot * (marketData?.usd || 0))}
                        </div>
                      </div>


                      <div style={{ 
                        background: 'rgba(255, 255, 255, 0.08)', 
                        borderRadius: '16px', 
                        padding: '24px',
                        border: '1px solid rgba(251, 146, 60, 0.2)'
                      }}>
                        <div style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '16px', fontWeight: '600' }}>
                          Security Features:
                        </div>
                        <ul style={{ 
                          margin: 0, 
                          paddingLeft: '20px', 
                          color: '#94a3b8', 
                          fontSize: '14px',
                          lineHeight: '1.8'
                        }}>
                          <li>2FA Authentication</li>
                          <li>API Rate Limiting</li>
                          <li>Real-time Monitoring</li>
                          <li>Instant Trading Access</li>
                        </ul>
                      </div>
                    </div>
                  </div>


                  {/* Enhanced Cold Storage */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.1) 100%)',
                    borderRadius: '24px',
                    padding: '40px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      right: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'linear-gradient(-45deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
                      animation: 'shine 8s ease-in-out infinite reverse'
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '32px' 
                      }}>
                        <h3 style={{ color: '#e2e8f0', fontSize: '24px', margin: 0, fontWeight: '700' }}>
                          ❄️ Cold Storage
                        </h3>
                        <div style={{
                          background: 'rgba(59, 130, 246, 0.3)',
                          color: '#3b82f6',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          SECURED
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ 
                          fontSize: '36px', 
                          fontWeight: 'bold', 
                          color: '#3b82f6', 
                          marginBottom: '8px',
                          textShadow: '0 0 30px rgba(59, 130, 246, 0.4)'
                        }}>
                          {coldStorage.totalBTC.toFixed(6)} BTC
                        </div>
                        <div style={{ fontSize: '18px', color: '#94a3b8', fontWeight: '600' }}>
                          {formatCurrency(coldStorage.totalBTC * (marketData?.usd || 0))}
                        </div>
                      </div>


                      <div style={{ 
                        background: 'rgba(255, 255, 255, 0.08)', 
                        borderRadius: '16px', 
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                        <div style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '12px', fontWeight: '600' }}>
                          Multisig Configuration:
                        </div>
                        <div style={{ 
                          color: '#3b82f6', 
                          fontWeight: '700', 
                          marginBottom: '16px',
                          fontSize: '18px'
                        }}>
                          {coldStorage.multisigConfig.requiredSignatures} of {coldStorage.multisigConfig.totalSigners} signatures required
                        </div>
                        <ul style={{ 
                          margin: 0, 
                          paddingLeft: '20px', 
                          color: '#94a3b8', 
                          fontSize: '14px',
                          lineHeight: '1.8'
                        }}>
                          <li>Hardware Security Modules</li>
                          <li>Offline Key Generation</li>
                          <li>Geographic Distribution</li>
                          <li>Insurance Coverage</li>
                        </ul>
                      </div>


                      {/* Enhanced Transfer Interface */}
                      {coldStorage.totalBTC > 0 && (
                        <div style={{ 
                          background: 'rgba(255, 255, 255, 0.08)', 
                          borderRadius: '16px', 
                          padding: '24px',
                          border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                          <div style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '16px', fontWeight: '600' }}>
                            Transfer to Hot Wallet:
                          </div>
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <input
                              type="number"
                              value={transferAmount}
                              onChange={(e) => setTransferAmount(e.target.value)}
                              placeholder="BTC amount"
                              max={coldStorage.totalBTC}
                              step="0.000001"
                              style={{
                                flex: 1,
                                padding: '16px',
                                border: '2px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '12px',
                                fontSize: '16px',
                                background: 'rgba(59, 130, 246, 0.05)',
                                color: '#e2e8f0',
                                fontWeight: '600'
                              }}
                            />
                            <button
                              onClick={() => setTransferAmount(coldStorage.totalBTC.toString())}
                              style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                padding: '16px 20px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              MAX
                            </button>
                          </div>
                          <button
                            onClick={() => startMultisigTransfer(parseFloat(transferAmount))}
                            disabled={!transferAmount || parseFloat(transferAmount) > coldStorage.totalBTC}
                            style={{
                              width: '100%',
                              padding: '16px',
                              background: !transferAmount || parseFloat(transferAmount) > coldStorage.totalBTC 
                                ? 'rgba(59, 130, 246, 0.3)' 
                                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              border: 'none',
                              borderRadius: '12px',
                              color: 'white',
                              fontSize: '16px',
                              cursor: !transferAmount || parseFloat(transferAmount) > coldStorage.totalBTC ? 'not-allowed' : 'pointer',
                              fontWeight: '700',
                              transition: 'all 0.3s ease',
                              boxShadow: !transferAmount || parseFloat(transferAmount) > coldStorage.totalBTC 
                                ? 'none' 
                                : '0 4px 15px rgba(59, 130, 246, 0.3)'
                            }}
                          >
                            Start Multisig Transfer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Enhanced Reporting Tab - NEW COMPREHENSIVE SECTION */}
          {activeTab === 'reporting' && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '40px',
              animation: 'slideUp 0.6s ease-out'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.05) 100%)',
                borderRadius: '28px',
                padding: '60px',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(20px)'
              }}>
                <h1 style={{ 
                  fontSize: '42px', 
                  fontWeight: '800', 
                  color: '#e2e8f0', 
                  marginBottom: '16px',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #e2e8f0 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Treasury Reports & Analytics
                </h1>
                <p style={{ 
                  color: '#94a3b8', 
                  marginBottom: '50px', 
                  fontSize: '18px',
                  textAlign: 'center',
                  maxWidth: '600px',
                  margin: '0 auto 50px auto'
                }}>
                  Comprehensive reporting suite for institutional compliance and performance analysis
                </p>


                {/* Report Controls */}
                <div style={{
                  background: 'rgba(6, 182, 212, 0.05)',
                  borderRadius: '24px',
                  padding: '40px',
                  border: '1px solid rgba(6, 182, 212, 0.1)',
                  marginBottom: '40px'
                }}>
                  <h3 style={{ color: '#e2e8f0', marginBottom: '24px', fontSize: '24px', fontWeight: '700' }}>
                    Generate Reports
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    {/* Period Selection */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontWeight: '600', marginBottom: '12px' }}>
                        Time Period
                      </label>
                      <select
                        value={reportFilters.period}
                        onChange={(e) => setReportFilters({...reportFilters, period: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '16px',
                          border: '2px solid rgba(6, 182, 212, 0.2)',
                          borderRadius: '12px',
                          background: 'rgba(6, 182, 212, 0.05)',
                          color: '#e2e8f0',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}
                      >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="1y">Last Year</option>
                        <option value="all">All Time</option>
                      </select>
                    </div>


                    {/* Report Type */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontWeight: '600', marginBottom: '12px' }}>
                        Report Type
                      </label>
                      <select
                        value={reportFilters.type}
                        onChange={(e) => setReportFilters({...reportFilters, type: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '16px',
                          border: '2px solid rgba(6, 182, 212, 0.2)',
                          borderRadius: '12px',
                          background: 'rgba(6, 182, 212, 0.05)',
                          color: '#e2e8f0',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}
                      >
                        <option value="performance">Performance Report</option>
                        <option value="compliance">Compliance Report</option>
                        <option value="risk">Risk Analysis</option>
                        <option value="trades">Trade History</option>
                        <option value="custody">Custody Report</option>
                        <option value="executive">Executive Summary</option>
                      </select>
                    </div>


                    {/* Format Selection */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontWeight: '600', marginBottom: '12px' }}>
                        Export Format
                      </label>
                      <select
                        value={reportFilters.format}
                        onChange={(e) => setReportFilters({...reportFilters, format: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '16px',
                          border: '2px solid rgba(6, 182, 212, 0.2)',
                          borderRadius: '12px',
                          background: 'rgba(6, 182, 212, 0.05)',
                          color: '#e2e8f0',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}
                      >
                        <option value="pdf">PDF Report</option>
                        <option value="csv">CSV Data</option>
                        <option value="xlsx">Excel Spreadsheet</option>
                        <option value="json">JSON Data</option>
                      </select>
                    </div>
                  </div>


                  {/* Generate Button */}
                  <button
                    onClick={() => generateReport(reportFilters.type, reportFilters.format)}
                    style={{
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                      border: 'none',
                      borderRadius: '16px',
                      color: 'white',
                      padding: '20px 40px',
                      fontSize: '18px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 25px rgba(6, 182, 212, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 12px 35px rgba(6, 182, 212, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 8px 25px rgba(6, 182, 212, 0.3)'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>📊</span>
                    Generate {reportFilters.type.charAt(0).toUpperCase() + reportFilters.type.slice(1)} Report
                  </button>
                </div>


                {/* Quick Stats Dashboard */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '24px',
                  marginBottom: '40px'
                }}>
                  {[
                    { 
                      title: 'Total Trades',
                      value: portfolio.trades.length.toString(),
                      icon: '📈',
                      color: '#06b6d4'
                    },
                    {
                      title: 'Portfolio Value',
                      value: formatCurrency(portfolio.totalValue),
                      icon: '💎',
                      color: '#10b981'
                    },
                    {
                      title: 'P&L Performance',
                      value: `${portfolio.unrealizedPL >= 0 ? '+' : ''}${((portfolio.unrealizedPL / (portfolio.costBasis || 1)) * 100).toFixed(1)}%`,
                      icon: portfolio.unrealizedPL >= 0 ? '📈' : '📉',
                      color: portfolio.unrealizedPL >= 0 ? '#10b981' : '#ef4444'
                    },
                    {
                      title: 'Cold Storage',
                      value: `${((coldStorage.totalBTC / (portfolio.btcHoldings || 0.000001)) * 100).toFixed(1)}%`,
                      icon: '❄️',
                      color: '#3b82f6'
                    }
                  ].map((stat, index) => (
                    <div key={index} style={{
                      background: `linear-gradient(135deg, rgba(${stat.color === '#06b6d4' ? '6, 182, 212' : stat.color === '#10b981' ? '16, 185, 129' : stat.color === '#ef4444' ? '239, 68, 68' : '59, 130, 246'}, 0.1) 0%, rgba(${stat.color === '#06b6d4' ? '6, 182, 212' : stat.color === '#10b981' ? '16, 185, 129' : stat.color === '#ef4444' ? '239, 68, 68' : '59, 130, 246'}, 0.05) 100%)`,
                      borderRadius: '20px',
                      padding: '32px',
                      border: `1px solid rgba(${stat.color === '#06b6d4' ? '6, 182, 212' : stat.color === '#10b981' ? '16, 185, 129' : stat.color === '#ef4444' ? '239, 68, 68' : '59, 130, 246'}, 0.2)`,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '16px' }}>{stat.icon}</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color, marginBottom: '8px' }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: '16px', color: '#94a3b8', fontWeight: '600' }}>
                        {stat.title}
                      </div>
                    </div>
                  ))}
                </div>


                {/* Recent Reports */}
                <div style={{
                  background: 'rgba(6, 182, 212, 0.05)',
                  borderRadius: '24px',
                  padding: '40px',
                  border: '1px solid rgba(6, 182, 212, 0.1)'
                }}>
                  <h3 style={{ color: '#e2e8f0', marginBottom: '24px', fontSize: '24px', fontWeight: '700' }}>
                    Available Report Templates
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {[
                      {
                        title: 'Monthly Treasury Report',
                        description: 'Comprehensive monthly performance and allocation analysis',
                        icon: '📋',
                        type: 'performance'
                      },
                      {
                        title: 'Compliance Audit Trail',
                        description: 'Complete transaction history with regulatory compliance data',
                        icon: '🔍',
                        type: 'compliance'
                      },
                      {
                        title: 'Risk Assessment',
                        description: 'Portfolio risk metrics, VaR analysis, and stress testing',
                        icon: '⚠️',
                        type: 'risk'
                      },
                      {
                        title: 'Executive Dashboard',
                        description: 'High-level summary for board presentations and stakeholders',
                        icon: '👔',
                        type: 'executive'
                      }
                    ].map((template, index) => (
                      <div key={index} style={{
                        background: 'rgba(6, 182, 212, 0.08)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(6, 182, 212, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.2)'
                      }}
                      onClick={() => generateReport(template.type, 'pdf')}
                      >
                        <div style={{ fontSize: '32px', marginBottom: '16px', textAlign: 'center' }}>
                          {template.icon}
                        </div>
                        <h4 style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
                          {template.title}
                        </h4>
                        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', marginBottom: '16px' }}>
                          {template.description}
                        </p>
                        <div style={{
                          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          textAlign: 'center',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Generate Report
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Other Enhanced Tabs */}
          {activeTab === 'company' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.05) 100%)',
              borderRadius: '28px',
              padding: '60px',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              backdropFilter: 'blur(20px)',
              animation: 'slideUp 0.6s ease-out'
            }}>
              <h1 style={{ 
                fontSize: '42px', 
                fontWeight: '800', 
                color: '#e2e8f0', 
                marginBottom: '32px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #e2e8f0 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Company Profile
              </h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                <div style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  borderRadius: '20px',
                  padding: '40px',
                  border: '1px solid rgba(6, 182, 212, 0.2)'
                }}>
                  <h3 style={{ color: '#e2e8f0', marginBottom: '24px', fontSize: '22px', fontWeight: '700' }}>
                    Company Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      ['Company Name', 'Treasury Corp'],
                      ['Founded', '2020'],
                      ['Industry', 'Financial Technology'],
                      ['Headquarters', 'San Francisco, CA'],
                      ['Treasury Lead', 'John Smith'],
                      ['Regulatory Status', 'FINRA Registered'],
                      ['Insurance Coverage', '$500M AIG Policy']
                    ].map(([label, value], index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        border: '1px solid rgba(6, 182, 212, 0.1)'
                      }}>
                        <span style={{ color: '#94a3b8', fontWeight: '600' }}>{label}:</span>
                        <span style={{ color: '#e2e8f0', fontWeight: '700' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>


                <div style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  borderRadius: '20px',
                  padding: '40px',
                  border: '1px solid rgba(6, 182, 212, 0.2)'
                }}>
                  <h3 style={{ color: '#e2e8f0', marginBottom: '24px', fontSize: '22px', fontWeight: '700' }}>
                    Bitcoin Treasury Policy
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      ['Target Allocation', '5-15% of cash reserves'],
                      ['Rebalancing', 'Monthly review'],
                      ['Custody', 'Multi-signature cold storage'],
                      ['Risk Management', 'Dollar-cost averaging strategy'],
                      ['Compliance', 'GAAP/IFRS compliant'],
                      ['Audit Frequency', 'Quarterly external audits'],
                      ['Insurance', 'Cold storage fully insured']
                    ].map(([label, value], index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        border: '1px solid rgba(6, 182, 212, 0.1)'
                      }}>
                        <span style={{ color: '#94a3b8', fontWeight: '600' }}>{label}:</span>
                        <span style={{ color: '#e2e8f0', fontWeight: '700' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'privacy' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.05) 100%)',
              borderRadius: '28px',
              padding: '60px',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              backdropFilter: 'blur(20px)',
              maxHeight: '80vh',
              overflow: 'auto',
              animation: 'slideUp 0.6s ease-out'
            }}>
              <h1 style={{ 
                fontSize: '42px', 
                fontWeight: '800', 
                color: '#e2e8f0', 
                marginBottom: '32px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #e2e8f0 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Privacy Policy
              </h1>
              
              <div style={{ color: '#94a3b8', lineHeight: '1.8', fontSize: '16px' }}>
                <div style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                  border: '1px solid rgba(6, 182, 212, 0.2)'
                }}>
                  <h3 style={{ color: '#e2e8f0', marginBottom: '16px', fontSize: '20px', fontWeight: '700' }}>
                    1. Information We Collect
                  </h3>
                  <p>We collect information necessary to provide our Bitcoin treasury management services, including account information, transaction data, and usage analytics. All data is encrypted and stored securely.</p>
                </div>
                
                <div style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                  border: '1px solid rgba(6, 182, 212, 0.2)'
                }}>
                  <h3 style={{ color: '#e2e8f0', marginBottom: '16px', fontSize: '20px', fontWeight: '700' }}>
                    2. How We Use Information
                  </h3>
                  <p>Your information is used to provide secure treasury management services, ensure compliance with regulations, and improve our platform. We never sell or monetize your personal data.</p>
                </div>
                
                <div style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                  border: '1px solid rgba(6, 182, 212, 0.2)'
                }}>
                  <h3 style={{ color: '#e2e8f0', marginBottom: '16px', fontSize: '20px', fontWeight: '700' }}>
                    3. Data Security
                  </h3>
                  <p>We implement industry-leading security measures including encryption, multi-signature protocols, and secure storage to protect your data and assets. All systems are SOC 2 Type II compliant.</p>
                </div>
                
                <div style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                  border: '1px solid rgba(6, 182, 212, 0.2)'
                }}>
                  <h3 style={{ color: '#e2e8f0', marginBottom: '16px', fontSize: '20px', fontWeight: '700' }}>
                    4. Information Sharing
                  </h3>
                  <p>We do not sell or share your personal information with third parties except as required by law or to provide our services. All sharing is documented and audited.</p>
                </div>
                
                <div style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(6, 182, 212, 0.2)'
                }}>
                  <h3 style={{ color: '#e2e8f0', marginBottom: '16px', fontSize: '20px', fontWeight: '700' }}>
                    5. Contact Us
                  </h3>
                  <p>For privacy-related questions, contact us at privacy@foresightenterprise.com or call our compliance hotline at +1 (555) 123-4567.</p>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'terms' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.05) 100%)',
              borderRadius: '28px',
              padding: '60px',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              backdropFilter: 'blur(20px)',
              maxHeight: '80vh',
              overflow: 'auto',
              animation: 'slideUp 0.6s ease-out'
            }}>
              <h1 style={{ 
                fontSize: '42px', 
                fontWeight: '800', 
                color: '#e2e8f0', 
                marginBottom: '32px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #e2e8f0 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Terms & Conditions
              </h1>
              
              <div style={{ color: '#94a3b8', lineHeight: '1.8', fontSize: '16px' }}>
                <div style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px
