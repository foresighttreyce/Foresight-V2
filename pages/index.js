import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function ForesightEnterprise() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [marketData, setMarketData] = useState(null)
  const [stockData, setStockData] = useState({})
  const [loading, setLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showPortfolioDetail, setShowPortfolioDetail] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showCustodyPrompt, setShowCustodyPrompt] = useState(false)
  const [showMultisigModal, setShowMultisigModal] = useState(false)
  const [pendingBtcTrade, setPendingBtcTrade] = useState(null)
  const [multisigStep, setMultisigStep] = useState(0)
  const [selectedTrade, setSelectedTrade] = useState(null)
  
  // Enhanced portfolio state with hot/cold storage separation
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
      btcHoldingsHot: 0,      // BTC in hot wallet
      btcHoldingsCold: 0,     // BTC in cold storage
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

  // Save to localStorage whenever portfolio or cold storage changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('foresight-portfolio', JSON.stringify(portfolio))
      localStorage.setItem('foresight-cold-storage', JSON.stringify(coldStorage))
    }
  }, [portfolio, coldStorage])

  // Fetch market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true)
        
        // Fetch Bitcoin data
        const btcResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true')
        const btcData = await btcResponse.json()
        
        // Fetch stock data
        const stockSymbols = ['MSTR', 'STRE', 'STRK', 'STRF', 'STRD']
        const stockPromises = stockSymbols.map(async (symbol) => {
          // Using Alpha Vantage API (free tier) - you'd need to replace with your preferred stock API
          const mockPrice = Math.random() * 200 + 50 // Mock data for demo
          return {
            symbol,
            price: mockPrice,
            change24h: (Math.random() - 0.5) * 20
          }
        })
        
        const stocks = await Promise.all(stockPromises)
        const stockData = {}
        stocks.forEach(stock => {
          stockData[stock.symbol] = {
            usd: stock.price,
            usd_24h_change: stock.change24h
          }
        })
        
        setMarketData(btcData.bitcoin)
        setStockData(stockData)
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

  // Enhanced execute trade function with custody prompt for BTC
  const executeTrade = async (side, amount, asset = 'BTC') => {
    if (!marketData && asset === 'BTC') return
    
    const price = asset === 'BTC' ? marketData.usd : stockData[asset]?.usd
    if (!price) return

    const fee = amount * 0.005 // 0.5% fee
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
          btcHoldingsHot: portfolio.btcHoldingsHot + assetAmount, // Initially goes to hot wallet
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
            storage: 'hot' // Track storage location
          }]
        }

        // Show custody prompt for BTC purchases
        setPendingBtcTrade({
          amount: assetAmount,
          trade: newPortfolio.trades[newPortfolio.trades.length - 1]
        })
        setPortfolio(newPortfolio)
        setShowCustodyPrompt(true)
        
      } else {
        // Stock purchase
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

    } else { // SELL
      if (asset === 'BTC') {
        const availableBTC = portfolio.btcHoldingsHot // Can only sell from hot wallet
        const btcToSell = netAmount / price
        
        if (availableBTC < btcToSell) {
          // Check if user has BTC in cold storage
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
        // Stock sale
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

  // Handle custody decision for BTC
  const handleCustodyDecision = (moveToCold) => {
    if (!pendingBtcTrade) return

    if (moveToCold) {
      // Move BTC to cold storage
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
    // If no, BTC stays in hot wallet (default)
    
    setShowCustodyPrompt(false)
    setPendingBtcTrade(null)
  }

  // Start multisig process to move BTC from cold to hot
  const startMultisigTransfer = (amount) => {
    if (coldStorage.totalBTC < amount) {
      alert('Insufficient BTC in cold storage!')
      return
    }
    
    setSelectedTrade({ amount, type: 'cold-to-hot' })
    setMultisigStep(0)
    setShowMultisigModal(true)
    
    // Reset signer statuses
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

  // Process multisig signature
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
        // Transfer approved
        setTimeout(() => {
          completeMultisigTransfer()
        }, 1000)
      } else {
        setMultisigStep(multisigStep + 1)
      }
    }
  }

  // Complete the multisig transfer
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
    setMultisigStep(0)
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
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
  }  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #a7f3d0 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    }}>
      <Head>
        <title>Foresight Enterprise™ - Bitcoin Treasury Management</title>
        <meta name="description" content="Enterprise Bitcoin Treasury Management Platform" />
      </Head>

      {/* Animated Background */}
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
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306B6D4' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'float 20s ease-in-out infinite'
        }} />
        
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${100 + i * 50}px`,
            height: `${100 + i * 50}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(6, 182, 212, ${0.1 - i * 0.01}) 0%, transparent 70%)`,
            left: `${10 + i * 15}%`,
            top: `${20 + i * 10}%`,
            animation: `pulse ${3 + i}s ease-in-out infinite alternate`
          }} />
        ))}
      </div>

      {/* Main Container */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
          padding: '16px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '20px'
              }}>F</div>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                  Foresight Enterprise™
                </h1>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>by Foresight Capital</p>
              </div>
            </div>

            <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
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
                    background: activeTab === tab.id ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#64748b',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '16px'
                  }}
                >
                  <span style={{ marginRight: '8px' }}>
                    {activeTab === tab.id ? '●' : '○'}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                TC
              </button>

              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '60px',
                  right: 0,
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  padding: '16px',
                  minWidth: '200px',
                  zIndex: 20
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(6, 182, 212, 0.1)' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>Treasury Corp</div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>treasury@corp.com</div>
                  </div>
                  
                  <button
                    onClick={() => setActiveTab('company')}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                      color: '#374151'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(6, 182, 212, 0.1)'}
                    onMouseOut={(e) => e.target.style.background = 'none'}
                  >
                    Company Profile
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('privacy')}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                      color: '#374151'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(6, 182, 212, 0.1)'}
                    onMouseOut={(e) => e.target.style.background = 'none'}
                  >
                    Privacy Policy
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('terms')}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                      color: '#374151'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(6, 182, 212, 0.1)'}
                    onMouseOut={(e) => e.target.style.background = 'none'}
                  >
                    Terms & Conditions
                  </button>
                  
                  <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid rgba(6, 182, 212, 0.1)' }} />
                  
                  <button
                    onClick={resetDemo}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                      color: '#dc2626',
                      fontWeight: '600'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(220, 38, 38, 0.1)'}
                    onMouseOut={(e) => e.target.style.background = 'none'}
                  >
                    Reset Demo
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
          {activeTab === 'dashboard' && (
            <Dashboard 
              marketData={marketData}
              stockData={stockData}
              loading={loading}
              portfolio={portfolio}
              coldStorage={coldStorage}
              onPortfolioClick={() => setShowPortfolioDetail(true)}
              formatCurrency={formatCurrency}
            />
          )}

          {activeTab === 'trade' && (
            <TradingInterface
              marketData={marketData}
              stockData={stockData}
              loading={loading}
              portfolio={portfolio}
              executeTrade={executeTrade}
              formatCurrency={formatCurrency}
            />
          )}

          {activeTab === 'custody' && (
            <CustodyInterface
              portfolio={portfolio}
              coldStorage={coldStorage}
              marketData={marketData}
              onTransferRequest={startMultisigTransfer}
              formatCurrency={formatCurrency}
            />
          )}

          {activeTab === 'reporting' && <ReportingInterface portfolio={portfolio} formatCurrency={formatCurrency} />}
          {activeTab === 'company' && <CompanyProfile />}
          {activeTab === 'privacy' && <PrivacyPolicy />}
          {activeTab === 'terms' && <TermsConditions />}
        </main>
      </div>

      {/* BTC Custody Prompt Modal */}
      {showCustodyPrompt && pendingBtcTrade && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '48px',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '36px'
            }}>
              🔐
            </div>
            
            <h2 style={{ color: '#0f172a', marginBottom: '16px', fontSize: '24px' }}>
              Bitcoin Purchase Complete
            </h2>
            
            <p style={{ color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
              You've successfully purchased <strong>{pendingBtcTrade.amount.toFixed(6)} BTC</strong>.
              <br />Where would you like to store your Bitcoin?
            </p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => handleCustodyDecision(false)}
                style={{
                  padding: '16px 32px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '2px solid #06b6d4',
                  borderRadius: '12px',
                  color: '#06b6d4',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🔥 Hot Wallet
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                  Ready for trading
                </div>
              </button>
              
              <button
                onClick={() => handleCustodyDecision(true)}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                ❄️ Cold Storage
                <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                  Maximum security
                </div>
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
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '48px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ color: '#0f172a', marginBottom: '24px', textAlign: 'center' }}>
              Multisig Authorization Required
            </h2>
            
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <p style={{ color: '#64748b', marginBottom: '16px' }}>
                Transferring <strong>{selectedTrade?.amount.toFixed(6)} BTC</strong> from Cold Storage to Hot Wallet
              </p>
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                Requires {coldStorage.multisigConfig.requiredSignatures} of {coldStorage.multisigConfig.totalSigners} signatures
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              {coldStorage.multisigConfig.signers.map((signer, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: signer.status === 'signed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(6, 182, 212, 0.05)',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  border: signer.status === 'signed' ? '1px solid #22c55e' : '1px solid rgba(6, 182, 212, 0.2)'
                }}>
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>{signer.name}</span>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: signer.status === 'signed' ? '#22c55e' : '#f59e0b',
                    color: 'white'
                  }}>
                    {signer.status === 'signed' ? '✓ Signed' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              {coldStorage.multisigConfig.signers.filter(s => s.status === 'signed').length >= coldStorage.multisigConfig.requiredSignatures ? (
                <div>
                  <div style={{ color: '#22c55e', marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                    ✓ Transfer Approved!
                  </div>
                  <p style={{ color: '#64748b', fontSize: '14px' }}>
                    Bitcoin will be transferred to your hot wallet momentarily...
                  </p>
                </div>
              ) : (
                <button
                  onClick={processMultisigSignature}
                  disabled={!coldStorage.multisigConfig.signers.some(s => s.status === 'pending')}
                  style={{
                    padding: '16px 32px',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: coldStorage.multisigConfig.signers.some(s => s.status === 'pending') ? 'pointer' : 'not-allowed',
                    opacity: coldStorage.multisigConfig.signers.some(s => s.status === 'pending') ? 1 : 0.5,
                    fontSize: '16px'
                  }}
                >
                  Sign Authorization ({coldStorage.multisigConfig.signers.filter(s => s.status === 'signed').length}/{coldStorage.multisigConfig.requiredSignatures})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Detail Modal */}
      {showPortfolioDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '48px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ color: '#0f172a', margin: 0 }}>Portfolio Breakdown</h2>
              <button
                onClick={() => setShowPortfolioDetail(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}>
                <h3 style={{ color: '#0f172a', marginBottom: '16px' }}>Cash Holdings</h3>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4' }}>
                  {formatCurrency(portfolio.cashUSD)}
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(251, 113, 133, 0.1) 100%)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(251, 146, 60, 0.2)'
              }}>
                <h3 style={{ color: '#0f172a', marginBottom: '16px' }}>Bitcoin - Hot Wallet</h3>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {portfolio.btcHoldingsHot.toFixed(6)} BTC
                </div>
                <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  {formatCurrency(portfolio.btcHoldingsHot * (marketData?.usd || 0))}
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <h3 style={{ color: '#0f172a', marginBottom: '16px' }}>Bitcoin - Cold Storage</h3>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>
                  {portfolio.btcHoldingsCold.toFixed(6)} BTC
                </div>
                <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  {formatCurrency(portfolio.btcHoldingsCold * (marketData?.usd || 0))}
                </div>
              </div>

              {Object.entries(portfolio.stocks).map(([symbol, stock]) => (
                stock.shares > 0 && (
                  <div key={symbol} style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    <h3 style={{ color: '#0f172a', marginBottom: '16px' }}>{symbol} Stock</h3>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e' }}>
                      {stock.shares.toFixed(2)} shares
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                      {formatCurrency(stock.shares * (stockData[symbol]?.usd || 0))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.1); opacity: 0.3; }
        }
        
        .slide-up {
          animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}// Dashboard Component
function Dashboard({ marketData, stockData, loading, portfolio, coldStorage, onPortfolioClick, formatCurrency }) {
  const formatBTC = (amount) => amount.toFixed(6) + ' BTC'
  const allocationPercentage = portfolio.totalValue > 0 ? ((portfolio.btcHoldings * (marketData?.usd || 0)) / portfolio.totalValue * 100) : 0

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(6, 182, 212, 0.2)',
          borderTop: '4px solid #06b6d4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="slide-up">
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 250, 0.9) 100%)',
        borderRadius: '24px',
        padding: '48px',
        border: '1px solid rgba(6, 182, 212, 0.2)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px)'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
          Treasury Dashboard
        </h1>
        <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '18px' }}>
          Real-time portfolio overview and market data
        </p>

        {/* Market Data Bar */}
        {marketData && (
          <div style={{
            background: 'rgba(6, 182, 212, 0.05)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '32px',
            border: '1px solid rgba(6, 182, 212, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Bitcoin Price</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>
                  {formatCurrency(marketData.usd)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>24h Change</div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: marketData.usd_24h_change >= 0 ? '#22c55e' : '#ef4444'
                }}>
                  {marketData.usd_24h_change >= 0 ? '+' : ''}{marketData.usd_24h_change?.toFixed(2)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Market Cap</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
                  {formatCurrency(marketData.usd_market_cap)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>24h Volume</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
                  {formatCurrency(marketData.usd_24h_vol)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div 
            onClick={onPortfolioClick}
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#0f172a', fontSize: '18px', margin: 0 }}>Total Portfolio Value</h3>
              <div style={{ fontSize: '24px' }}>💎</div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#06b6d4', marginBottom: '8px' }}>
              {formatCurrency(portfolio.totalValue)}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Click for detailed breakdown
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(251, 113, 133, 0.1) 100%)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(251, 146, 60, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#0f172a', fontSize: '18px', margin: 0 }}>Bitcoin Holdings</h3>
              <div style={{ fontSize: '24px' }}>₿</div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
              {formatBTC(portfolio.btcHoldings)}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Hot: {formatBTC(portfolio.btcHoldingsHot)} | Cold: {formatBTC(portfolio.btcHoldingsCold)}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#0f172a', fontSize: '18px', margin: 0 }}>Unrealized P&L</h3>
              <div style={{ fontSize: '24px' }}>📈</div>
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: portfolio.unrealizedPL >= 0 ? '#22c55e' : '#ef4444',
              marginBottom: '8px'
            }}>
              {portfolio.unrealizedPL >= 0 ? '+' : ''}{formatCurrency(portfolio.unrealizedPL)}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Cost Basis: {formatCurrency(portfolio.costBasis)}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(147, 51, 234, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#0f172a', fontSize: '18px', margin: 0 }}>BTC Allocation</h3>
              <div style={{ fontSize: '24px' }}>📊</div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9333ea', marginBottom: '8px' }}>
              {allocationPercentage.toFixed(1)}%
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              of total portfolio value
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      {portfolio.trades.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          backdropFilter: 'blur(20px)'
        }}>
          <h2 style={{ color: '#0f172a', marginBottom: '24px' }}>Recent Trades</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflow: 'auto' }}>
            {portfolio.trades.slice(-5).reverse().map((trade, index) => (
              <div key={trade.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: 'rgba(6, 182, 212, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(6, 182, 212, 0.1)'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>
                    {trade.side} {trade.asset}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {new Date(trade.timestamp).toLocaleString()}
                    {trade.storage && ` • ${trade.storage} wallet`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600', color: trade.side === 'BUY' ? '#22c55e' : '#ef4444' }}>
                    {trade.side === 'BUY' ? '+' : '-'}{trade.asset === 'BTC' ? formatBTC(trade.amount) : `${trade.amount.toFixed(2)} shares`}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {formatCurrency(trade.totalUSD)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Trading Interface Component
function TradingInterface({ marketData, stockData, loading, portfolio, executeTrade, formatCurrency }) {
  const [selectedAsset, setSelectedAsset] = useState('BTC')
  const [tradeAmount, setTradeAmount] = useState('')
  const [tradeSide, setTradeSide] = useState('BUY')

  const currentPrice = selectedAsset === 'BTC' ? marketData?.usd : stockData[selectedAsset]?.usd
  const estimatedAssetAmount = tradeAmount && currentPrice ? parseFloat(tradeAmount) / currentPrice : 0

  const maxBuyAmount = portfolio.cashUSD
  const maxSellAmount = selectedAsset === 'BTC' 
    ? portfolio.btcHoldingsHot * (currentPrice || 0)
    : (portfolio.stocks[selectedAsset]?.shares || 0) * (currentPrice || 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="slide-up">
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 250, 0.9) 100%)',
        borderRadius: '24px',
        padding: '48px',
        border: '1px solid rgba(6, 182, 212, 0.2)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px)'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '32px' }}>
          Trading Interface
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
          {/* Asset Selection */}
          <div>
            <h3 style={{ color: '#0f172a', marginBottom: '16px' }}>Select Asset</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => setSelectedAsset('BTC')}
                style={{
                  padding: '16px',
                  background: selectedAsset === 'BTC' ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' : 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  borderRadius: '12px',
                  color: selectedAsset === 'BTC' ? 'white' : '#0f172a',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                ₿ Bitcoin (BTC) - {loading ? 'Loading...' : formatCurrency(marketData?.usd || 0)}
              </button>
              
              {['MSTR', 'STRE', 'STRK', 'STRF', 'STRD'].map(symbol => (
                <button
                  key={symbol}
                  onClick={() => setSelectedAsset(symbol)}
                  style={{
                    padding: '16px',
                    background: selectedAsset === symbol ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' : 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    borderRadius: '12px',
                    color: selectedAsset === symbol ? 'white' : '#0f172a',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  📈 {symbol} - {loading ? 'Loading...' : formatCurrency(stockData[symbol]?.usd || 0)}
                </button>
              ))}
            </div>
          </div>

          {/* Trade Form */}
          <div>
            <h3 style={{ color: '#0f172a', marginBottom: '16px' }}>Execute Trade</h3>
            
            {/* Buy/Sell Toggle */}
            <div style={{ display: 'flex', marginBottom: '24px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '12px', padding: '4px' }}>
              <button
                onClick={() => setTradeSide('BUY')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: tradeSide === 'BUY' ? '#22c55e' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: tradeSide === 'BUY' ? 'white' : '#64748b',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                BUY
              </button>
              <button
                onClick={() => setTradeSide('SELL')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: tradeSide === 'SELL' ? '#ef4444' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: tradeSide === 'SELL' ? 'white' : '#64748b',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                SELL
              </button>
            </div>

            {/* Amount Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#0f172a', fontWeight: '600', marginBottom: '8px' }}>
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
                    padding: '16px',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    background: 'white'
                  }}
                />
                <button
                  onClick={() => setTradeAmount((tradeSide === 'BUY' ? maxBuyAmount : maxSellAmount).toString())}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#06b6d4',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  MAX
                </button>
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                Max {tradeSide.toLowerCase()}: {formatCurrency(tradeSide === 'BUY' ? maxBuyAmount : maxSellAmount)}
              </div>
            </div>

            {/* Trade Preview */}
            {tradeAmount && currentPrice && (
              <div style={{
                background: 'rgba(6, 182, 212, 0.05)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                border: '1px solid rgba(6, 182, 212, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Estimated {selectedAsset}:</span>
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>
                    {selectedAsset === 'BTC' ? `${estimatedAssetAmount.toFixed(6)} BTC` : `${estimatedAssetAmount.toFixed(2)} shares`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Price:</span>
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>{formatCurrency(currentPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Fee (0.5%):</span>
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>{formatCurrency(parseFloat(tradeAmount || 0) * 0.005)}</span>
                </div>
                <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid rgba(6, 182, 212, 0.1)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>Total:</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{formatCurrency(parseFloat(tradeAmount || 0))}</span>
                </div>
              </div>
            )}

            {/* Warning for BTC sell from cold storage */}
            {tradeSide === 'SELL' && selectedAsset === 'BTC' && portfolio.btcHoldingsHot < estimatedAssetAmount && portfolio.btcHoldingsCold > 0 && (
              <div style={{
                background: 'rgba(251, 113, 133, 0.1)',
                border: '1px solid rgba(251, 113, 133, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ color: '#dc2626', fontWeight: '600', marginBottom: '8px' }}>⚠️ Insufficient Hot Wallet Balance</div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>
                  You have {portfolio.btcHoldingsCold.toFixed(6)} BTC in cold storage. 
                  Transfer to hot wallet first via multisig process.
                </div>
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={() => executeTrade(tradeSide, parseFloat(tradeAmount), selectedAsset)}
              disabled={!tradeAmount || !currentPrice || loading}
              style={{
                width: '100%',
                padding: '20px',
                background: tradeSide === 'BUY' 
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '700',
                cursor: !tradeAmount || !currentPrice || loading ? 'not-allowed' : 'pointer',
                opacity: !tradeAmount || !currentPrice || loading ? 0.5 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Loading...' : `${tradeSide} ${selectedAsset}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Custody Interface Component
