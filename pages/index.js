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
      const fileName = `foresight-${type}-report-${new Date().toISOString().split('T')[0]}.pdf`
      alert(`Generating ${fileName}...\n\nThis would download a professional PDF report in a real implementation.`)
    } else if (format === 'csv') {
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

      <div style={{ position: 'relative', zIndex: 2 }}>
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
        <main style={{ 
          padding: '40px', 
          maxWidth: '1600px', 
          margin: '0 auto',
          minHeight: 'calc(100vh - 100px)'
        }}>
          {activeTab === 'dashboard' && (
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
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306B6D4' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  animation: 'backgroundMove 20s linear infinite'
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h1 style={{ 
                    fontSize: '42px', 
                    fontWeight: '800', 
                    color: '#e2e8f0', 
                    marginBottom: '12px',
                    textAlign: 'center',
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
                    lineHeight: '1.6',
                    textAlign: 'center',
                    maxWidth: '600px',
                    margin: '0 auto 40px auto'
                  }}>
                    Real-time portfolio overview and institutional-grade Bitcoin treasury management
                  </p>

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
                      <div style={{ fontSize: '15px', color: '#94a3b8' }}>
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
                      <div style={{ fontSize: '15px', color: '#94a3b8' }}>
                        Cost Basis: {formatCurrency(portfolio.costBasis)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
                backdropFilter: 'blur(20px)'
              }}>
                <h2 style={{ 
                  color: '#e2e8f0', 
                  marginBottom: '40px', 
                  fontSize: '32px', 
                  fontWeight: '700',
                  textAlign: 'center'
                }}>
                  Execute Trade
                </h2>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                  gap: '40px' 
                }}>
                  <div style={{
                    background: 'rgba(6, 182, 212, 0.08)',
                    borderRadius: '24px',
                    padding: '40px',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <h3 style={{ color: '#e2e8f0', marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
                      Asset Selection
                    </h3>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ 
                        display: 'block', 
                        color: '#94a3b8', 
                        marginBottom: '8px', 
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        Select Asset
                      </label>
                      <select 
                        value={tradeForm.asset} 
                        onChange={(e) => setTradeForm({...tradeForm, asset: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '16px',
                          borderRadius: '12px',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          background: 'rgba(6, 182, 212, 0.05)',
                          color: '#e2e8f0',
                          fontSize: '16px',
                          outline: 'none',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="MSTR">MicroStrategy (MSTR)</option>
                        <option value="STRC">Strike (STRC)</option>
                        <option value="STRK">Strike (STRK)</option>
                        <option value="STRF">Strike (STRF)</option>
                        <option value="STRD">Strike (STRD)</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ 
                        display: 'block', 
                        color: '#94a3b8', 
                        marginBottom: '8px', 
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        Trade Type
                      </label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => setTradeForm({...tradeForm, side: 'BUY'})}
                          style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: '12px',
                            border: 'none',
                            background: tradeForm.side === 'BUY' 
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                              : 'rgba(16, 185, 129, 0.1)',
                            color: tradeForm.side === 'BUY' ? '#ffffff' : '#10b981',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: tradeForm.side === 'BUY' ? '0 8px 25px rgba(16, 185, 129, 0.3)' : 'none'
                          }}
                        >
                          BUY
                        </button>
                        <button
                          onClick={() => setTradeForm({...tradeForm, side: 'SELL'})}
                          style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: '12px',
                            border: 'none',
                            background: tradeForm.side === 'SELL' 
                              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                              : 'rgba(239, 68, 68, 0.1)',
                            color: tradeForm.side === 'SELL' ? '#ffffff' : '#ef4444',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: tradeForm.side === 'SELL' ? '0 8px 25px rgba(239, 68, 68, 0.3)' : 'none'
                          }}
                        >
                          SELL
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ 
                        display: 'block', 
                        color: '#94a3b8', 
                        marginBottom: '8px', 
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        Amount ({tradeForm.asset === 'BTC' ? 'USD' : 'Shares'})
                      </label>
                      <input
                        type="number"
                        value={tradeForm.amount}
                        onChange={(e) => setTradeForm({...tradeForm, amount: parseFloat(e.target.value) || 0})}
                        placeholder={tradeForm.asset === 'BTC' ? '1000' : '100'}
                        style={{
                          width: '100%',
                          padding: '16px',
                          borderRadius: '12px',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          background: 'rgba(6, 182, 212, 0.05)',
                          color: '#e2e8f0',
                          fontSize: '16px',
                          outline: 'none',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>

                    <button
                      onClick={handleTradePreview}
                      style={{
                        width: '100%',
                        padding: '18px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                        color: '#ffffff',
                        fontSize: '18px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 25px rgba(6, 182, 212, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 12px 35px rgba(6, 182, 212, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(6, 182, 212, 0.3)'
                      }}
                    >
                      Preview Trade
                    </button>
                  </div>

                  {tradePreview && (
                    <div style={{
                      background: 'rgba(6, 182, 212, 0.08)',
                      borderRadius: '24px',
                      padding: '40px',
                      border: '1px solid rgba(6, 182, 212, 0.15)',
                      backdropFilter: 'blur(10px)',
                      animation: 'slideIn 0.5s ease-out'
                    }}>
                      <h3 style={{ color: '#e2e8f0', marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
                        Trade Preview
                      </h3>
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid rgba(6, 182, 212, 0.1)'
                        }}>
                          <span style={{ color: '#94a3b8' }}>Asset:</span>
                          <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{tradePreview.asset}</span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid rgba(6, 182, 212, 0.1)'
                        }}>
                          <span style={{ color: '#94a3b8' }}>Side:</span>
                          <span style={{ 
                            color: tradePreview.side === 'BUY' ? '#10b981' : '#ef4444',
                            fontWeight: '600'
                          }}>
                            {tradePreview.side}
                          </span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid rgba(6, 182, 212, 0.1)'
                        }}>
                          <span style={{ color: '#94a3b8' }}>Amount:</span>
                          <span style={{ color: '#e2e8f0', fontWeight: '600' }}>
                            {tradePreview.asset === 'BTC' ? formatCurrency(tradePreview.amount) : tradePreview.amount.toFixed(2) + ' shares'}
                          </span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid rgba(6, 182, 212, 0.1)'
                        }}>
                          <span style={{ color: '#94a3b8' }}>Price:</span>
                          <span style={{ color: '#e2e8f0', fontWeight: '600' }}>
                            {formatCurrency(tradePreview.price)}
                          </span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid rgba(6, 182, 212, 0.1)'
                        }}>
                          <span style={{ color: '#94a3b8' }}>Fees:</span>
                          <span style={{ color: '#e2e8f0', fontWeight: '600' }}>
                            {formatCurrency(tradePreview.fees)}
                          </span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '24px',
                          padding: '16px',
                          background: 'rgba(6, 182, 212, 0.1)',
                          borderRadius: '12px',
                          border: '1px solid rgba(6, 182, 212, 0.2)'
                        }}>
                          <span style={{ color: '#94a3b8', fontSize: '16px', fontWeight: '600' }}>Total:</span>
                          <span style={{ 
                            color: '#06b6d4', 
                            fontSize: '18px', 
                            fontWeight: '700',
                            textShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
                          }}>
                            {formatCurrency(tradePreview.totalUSD)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleExecuteTrade}
                        style={{
                          width: '100%',
                          padding: '18px',
                          borderRadius: '12px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          fontSize: '18px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        Execute Trade
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
                <h2 style={{ 
                  color: '#e2e8f0', 
                  marginBottom: '40px', 
                  fontSize: '32px', 
                  fontWeight: '700',
                  textAlign: 'center'
                }}>
                  Custody Management
                </h2>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                  gap: '40px' 
                }}>
                  <div style={{
                    background: 'rgba(251, 146, 60, 0.08)',
                    borderRadius: '24px',
                    padding: '40px',
                    border: '1px solid rgba(251, 146, 60, 0.15)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <h3 style={{ color: '#e2e8f0', marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
                      🔥 Hot Wallet
                    </h3>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
                        {formatBTC(portfolio.btcHoldingsHot)}
                      </div>
                      <div style={{ fontSize: '16px', color: '#94a3b8' }}>
                        Available for immediate trading
                      </div>
                    </div>
                    <div style={{ 
                      padding: '16px', 
                      background: 'rgba(251, 146, 60, 0.1)', 
                      borderRadius: '12px',
                      border: '1px solid rgba(251, 146, 60, 0.2)'
                    }}>
                      <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
                        Security Level: Hot Storage
                      </div>
                      <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                        Insurance: $10M coverage
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(34, 197, 94, 0.08)',
                    borderRadius: '24px',
                    padding: '40px',
                    border: '1px solid rgba(34, 197, 94, 0.15)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <h3 style={{ color: '#e2e8f0', marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
                      ❄️ Cold Storage
                    </h3>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
                        {formatBTC(portfolio.btcHoldingsCold)}
                      </div>
                      <div style={{ fontSize: '16px', color: '#94a3b8' }}>
                        Multi-signature protected
                      </div>
                    </div>
                    <div style={{ 
                      padding: '16px', 
                      background: 'rgba(34, 197, 94, 0.1)', 
                      borderRadius: '12px',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
                        Security Level: Cold Storage
                      </div>
                      <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                        Insurance: $50M coverage
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  marginTop: '40px',
                  background: 'rgba(6, 182, 212, 0.08)',
                  borderRadius: '24px',
                  padding: '40px',
                  border: '1px solid rgba(6, 182, 212, 0.15)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h3 style={{ color: '#e2e8f0', marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
                    Multi-Signature Configuration
                  </h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '24px' 
                  }}>
                    <div style={{
                      padding: '20px',
                      background: 'rgba(6, 182, 212, 0.1)',
                      borderRadius: '16px',
                      border: '1px solid rgba(6, 182, 212, 0.2)'
                    }}>
                      <div style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '12px', fontWeight: '600' }}>
                        Required Signers
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4' }}>
                        {multisigConfig.requiredSigners} of {multisigConfig.totalSigners}
                      </div>
                    </div>
                    <div style={{
                      padding: '20px',
                      background: 'rgba(6, 182, 212, 0.1)',
                      borderRadius: '16px',
                      border: '1px solid rgba(6, 182, 212, 0.2)'
                    }}>
                      <div style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '12px', fontWeight: '600' }}>
                        Security Level
                      </div>
                      <div style={{ fontSize: '16px', color: '#06b6d4', fontWeight: '600' }}>
                        Enterprise Grade
                      </div>
                    </div>
                    <div style={{
                      padding: '20px',
                      background: 'rgba(6, 182, 212, 0.1)',
                      borderRadius: '16px',
                      border: '1px solid rgba(6, 182, 212, 0.2)'
                    }}>
                      <div style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '12px', fontWeight: '600' }}>
                        Insurance Coverage
                      </div>
                      <div style={{ fontSize: '16px', color: '#06b6d4', fontWeight: '600' }}>
                        $50M
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                <h2 style={{ 
                  color: '#e2e8f0', 
                  marginBottom: '40px', 
                  fontSize: '32px', 
                  fontWeight: '700',
                  textAlign: 'center'
                }}>
                  Reporting & Analytics
                </h2>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                  gap: '32px',
                  marginBottom: '40px'
                }}>
                  <div style={{
                    background: 'rgba(6, 182, 212, 0.08)',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                      Time Period
                    </div>
                    <select 
                      value={reportFilters.timePeriod} 
                      onChange={(e) => setReportFilters({...reportFilters, timePeriod: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        background: 'rgba(6, 182, 212, 0.05)',
                        color: '#e2e8f0',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    >
                      <option value="1M">Last Month</option>
                      <option value="3M">Last 3 Months</option>
                      <option value="6M">Last 6 Months</option>
                      <option value="1Y">Last Year</option>
                      <option value="ALL">All Time</option>
                    </select>
                  </div>

                  <div style={{
                    background: 'rgba(6, 182, 212, 0.08)',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                      Report Type
                    </div>
                    <select 
                      value={reportFilters.reportType} 
                      onChange={(e) => setReportFilters({...reportFilters, reportType: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        background: 'rgba(6, 182, 212, 0.05)',
                        color: '#e2e8f0',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    >
                      <option value="portfolio">Portfolio Summary</option>
                      <option value="trades">Trade History</option>
                      <option value="performance">Performance Analysis</option>
                      <option value="compliance">Compliance Report</option>
                    </select>
                  </div>

                  <div style={{
                    background: 'rgba(6, 182, 212, 0.08)',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                      Export Format
                    </div>
                    <select 
                      value={reportFilters.exportFormat} 
                      onChange={(e) => setReportFilters({...reportFilters, exportFormat: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        background: 'rgba(6, 182, 212, 0.05)',
                        color: '#e2e8f0',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    >
                      <option value="PDF">PDF</option>
                      <option value="CSV">CSV</option>
                      <option value="XLSX">Excel</option>
                      <option value="JSON">JSON</option>
                    </select>
                  </div>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '24px',
                  marginBottom: '40px'
                }}>
                  <div style={{
                    background: 'rgba(6, 182, 212, 0.08)',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '12px', fontWeight: '600' }}>
                      Total Trades
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4' }}>
                      {portfolio.trades.length}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(6, 182, 212, 0.08)',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '12px', fontWeight: '600' }}>
                      Portfolio Value
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4' }}>
                      {formatCurrency(portfolio.totalValue)}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(6, 182, 212, 0.08)',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '12px', fontWeight: '600' }}>
                      P&L Performance
                    </div>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: portfolio.unrealizedPL >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {portfolio.unrealizedPL >= 0 ? '+' : ''}{formatCurrency(portfolio.unrealizedPL)}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(6, 182, 212, 0.08)',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '12px', fontWeight: '600' }}>
                      Cold Storage
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                      {formatBTC(portfolio.btcHoldingsCold)}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  background: 'rgba(6, 182, 212, 0.05)',
                  borderRadius: '24px',
                  padding: '40px',
                  border: '1px solid rgba(6, 182, 212, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h3 style={{ color: '#e2e8f0', marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
                    Available Report Templates
                  </h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '20px' 
                  }}>
                    {[
                      { title: 'Monthly Treasury Report', desc: 'Comprehensive monthly overview with performance metrics', icon: '📊' },
                      { title: 'Compliance Audit Report', desc: 'Regulatory compliance and audit trail summary', icon: '🔒' },
                      { title: 'Risk Assessment Report', desc: 'Portfolio risk analysis and stress testing', icon: '⚠️' },
                      { title: 'Executive Summary Report', desc: 'Board-ready summary with key insights', icon: '📈' }
                    ].map((template, index) => (
                      <div key={index} style={{
                        padding: '20px',
                        background: 'rgba(6, 182, 212, 0.08)',
                        borderRadius: '16px',
                        border: '1px solid rgba(6, 182, 212, 0.15)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.background = 'rgba(6, 182, 212, 0.12)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.background = 'rgba(6, 182, 212, 0.08)'
                      }}
                      >
                        <div style={{ fontSize: '24px', marginBottom: '12px' }}>{template.icon}</div>
                        <div style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '8px', fontWeight: '600' }}>
                          {template.title}
                        </div>
                        <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.4' }}>
                          {template.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  <button
                    onClick={generateReport}
                    style={{
                      padding: '20px 40px',
                      borderRadius: '16px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 25px rgba(6, 182, 212, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 12px 35px rgba(6, 182, 212, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(6, 182, 212, 0.3)'
                    }}
                  >
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company' && <CompanyProfile />}
          {activeTab === 'privacy' && <PrivacyPolicy />}
          {activeTab === 'terms' && <TermsConditions />}
        </main>

        {/* BTC Custody Prompt Modal */}
        {showCustodyPrompt && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.95) 0%, rgba(8, 145, 178, 0.95) 100%)',
              borderRadius: '28px',
              padding: '60px',
              maxWidth: '500px',
              width: '90%',
              textAlign: 'center',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(20px)',
              animation: 'slideUp 0.4s ease-out'
            }}>
              <h3 style={{ 
                color: '#ffffff', 
                marginBottom: '24px', 
                fontSize: '24px', 
                fontWeight: '700' 
              }}>
                BTC Custody Decision
              </h3>
              <p style={{ 
                color: '#e2e8f0', 
                marginBottom: '40px', 
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                Your BTC purchase has been executed successfully! Where would you like to store your Bitcoin?
              </p>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button
                  onClick={() => handleCustodyDecision('hot')}
                  style={{
                    padding: '16px 32px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  🔥 Hot Wallet
                </button>
                <button
                  onClick={() => handleCustodyDecision('cold')}
                  style={{
                    padding: '16px 32px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  ❄️ Cold Storage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Multisig Transfer Modal */}
        {showMultisigModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(16, 185, 129, 0.95) 100%)',
              borderRadius: '28px',
              padding: '60px',
              maxWidth: '600px',
              width: '90%',
              textAlign: 'center',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(20px)',
              animation: 'slideUp 0.4s ease-out'
            }}>
              <h3 style={{ 
                color: '#ffffff', 
                marginBottom: '24px', 
                fontSize: '24px', 
                fontWeight: '700' 
              }}>
                Multi-Signature Security Check
              </h3>
              <p style={{ 
                color: '#e2e8f0', 
                marginBottom: '32px', 
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                Step {multisigConfig.currentStep} of {multisigConfig.totalSteps}: {multisigConfig.steps[multisigConfig.currentStep - 1]}
              </p>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '32px',
                marginBottom: '32px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ fontSize: '18px', color: '#ffffff', marginBottom: '16px', fontWeight: '600' }}>
                  Transfer Details
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '16px',
                  textAlign: 'left'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>Asset:</div>
                    <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: '600' }}>Bitcoin (BTC)</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>Amount:</div>
                    <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: '600' }}>
                      {formatBTC(pendingBtcTrade?.amount || 0)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>From:</div>
                    <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: '600' }}>Cold Storage</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>To:</div>
                    <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: '600' }}>Hot Wallet</div>
                  </div>
                </div>
              </div>

              <button
                onClick={processMultisigSignature}
                style={{
                  padding: '18px 36px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {multisigConfig.currentStep === multisigConfig.totalSteps ? 'Complete Transfer' : 'Next Security Check'}
              </button>
            </div>
          </div>
        )}

        {/* Portfolio Detail Modal */}
        {showPortfolioDetail && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.95) 0%, rgba(8, 145, 178, 0.95) 100%)',
              borderRadius: '28px',
              padding: '60px',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              boxShadow: 