function CustodyInterface({ portfolio, coldStorage, marketData, onTransferRequest, formatCurrency }) {
  const [transferAmount, setTransferAmount] = useState('')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="slide-up">
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 250, 0.9) 100%)',
        borderRadius: '24px',
        padding: '48px',
        border: '1px solid rgba(6, 182, 212, 0.2)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px)'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '32px' }}>
          Bitcoin Custody Management
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {/* Hot Wallet */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(251, 113, 133, 0.1) 100%)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(251, 146, 60, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: '#0f172a', fontSize: '20px', margin: 0 }}>🔥 Hot Wallet</h3>
              <div style={{
                background: 'rgba(251, 146, 60, 0.2)',
                color: '#f59e0b',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                ACTIVE
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
                {portfolio.btcHoldingsHot.toFixed(6)} BTC
              </div>
              <div style={{ fontSize: '16px', color: '#64748b' }}>
                {formatCurrency(portfolio.btcHoldingsHot * (marketData?.usd || 0))}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Security Features:</div>
              <ul style={{ margin: 0, paddingLeft: '16px', color: '#64748b', fontSize: '14px' }}>
                <li>2FA Authentication</li>
                <li>API Rate Limiting</li>
                <li>Real-time Monitoring</li>
                <li>Instant Trading Access</li>
              </ul>
            </div>
          </div>

          {/* Cold Storage */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: '#0f172a', fontSize: '20px', margin: 0 }}>❄️ Cold Storage</h3>
              <div style={{
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                SECURED
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
                {coldStorage.totalBTC.toFixed(6)} BTC
              </div>
              <div style={{ fontSize: '16px', color: '#64748b' }}>
                {formatCurrency(coldStorage.totalBTC * (marketData?.usd || 0))}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Multisig Configuration:</div>
              <div style={{ color: '#0f172a', fontWeight: '600', marginBottom: '8px' }}>
                {coldStorage.multisigConfig.requiredSignatures} of {coldStorage.multisigConfig.totalSigners} signatures required
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', color: '#64748b', fontSize: '14px' }}>
                <li>Hardware Security Modules</li>
                <li>Offline Key Generation</li>
                <li>Geographic Distribution</li>
                <li>Insurance Coverage</li>
              </ul>
            </div>

            {/* Transfer to Hot Wallet */}
            {coldStorage.totalBTC > 0 && (
              <div style={{ background: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>Transfer to Hot Wallet:</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="BTC amount"
                    max={coldStorage.totalBTC}
                    step="0.000001"
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={() => setTransferAmount(coldStorage.totalBTC.toString())}
                    style={{
                      background: '#3b82f6',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '12px 16px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    MAX
                  </button>
                </div>
                <button
                  onClick={() => onTransferRequest(parseFloat(transferAmount))}
                  disabled={!transferAmount || parseFloat(transferAmount) > coldStorage.totalBTC}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: !transferAmount || parseFloat(transferAmount) > coldStorage.totalBTC 
                      ? 'rgba(59, 130, 246, 0.3)' 
                      : '#3b82f6',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    cursor: !transferAmount || parseFloat(transferAmount) > coldStorage.totalBTC ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Start Multisig Transfer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        {coldStorage.transactions.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            marginTop: '32px'
          }}>
            <h3 style={{ color: '#0f172a', marginBottom: '24px' }}>Cold Storage Transaction History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {coldStorage.transactions.slice(-10).reverse().map((tx, index) => (
                <div key={tx.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: 'rgba(6, 182, 212, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(6, 182, 212, 0.1)'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>
                      {tx.type === 'deposit' ? '⬇️ Deposit' : '⬆️ Withdrawal'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      {new Date(tx.timestamp).toLocaleString()}
                      {tx.multisigApproved && ' • Multisig Approved'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: '600',
                      color: tx.type === 'deposit' ? '#22c55e' : '#f59e0b'
                    }}>
                      {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(6)} BTC
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      {formatCurrency(tx.amount * (marketData?.usd || 0))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Additional Page Components
function ReportingInterface({ portfolio, formatCurrency }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 250, 0.9) 100%)',
      borderRadius: '24px',
      padding: '48px',
      border: '1px solid rgba(6, 182, 212, 0.2)',
      backdropFilter: 'blur(20px)'
    }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '32px' }}>
        Treasury Reports
      </h1>
      <div style={{ textAlign: 'center', padding: '64px 0', color: '#64748b' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h3>Advanced Reporting Coming Soon</h3>
        <p>Generate comprehensive treasury reports, compliance documentation, and audit trails.</p>
      </div>
    </div>
  )
}

function CompanyProfile() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 250, 0.9) 100%)',
      borderRadius: '24px',
      padding: '48px',
      border: '1px solid rgba(6, 182, 212, 0.2)',
      backdropFilter: 'blur(20px)'
    }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '32px' }}>
        Company Profile
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        <div>
          <h3 style={{ color: '#0f172a', marginBottom: '16px' }}>Company Information</h3>
          <div style={{ background: 'rgba(6, 182, 212, 0.05)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <strong>Company Name:</strong> Treasury Corp
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Founded:</strong> 2020
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Industry:</strong> Financial Technology
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Headquarters:</strong> San Francisco, CA
            </div>
            <div>
              <strong>Treasury Lead:</strong> John Smith
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ color: '#0f172a', marginBottom: '16px' }}>Bitcoin Treasury Policy</h3>
          <div style={{ background: 'rgba(6, 182, 212, 0.05)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <strong>Target Allocation:</strong> 5-15% of cash reserves
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Rebalancing:</strong> Monthly review
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Custody:</strong> Multi-signature cold storage
            </div>
            <div>
              <strong>Risk Management:</strong> Dollar-cost averaging strategy
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PrivacyPolicy() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 250, 0.9) 100%)',
      borderRadius: '24px',
      padding: '48px',
      border: '1px solid rgba(6, 182, 212, 0.2)',
      backdropFilter: 'blur(20px)',
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '32px' }}>
        Privacy Policy
      </h1>
      
      <div style={{ color: '#374151', lineHeight: '1.6' }}>
        <h3>1. Information We Collect</h3>
        <p>We collect information necessary to provide our Bitcoin treasury management services, including account information, transaction data, and usage analytics.</p>
        
        <h3>2. How We Use Information</h3>
        <p>Your information is used to provide secure treasury management services, ensure compliance with regulations, and improve our platform.</p>
        
        <h3>3. Data Security</h3>
        <p>We implement industry-leading security measures including encryption, multi-signature protocols, and secure storage to protect your data and assets.</p>
        
        <h3>4. Information Sharing</h3>
        <p>We do not sell or share your personal information with third parties except as required by law or to provide our services.</p>
        
        <h3>5. Contact Us</h3>
        <p>For privacy-related questions, contact us at privacy@foresightenterprise.com</p>
      </div>
    </div>
  )
}

function TermsConditions() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 250, 0.9) 100%)',
      borderRadius: '24px',
      padding: '48px',
      border: '1px solid rgba(6, 182, 212, 0.2)',
      backdropFilter: 'blur(20px)',
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '32px' }}>
        Terms & Conditions
      </h1>
      
      <div style={{ color: '#374151', lineHeight: '1.6' }}>
        <h3>1. Service Agreement</h3>
        <p>By using Foresight Enterprise, you agree to these terms and conditions. Our platform provides Bitcoin treasury management services for institutional clients.</p>
        
        <h3>2. Eligibility</h3>
        <p>Services are available to qualified institutional investors and corporate treasuries that meet our verification requirements.</p>
        
        <h3>3. Risk Disclosure</h3>
        <p>Bitcoin and cryptocurrency investments carry significant risk. Past performance does not guarantee future results. Consult with financial advisors before making investment decisions.</p>
        
        <h3>4. Custody Services</h3>
        <p>We provide secure custody solutions including multi-signature wallets and cold storage. Clients maintain ultimate control of their private keys.</p>
        
        <h3>5. Fees and Charges</h3>
        <p>Trading fees of 0.5% apply to all transactions. Additional custody and management fees may apply based on your service level.</p>
        
        <h3>6. Limitation of Liability</h3>
        <p>Our liability is limited to the extent permitted by law. We are not responsible for market losses or external security breaches.</p>
        
        <h3>7. Contact</h3>
        <p>For questions about these terms, contact legal@foresightenterprise.com</p>
      </div>
    </div>
  )
}
