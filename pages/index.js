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
  const [selectedTrade, setSelectedTrade] = useState(null)
  
  // Trading State with localStorage persistence
  const [portfolio, setPortfolio] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('foresight-portfolio')
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return {
      cashUSD: 10000000,
      btcHoldings: 0,
      stockHoldings: {
        MSTR: 0,
        STRC: 0,
        STRK: 0,
        STRF: 0,
        STRD: 0
      },
      totalValue: 10000000,
      unrealizedPL: 0,
      costBasis: 0,
      stockCostBasis: {},
      trades: [],
      hotStorage: {
        btc: 0,
        stocks: {},
        trades: []
      },
      coldStorage: {
        btc: 0,
        stocks: {},
        trades: [],
        pending: []
      }
    }
  })

  // Save to localStorage whenever portfolio changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('foresight-portfolio', JSON.stringify(portfolio))
    }
  }, [portfolio])

  // Fetch Bitcoin price data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true')
        const data = await response.json()
        setMarketData(data.bitcoin)
      } catch (error) {
        console.error('Failed to fetch market data:', error)
        setMarketData({
          usd: 43250,
          usd_24h_change: 2.34,
          usd_market_cap: 845000000000,
          usd_24h_vol: 28500000000
        })
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch stock data for leveraged Bitcoin stocks
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const mockData = {
          MSTR: { price: 485.50, change: 8.2 },
          STRC: { price: 52.30, change: -2.1 },
          STRK: { price: 28.90, change: 5.7 },
          STRF: { price: 31.45, change: 3.2 },
          STRD: { price: 19.80, change: -1.8 }
        }
        setStockData(mockData)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch stock data:', error)
        setLoading(false)
      }
    }

    fetchStockData()
    const interval = setInterval(fetchStockData, 60000)
    return () => clearInterval(interval)
  }, [])

  // Calculate total portfolio value
  useEffect(() => {
    if (marketData && Object.keys(stockData).length > 0) {
      const btcValue = portfolio.btcHoldings * marketData.usd
      const stockValue = Object.entries(portfolio.stockHoldings).reduce((total, [symbol, shares]) => {
        return total + (shares * (stockData[symbol]?.price || 0))
      }, 0)
      
      const newTotalValue = portfolio.cashUSD + btcValue + stockValue
      const btcUnrealizedPL = btcValue - portfolio.costBasis
      const stockUnrealizedPL = Object.entries(portfolio.stockHoldings).reduce((total, [symbol, shares]) => {
        const currentValue = shares * (stockData[symbol]?.price || 0)
        const costBasis = portfolio.stockCostBasis[symbol] || 0
        return total + (currentValue - costBasis)
      }, 0)
      
      setPortfolio(prev => ({
        ...prev,
        totalValue: newTotalValue,
        unrealizedPL: btcUnrealizedPL + stockUnrealizedPL
      }))
    }
  }, [marketData, stockData, portfolio.btcHoldings, portfolio.stockHoldings, portfolio.cashUSD, portfolio.costBasis, portfolio.stockCostBasis])

  const executeTrade = (type, side, amountUSD, symbol = 'BTC') => {
    if (type === 'crypto') {
      if (!marketData) return false

      const currentPrice = marketData.usd
      const btcAmount = amountUSD / currentPrice
      const fees = amountUSD * 0.005
      const totalCost = amountUSD + fees

      if (side === 'BUY') {
        if (portfolio.cashUSD < totalCost) return false
        
        const newTrade = {
          id: Date.now(),
          type: 'crypto',
          side: 'BUY',
          symbol: 'BTC',
          amountUSD,
          quantity: btcAmount,
          price: currentPrice,
          fees,
          timestamp: new Date().toISOString(),
          status: 'Executed',
          storage: 'none'
        }

        setPortfolio(prev => ({
          ...prev,
          cashUSD: prev.cashUSD - totalCost,
          btcHoldings: prev.btcHoldings + btcAmount,
          costBasis: prev.costBasis + amountUSD,
          trades: [newTrade, ...prev.trades]
        }))
        
        return true
      } else if (side === 'SELL') {
        if (portfolio.btcHoldings < btcAmount) return false
        
        const newTrade = {
          id: Date.now(),
          type: 'crypto',
          side: 'SELL',
          symbol: 'BTC',
          amountUSD,
          quantity: btcAmount,
          price: currentPrice,
          fees,
          timestamp: new Date().toISOString(),
          status: 'Executed',
          storage: 'none'
        }

        const netReceived = amountUSD - fees
        const costBasisReduction = (btcAmount / portfolio.btcHoldings) * portfolio.costBasis

        setPortfolio(prev => ({
          ...prev,
          cashUSD: prev.cashUSD + netReceived,
          btcHoldings: prev.btcHoldings - btcAmount,
          costBasis: prev.costBasis - costBasisReduction,
          trades: [newTrade, ...prev.trades]
        }))
        
        return true
      }
    } else if (type === 'stock') {
      const stockPrice = stockData[symbol]?.price
      if (!stockPrice) return false

      const shares = amountUSD / stockPrice
      const fees = amountUSD * 0.005
      const totalCost = amountUSD + fees

      if (side === 'BUY') {
        if (portfolio.cashUSD < totalCost) return false
        
        const newTrade = {
          id: Date.now(),
          type: 'stock',
          side: 'BUY',
          symbol,
          amountUSD,
          quantity: shares,
          price: stockPrice,
          fees,
          timestamp: new Date().toISOString(),
          status: 'Executed',
          storage: 'none'
        }

        setPortfolio(prev => ({
          ...prev,
          cashUSD: prev.cashUSD - totalCost,
          stockHoldings: {
            ...prev.stockHoldings,
            [symbol]: (prev.stockHoldings[symbol] || 0) + shares
          },
          stockCostBasis: {
            ...prev.stockCostBasis,
            [symbol]: (prev.stockCostBasis[symbol] || 0) + amountUSD
          },
          trades: [newTrade, ...prev.trades]
        }))
        
        return true
      } else if (side === 'SELL') {
        if ((portfolio.stockHoldings[symbol] || 0) < shares) return false
        
        const newTrade = {
          id: Date.now(),
          type: 'stock',
          side: 'SELL',
          symbol,
          amountUSD,
          quantity: shares,
          price: stockPrice,
          fees,
          timestamp: new Date().toISOString(),
          status: 'Executed',
          storage: 'none'
        }

        const netReceived = amountUSD - fees
        const costBasisReduction = (shares / portfolio.stockHoldings[symbol]) * (portfolio.stockCostBasis[symbol] || 0)

        setPortfolio(prev => ({
          ...prev,
          cashUSD: prev.cashUSD + netReceived,
          stockHoldings: {
            ...prev.stockHoldings,
            [symbol]: prev.stockHoldings[symbol] - shares
          },
          stockCostBasis: {
            ...prev.stockCostBasis,
            [symbol]: (prev.stockCostBasis[symbol] || 0) - costBasisReduction
          },
          trades: [newTrade, ...prev.trades]
        }))
        
        return true
      }
    }
    
    return false
  }

  const transferToStorage = (tradeId, storageType) => {
    const trade = portfolio.trades.find(t => t.id === tradeId)
    if (!trade) return

    setPortfolio(prev => {
      const updatedTrades = prev.trades.map(t => 
        t.id === tradeId ? { ...t, storage: storageType } : t
      )

      if (storageType === 'hot') {
        return {
          ...prev,
          trades: updatedTrades,
          hotStorage: {
            ...prev.hotStorage,
            trades: [...prev.hotStorage.trades, { ...trade, storage: storageType }]
          }
        }
      } else if (storageType === 'cold') {
        return {
          ...prev,
          trades: updatedTrades,
          coldStorage: {
            ...prev.coldStorage,
            pending: [...prev.coldStorage.pending, { ...trade, storage: storageType, multisigStatus: 'pending' }]
          }
        }
      }

      return { ...prev, trades: updatedTrades }
    })

    setShowTransferModal(false)
  }

  const simulateMultisig = (tradeId) => {
    setPortfolio(prev => {
      const pendingTrade = prev.coldStorage.pending.find(t => t.id === tradeId)
      if (!pendingTrade) return prev

      return {
        ...prev,
        coldStorage: {
          ...prev.coldStorage,
          pending: prev.coldStorage.pending.filter(t => t.id !== tradeId),
          trades: [...prev.coldStorage.trades, { ...pendingTrade, multisigStatus: 'confirmed' }]
        }
      }
    })
  }

  const resetDemo = () => {
    const initialPortfolio = {
      cashUSD: 10000000,
      btcHoldings: 0,
      stockHoldings: {
        MSTR: 0,
        STRC: 0,
        STRK: 0,
        STRF: 0,
        STRD: 0
      },
      totalValue: 10000000,
      unrealizedPL: 0,
      costBasis: 0,
      stockCostBasis: {},
      trades: [],
      hotStorage: {
        btc: 0,
        stocks: {},
        trades: []
      },
      coldStorage: {
        btc: 0,
        stocks: {},
        trades: [],
        pending: []
      }
    }
    setPortfolio(initialPortfolio)
    localStorage.setItem('foresight-portfolio', JSON.stringify(initialPortfolio))
    setShowUserMenu(false)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <>
      <Head>
        <title>Foresight Enterprise™ - Bitcoin Treasury Management</title>
        <meta name="description" content="Professional Bitcoin & Leveraged Stock Trading Platform" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F0FDFA 0%, #ECFDF5 25%, #F0FDF4 50%, #CCFBF1 75%, #A7F3D0 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#0F172A',
        position: 'relative'
      }}>
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
            animation: 'float 20s linear infinite'
          }}></div>
          
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '20%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'pulse 4s ease-in-out infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'pulse 6s ease-in-out infinite reverse'
          }}></div>
        </div>

        {/* Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(6, 182, 212, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '80px',
            padding: '0 40px'
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 50%, #22C55E 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: '900',
                boxShadow: '0 8px 32px rgba(6, 182, 212, 0.3)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                ₿
              </div>
              <div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  margin: 0,
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}>
                  Foresight Enterprise™
                </h1>
                <p style={{
                  fontSize: '14px',
                  color: '#64748B',
                  margin: 0,
                  fontWeight: '600',
                  letterSpacing: '0.01em'
                }}>
                  Professional Trading Platform
                </p>
              </div>
            </div>
            
            {/* Navigation */}
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '20px',
              padding: '6px',
              border: '1px solid rgba(6, 182, 212, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              {[
                { id: 'dashboard', name: 'Portfolio' },
                { id: 'trade', name: 'Trading' },
                { id: 'custody', name: 'Custody' },
                { id: 'reporting', name: 'Reports' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: activeTab === tab.id 
                      ? 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)'
                      : 'transparent',
                    color: activeTab === tab.id ? '#FFFFFF' : '#64748B',
                    fontWeight: activeTab === tab.id ? '700' : '600',
                    fontSize: '14px',
                    letterSpacing: '0.01em',
                    boxShadow: activeTab === tab.id 
                      ? '0 4px 20px rgba(6, 182, 212, 0.3)' 
                      : 'none',
                    transform: activeTab === tab.id ? 'translateY(-1px)' : 'translateY(0)'
                  }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    background: activeTab === tab.id ? '#FFFFFF' : '#94A3B8',
                    borderRadius: '4px'
                  }}></div>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>

            {/* User Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Live Status */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '20px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#10B981',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#10B981',
                  letterSpacing: '0.02em'
                }}>
                  LIVE TRADING
                </span>
              </div>
              
              {/* User Avatar */}
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '16px',
                    boxShadow: '0 8px 32px rgba(6, 182, 212, 0.3)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  TC
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '16px',
                    height: '16px',
                    background: '#10B981',
                    borderRadius: '50%',
                    border: '3px solid #FFFFFF'
                  }}></div>
                </div>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '60px',
                    right: 0,
                    width: '280px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(6, 182, 212, 0.1)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    padding: '20px',
                    zIndex: 200
                  }}>
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>Treasury Admin</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' }}>Foresight Capital</p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button 
                        onClick={() => {setActiveTab('company'); setShowUserMenu(false)}}
                        style={{
                          padding: '12px 16px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(6, 182, 212, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        🏢 Company Information
                      </button>
                      
                      <button 
                        onClick={() => {setActiveTab('terms'); setShowUserMenu(false)}}
                        style={{
                          padding: '12px 16px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(6, 182, 212, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        📋 Terms & Conditions
                      </button>
                      
                      <button 
                        onClick={() => {setActiveTab('privacy'); setShowUserMenu(false)}}
                        style={{
                          padding: '12px 16px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(6, 182, 212, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        🔒 Privacy Policy
                      </button>
                      
                      <div style={{ height: '1px', background: 'rgba(6, 182, 212, 0.2)', margin: '8px 0' }}></div>
                      
                      <button 
                        onClick={resetDemo}
                        style={{
                          padding: '12px 16px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#EF4444',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.15)'
                          e.target.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.1)'
                          e.target.style.transform = 'translateY(0)'
                        }}
                      >
                        🔄 Reset Demo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Transfer Modal */}
        {showTransferModal && selectedTrade && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              border: '1px solid rgba(6, 182, 212, 0.1)',
              backdropFilter: 'blur(20px)'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', color: '#0F172A' }}>
                Transfer to Storage
              </h3>
              <p style={{ color: '#64748B', marginBottom: '24px' }}>
                Choose storage type for your {selectedTrade.symbol} trade:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <button 
                  onClick={() => transferToStorage(selectedTrade.id, 'hot')}
                  style={{
                    padding: '20px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '2px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(245, 158, 11, 0.15)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(245, 158, 11, 0.1)'}
                >
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔥</div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#F59E0B' }}>Hot Storage</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#92400E' }}>
                    Instant access for high-frequency trading
                  </p>
                </button>
                
                <button 
                  onClick={() => transferToStorage(selectedTrade.id, 'cold')}
                  style={{
                    padding: '20px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '2px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.15)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.1)'}
                >
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>❄️</div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#3B82F6' }}>Cold Storage</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1E40AF' }}>
                    Maximum security with multi-signature protection
                  </p>
                </button>
              </div>
              
              <button 
                onClick={() => setShowTransferModal(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(107, 114, 128, 0.1)',
                  border: '1px solid rgba(107, 114, 128, 0.2)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6B7280'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Portfolio Detail Modal */}
        {showPortfolioDetail && (
          <PortfolioDetailModal 
            portfolio={portfolio} 
            marketData={marketData} 
            stockData={stockData}
            onClose={() => setShowPortfolioDetail(false)}
          />
        )}

        {/* Main Content */}
        <main style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '40px',
          minHeight: 'calc(100vh - 80px)',
          position: 'relative',
          zIndex: 10
        }}>
          {activeTab === 'dashboard' && (
            <Dashboard 
              marketData={marketData} 
              stockData={stockData}
              loading={loading} 
              portfolio={portfolio} 
              onPortfolioClick={() => setShowPortfolioDetail(true)}
              onTransferClick={(trade) => {
                setSelectedTrade(trade)
                setShowTransferModal(true)
              }}
            />
          )}
          {activeTab === 'trade' && (
            <Trading 
              marketData={marketData} 
              stockData={stockData}
              portfolio={portfolio} 
              executeTrade={executeTrade} 
            />
          )}
          {activeTab === 'custody' && (
            <Custody 
              portfolio={portfolio} 
              onMultisigApprove={simulateMultisig}
            />
          )}
          {activeTab === 'reporting' && <Reporting portfolio={portfolio} />}
          {activeTab === 'company' && <CompanyInfo />}
          {activeTab === 'terms' && <Terms />}
          {activeTab === 'privacy' && <Privacy />}
        </main>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
          font-smoothing: antialiased;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(10px) translateX(-5px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-up {
          animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </>
  )
}

// Portfolio Detail Modal Component
function PortfolioDetailModal({ portfolio, marketData, stockData, onClose }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const btcValue = portfolio.btcHoldings * (marketData?.usd || 0)
  const stockValue = Object.entries(portfolio.stockHoldings).reduce((total, [symbol, shares]) => {
    return total + (shares * (stockData[symbol]?.price || 0))
  }, 0)

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        border: '1px solid rgba(6, 182, 212, 0.1)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
            Portfolio Breakdown
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6B7280'
            }}
          >
            ×
          </button>
        </div>

        {/* Total Value */}
        <div style={{
          background: 'rgba(6, 182, 212, 0.05)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(6, 182, 212, 0.1)'
        }}>
          <h4 style={{ fontSize: '16px', color: '#64748B', margin: '0 0 8px 0' }}>Total Portfolio Value</h4>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#0F172A' }}>
            {formatCurrency(portfolio.totalValue)}
          </div>
        </div>

        {/* Asset Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Cash */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: 'rgba(16, 185, 129, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.1)'
          }}>
            <div>
              <h5 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Cash (USD)</h5>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' }}>Available for trading</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#10B981' }}>
                {formatCurrency(portfolio.cashUSD)}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                {((portfolio.cashUSD / portfolio.totalValue) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Bitcoin */}
          {portfolio.btcHoldings > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              background: 'rgba(245, 158, 11, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(245, 158, 11, 0.1)'
            }}>
              <div>
                <h5 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Bitcoin</h5>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' }}>
                  {portfolio.btcHoldings.toFixed(6)} BTC
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#F59E0B' }}>
                  {formatCurrency(btcValue)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {((btcValue / portfolio.totalValue) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          )}

          {/* Stocks */}
          {Object.entries(portfolio.stockHoldings).map(([symbol, shares]) => {
            if (shares <= 0) return null
            const value = shares * (stockData[symbol]?.price || 0)
            return (
              <div key={symbol} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: 'rgba(139, 92, 246, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.1)'
              }}>
                <div>
                  <h5 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>{symbol}</h5>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' }}>
                    {shares.toFixed(2)} shares @ {formatCurrency(stockData[symbol]?.price || 0)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#8B5CF6' }}>
                    {formatCurrency(value)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {((value / portfolio.totalValue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* P/L Summary */}
        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: portfolio.unrealizedPL >= 0 
            ? 'rgba(16, 185, 129, 0.05)' 
            : 'rgba(239, 68, 68, 0.05)',
          borderRadius: '12px',
          border: `1px solid ${portfolio.unrealizedPL >= 0 
            ? 'rgba(16, 185, 129, 0.2)' 
            : 'rgba(239, 68, 68, 0.2)'}`
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#64748B' }}>Unrealized P/L</h4>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '800', 
            color: portfolio.unrealizedPL >= 0 ? '#10B981' : '#EF4444' 
          }}>
            {portfolio.unrealizedPL >= 0 ? '+' : ''}{formatCurrency(portfolio.unrealizedPL)}
          </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard Component
function Dashboard({ marketData, stockData, loading, portfolio, onPortfolioClick, onTransferClick }) {
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

  const allocationPercentage = portfolio.totalValue > 0 ? ((portfolio.btcHoldings * (marketData?.usd || 0)) / portfolio.totalValue * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="slide-up">
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 250, 0.9) 100%)',
        borderRadius: '24px',
        padding: '48px',
        border: '1px solid rgba(6, 182, 212, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)'
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: '900',
            margin: 0,
            background: 'linear-gradient(135deg, #0F172A 0%, #06B6D4 50%, #10B981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em',
            lineHeight: '1.1',
            marginBottom: '16px'
          }}>
            Portfolio Command Center
          </h1>
          <p style={{
            fontSize: '22px',
            color: '#475569',
            margin: 0,
            fontWeight: '500',
            lineHeight: '1.4',
            marginBottom: '24px'
          }}>
            Real-time Bitcoin & leveraged stock trading with professional execution
          </p>

          {/* Live Price Display */}
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '16px',
              border: '1px solid rgba(6, 182, 212, 0.1)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '3px solid rgba(6, 182, 212, 0.2)',
                borderTop: '3px solid #06B6D4',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{ fontSize: '16px', fontWeight: '600' }}>Loading live market data...</span>
            </div>
          ) : marketData && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '16px',
              border: '1px solid rgba(6, 182, 212, 0.1)',
              backdropFilter: 'blur(12px)'
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: '900',
                color: '#0F172A'
              }}>
                {formatCurrency(marketData.usd)}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '12px',
                background: marketData.usd_24h_change >= 0 
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                color: marketData.usd_24h_change >= 0 ? '#10B981' : '#EF4444'
              }}>
                <span style={{ fontSize: '16px' }}>
                  {marketData.usd_24h_change >= 0 ? '↗' : '↘'}
                </span>
                <span style={{ fontWeight: '700', fontSize: '14px' }}>
                  {Math.abs(marketData.usd_24h_change).toFixed(2)}%
                </span>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>24h</span>
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748B',
                fontWeight: '600'
              }}>
                Live Bitcoin Price • Updated every 30s
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        <KPICard 
          title="Total Portfolio Value"
          value={formatCurrency(portfolio.totalValue)}
          subtitle="Cash + Bitcoin + Stocks"
          icon="wallet"
          primary={true}
          onClick={onPortfolioClick}
        />
        <KPICard 
          title="Bitcoin Holdings" 
          value={formatBTC(portfolio.btcHoldings)}
          subtitle={`${allocationPercentage.toFixed(1)}% of portfolio`}
          icon="bitcoin"
        />
        <KPICard 
          title="Cash Available" 
          value={formatCurrency(portfolio.cashUSD)}
          subtitle="Available for trading"
          icon="cash"
        />
        <KPICard 
          title="Unrealized P/L" 
          value={formatCurrency(portfolio.unrealizedPL)}
          subtitle="Mark-to-market gains/losses"
          change={portfolio.costBasis > 0 ? (portfolio.unrealizedPL / portfolio.costBasis * 100) : 0}
          icon="chart"
        />
      </div>

      {/* Stock Holdings */}
      {Object.values(portfolio.stockHoldings).some(shares => shares > 0) && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(6, 182, 212, 0.1)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }} className="hover-lift">
          <h3 style={{
            fontSize: '24px',
            fontWeight: '800',
            marginBottom: '24px',
            color: '#0F172A'
          }}>
            Leveraged Bitcoin Stock Holdings
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {Object.entries(portfolio.stockHoldings).map(([symbol, shares]) => {
              if (shares <= 0) return null
              const stock = stockData[symbol]
              const value = shares * (stock?.price || 0)
              return (
                <div key={symbol} style={{
                  padding: '20px',
                  background: 'rgba(139, 92, 246, 0.05)',
                  borderRadius: '16px',
                  border: '1px solid rgba(139, 92, 246, 0.1)'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#8B5CF6' }}>
                    {symbol}
                  </h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                    {formatCurrency(value)}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                    {shares.toFixed(2)} shares @ {formatCurrency(stock?.price || 0)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Trades */}
      {portfolio.trades.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(6, 182, 212, 0.1)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }} className="hover-lift">
          <h3 style={{
            fontSize: '24px',
            fontWeight: '800',
            marginBottom: '24px',
            color: '#0F172A'
          }}>
            Recent Trades
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {portfolio.trades.slice(0, 5).map((trade) => (
              <TradeRow key={trade.id} trade={trade} onTransferClick={onTransferClick} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KPICard({ title, value, subtitle, change, icon, primary = false, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
        background: primary 
          ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)'
          : 'rgba(255, 255, 255, 0.9)',
        borderRadius: '20px',
        padding: '28px',
        border: primary 
          ? '1px solid rgba(6, 182, 212, 0.2)'
          : '1px solid rgba(6, 182, 212, 0.1)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
      className={onClick ? "hover-lift" : ""}
    >
      {primary && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(40%, -40%)'
        }}></div>
      )}
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: primary ? 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)' : 'rgba(6, 182, 212, 0.1)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: primary ? 'white' : '#06B6D4'
          }}>
            {icon === 'wallet' && '💼'}
            {icon === 'bitcoin' && '₿'}
            {icon === 'cash' && '💰'}
            {icon === 'chart' && '📈'}
          </div>
          {change !== undefined && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700',
              background: change >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: change >= 0 ? '#10B981' : '#EF4444'
            }}>
              <span>{change >= 0 ? '↗' : '↘'}</span>
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>
        
        <div>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#64748B',
            marginBottom: '8px',
            letterSpacing: '0.01em'
          }}>
            {title}
          </h3>
          <p style={{
            fontSize: '32px',
            fontWeight: '900',
            margin: 0,
            letterSpacing: '-0.02em',
            lineHeight: '1',
            marginBottom: '4px',
            color: '#0F172A'
          }}>
            {value}
          </p>
          <p style={{
            fontSize: '13px',
            color: '#64748B',
            margin: 0,
            fontWeight: '500'
          }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}

function TradeRow({ trade, onTransferClick }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  const getStorageStatus = () => {
    switch(trade.storage) {
      case 'hot': return { text: 'Hot Storage', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' }
      case 'cold': return { text: 'Cold Storage', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' }
      default: return { text: 'Not Transferred', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' }
    }
  }

  const storageStatus = getStorageStatus()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '16px',
      border: '1px solid rgba(6, 182, 212, 0.1)',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.target.style.background = 'rgba(255, 255, 255, 1)'
      e.target.style.transform = 'translateY(-2px)'
      e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)'
    }}
    onMouseLeave={(e) => {
      e.target.style.background = 'rgba(255, 255, 255, 0.8)'
      e.target.style.transform = 'translateY(0)'
      e.target.style.boxShadow = 'none'
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '700',
          fontSize: '18px',
          background: trade.side === 'BUY' 
            ? 'linear-gradient(135deg, #10B981 0%, #22C55E 100%)'
            : 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)'
        }}>
          {trade.side === 'BUY' ? '↗' : '↘'}
        </div>
        <div>
          <p style={{
            fontSize: '16px',
            fontWeight: '700',
            margin: 0,
            marginBottom: '4px',
            color: '#0F172A'
          }}>
            {formatCurrency(trade.amountUSD)} • {trade.symbol}
          </p>
          <p style={{
            fontSize: '14px',
            color: '#64748B',
            margin: 0,
            fontWeight: '500'
          }}>
            {trade.type === 'crypto' 
              ? `${trade.quantity.toFixed(6)} BTC at ${formatCurrency(trade.price)}`
              : `${trade.quantity.toFixed(2)} shares at ${formatCurrency(trade.price)}`
            }
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: '700',
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#10B981'
        }}>
          ✓ {trade.status}
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: '600',
            background: storageStatus.bg,
            color: storageStatus.color
          }}>
            {storageStatus.text}
          </div>
          
          {trade.storage === 'none' && (
            <button
              onClick={() => onTransferClick(trade)}
              style={{
                padding: '4px 8px',
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '600',
                color: '#06B6D4',
                cursor: 'pointer'
              }}
            >
              Transfer
            </button>
          )}
        </div>
        
        <p style={{
          fontSize: '12px',
          color: '#64748B',
          margin: 0,
          fontWeight: '500'
        }}>
          {formatTime(trade.timestamp)}
        </p>
      </div>
    </div>
  )
}

// Trading Component
function Trading({ marketData, stockData, portfolio, executeTrade }) {
  const [selectedAsset, setSelectedAsset] = useState('BTC')
  const [selectedSide, setSelectedSide] = useState('BUY')
  const [amount, setAmount] = useState('')
  const [hasQuote, setHasQuote] = useState(false)
  const [tradeResult, setTradeResult] = useState(null)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getQuote = () => {
    if (amount && ((selectedAsset === 'BTC' && marketData) || (selectedAsset !== 'BTC' && stockData[selectedAsset]))) {
      setHasQuote(true)
      setTradeResult(null)
    }
  }

  const handleTrade = () => {
    const amountNum = parseFloat(amount)
    const assetType = selectedAsset === 'BTC' ? 'crypto' : 'stock'
    const success = executeTrade(assetType, selectedSide, amountNum, selectedAsset)
    
    if (success) {
      setTradeResult({ success: true, message: `${selectedSide} order executed successfully!` })
      setAmount('')
      setHasQuote(false)
    } else {
      setTradeResult({ 
        success: false, 
        message: selectedSide === 'BUY' ? 'Insufficient cash balance' : `Insufficient ${selectedAsset} holdings`
      })
    }
    
    setTimeout(() => setTradeResult(null), 3000)
  }

  const getCurrentPrice = () => {
    if (selectedAsset === 'BTC') return marketData?.usd || 0
    return stockData[selectedAsset]?.price || 0
  }

  const estimatedQuantity = amount && getCurrentPrice() ? (parseFloat(amount) / getCurrentPrice()) : 0
  const fees = amount ? (parseFloat(amount) * 0.005) : 0
  const maxBuyAmount = portfolio.cashUSD * 0.995

  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { symbol: 'MSTR', name: 'MicroStrategy', type: 'stock' },
    { symbol: 'STRC', name: 'Strive Bitcoin ETF', type: 'stock' },
    { symbol: 'STRK', name: 'Strike Technologies', type: 'stock' },
    { symbol: 'STRF', name: 'Strategic Bitcoin Fund', type: 'stock' },
    { symbol: 'STRD', name: 'Stridepoint BTC', type: 'stock' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="slide-up">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '56px',
          fontWeight: '900',
          margin: 0,
          background: 'linear-gradient(135deg, #0F172A 0%, #06B6D4 50%, #10B981 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em',
          marginBottom: '16px'
        }}>
          Professional Trading Desk
        </h1>
        <p style={{
          fontSize: '22px',
          color: '#475569',
          margin: 0,
          fontWeight: '500'
        }}>
          Execute Bitcoin & leveraged stock trades with real-time market data
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Trading Panel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(6, 182, 212, 0.1)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }} className="hover-lift">
          <h3 style={{
            fontSize: '24px',
            fontWeight: '800',
            marginBottom: '32px',
            color: '#0F172A'
          }}>
            Execute Trade
          </h3>

          {/* Asset Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: '12px',
              display: 'block'
            }}>
              Select Asset
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}>
              {assets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => {
                    setSelectedAsset(asset.symbol)
                    setHasQuote(false)
                    setTradeResult(null)
                  }}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '700',
                    transition: 'all 0.2s ease',
                    background: selectedAsset === asset.symbol 
                      ? (asset.type === 'crypto' 
                          ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                          : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)')
                      : 'rgba(107, 114, 128, 0.1)',
                    color: selectedAsset === asset.symbol ? 'white' : '#6B7280'
                  }}
                >
                  {asset.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Buy/Sell Toggle */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '32px'
          }}>
            <button
              onClick={() => {
                setSelectedSide('BUY')
                setHasQuote(false)
                setTradeResult(null)
              }}
              style={{
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                background: selectedSide === 'BUY' 
                  ? 'linear-gradient(135deg, #10B981 0%, #22C55E 100%)'
                  : 'rgba(16, 185, 129, 0.1)',
                color: selectedSide === 'BUY' ? 'white' : '#10B981',
                boxShadow: selectedSide === 'BUY' ? '0 8px 32px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              🔥 Buy {selectedAsset}
            </button>
            <button
              onClick={() => {
                setSelectedSide('SELL')
                setHasQuote(false)
                setTradeResult(null)
              }}
              style={{
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                background: selectedSide === 'SELL' 
                  ? 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)'
                  : 'rgba(239, 68, 68, 0.1)',
                color: selectedSide === 'SELL' ? 'white' : '#EF4444',
                boxShadow: selectedSide === 'SELL' ? '0 8px 32px rgba(239, 68, 68, 0.3)' : 'none'
              }}
            >
              📉 Sell {selectedAsset}
            </button>
          </div>

          {/* Balance Info */}
          <div style={{
            padding: '16px',
            background: 'rgba(6, 182, 212, 0.05)',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid rgba(6, 182, 212, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#64748B' }}>Available Cash:</span>
              <span style={{ fontWeight: '700', color: '#0F172A' }}>{formatCurrency(portfolio.cashUSD)}</span>
            </div>
            {selectedAsset === 'BTC' ? (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#64748B' }}>Bitcoin Holdings:</span>
                <span style={{ fontWeight: '700', color: '#0F172A' }}>{portfolio.btcHoldings.toFixed(6)} BTC</span>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#64748B' }}>{selectedAsset} Holdings:</span>
                <span style={{ fontWeight: '700', color: '#0F172A' }}>
                  {(portfolio.stockHoldings[selectedAsset] || 0).toFixed(2)} shares
                </span>
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#0F172A'
              }}>
                Trade Amount (USD)
              </label>
              <button
                onClick={() => {
                  setAmount(Math.floor(maxBuyAmount).toString())
                  setHasQuote(false)
                }}
                style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  background: 'transparent',
                  border: '1px solid #06B6D4',
                  borderRadius: '6px',
                  color: '#06B6D4',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                MAX
              </button>
            </div>
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '')
                setAmount(value)
                setHasQuote(false)
                setTradeResult(null)
              }}
              placeholder="1000000"
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '16px',
                border: '2px solid rgba(6, 182, 212, 0.2)',
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#0F172A',
                fontSize: '18px',
                fontWeight: '700',
                fontFamily: 'inherit',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#06B6D4'
                e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(6, 182, 212, 0.2)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Quote Section */}
          {hasQuote && amount && getCurrentPrice() > 0 && (
            <div style={{
              padding: '20px',
              background: 'rgba(6, 182, 212, 0.05)',
              borderRadius: '16px',
              marginBottom: '24px',
              border: '1px solid rgba(6, 182, 212, 0.2)'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '800',
                marginBottom: '16px',
                color: selectedSide === 'BUY' ? '#10B981' : '#EF4444'
              }}>
                {selectedSide} {selectedAsset} Quote
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: '14px' }}>
                    Est. {selectedAsset === 'BTC' ? 'Bitcoin' : 'Shares'}:
                  </span>
                  <span style={{ fontWeight: '700', fontSize: '16px' }}>
                    {selectedAsset === 'BTC' 
                      ? `${estimatedQuantity.toFixed(6)} BTC`
                      : `${estimatedQuantity.toFixed(2)} shares`
                    }
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: '14px' }}>Current Price:</span>
                  <span style={{ fontWeight: '700', fontSize: '16px' }}>{formatCurrency(getCurrentPrice())}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: '14px' }}>Fees (0.5%):</span>
                  <span style={{ fontWeight: '700', fontSize: '16px' }}>{formatCurrency(fees)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  paddingTop: '12px', 
                  borderTop: '1px solid rgba(6, 182, 212, 0.2)' 
                }}>
                  <span style={{ color: '#0F172A', fontSize: '14px', fontWeight: '700' }}>
                    {selectedSide === 'BUY' ? 'Total Cost:' : 'Net Received:'}
                  </span>
                  <span style={{ fontWeight: '900', fontSize: '18px', color: '#0F172A' }}>
                    {formatCurrency(selectedSide === 'BUY' ? parseFloat(amount) + fees : parseFloat(amount) - fees)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Trade Result */}
          {tradeResult && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              background: tradeResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${tradeResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: tradeResult.success ? '#10B981' : '#EF4444',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {tradeResult.success ? '✅' : '❌'} {tradeResult.message}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={getQuote}
              disabled={!amount || getCurrentPrice() <= 0}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                cursor: (amount && getCurrentPrice() > 0) ? 'pointer' : 'not-allowed',
                fontWeight: '700',
                fontSize: '16px',
                background: (amount && getCurrentPrice() > 0) 
                  ? 'rgba(6, 182, 212, 0.1)'
                  : 'rgba(148, 163, 184, 0.1)',
                color: (amount && getCurrentPrice() > 0) ? '#06B6D4' : '#94A3B8',
                transition: 'all 0.2s ease',
                opacity: (amount && getCurrentPrice() > 0) ? 1 : 0.5
              }}
            >
              ⚡ Get Real-Time Quote
            </button>
            
            {hasQuote && (
              <button
                onClick={handleTrade}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '16px',
                  background: selectedSide === 'BUY' 
                    ? 'linear-gradient(135deg, #10B981 0%, #22C55E 100%)'
                    : 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedSide === 'BUY' 
                    ? '0 8px 32px rgba(16, 185, 129, 0.3)'
                    : '0 8px 32px rgba(239, 68, 68, 0.3)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🚀 Execute {selectedSide} Order
              </button>
            )}
          </div>
        </div>

        {/* Market Data Panel */}
        <MarketDataPanel 
          selectedAsset={selectedAsset}
          marketData={marketData}
          stockData={stockData}
          assets={assets}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  )
}

// Market Data Panel Component
function MarketDataPanel({ selectedAsset, marketData, stockData, assets, formatCurrency }) {
  const getCurrentPrice = () => {
    if (selectedAsset === 'BTC') return marketData?.usd || 0
    return stockData[selectedAsset]?.price || 0
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '24px',
      padding: '32px',
      border: '1px solid rgba(6, 182, 212, 0.1)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
    }} className="hover-lift">
      <h3 style={{
        fontSize: '24px',
        fontWeight: '800',
        marginBottom: '32px',
        color: '#0F172A'
      }}>
        Live Market Data
      </h3>

      {/* Selected Asset Price */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        padding: '24px',
        background: 'rgba(6, 182, 212, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(6, 182, 212, 0.1)'
      }}>
        <h4 style={{ fontSize: '16px', color: '#64748B', margin: '0 0 8px 0' }}>
          {selectedAsset} Price
        </h4>
        <div style={{
          fontSize: '36px',
          fontWeight: '900',
          marginBottom: '8px',
          letterSpacing: '-0.02em',
          color: '#0F172A'
        }}>
          {formatCurrency(getCurrentPrice())}
        </div>
        {selectedAsset === 'BTC' && marketData && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span style={{
              color: marketData.usd_24h_change >= 0 ? '#10B981' : '#EF4444',
              fontSize: '16px',
              fontWeight: '700'
            }}>
              {marketData.usd_24h_change >= 0 ? '↗' : '↘'} {Math.abs(marketData.usd_24h_change).toFixed(2)}%
            </span>
            <span style={{
              color: '#64748B',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              24h
            </span>
          </div>
        )}
        {selectedAsset !== 'BTC' && stockData[selectedAsset] && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span style={{
              color: stockData[selectedAsset].change >= 0 ? '#10B981' : '#EF4444',
              fontSize: '16px',
              fontWeight: '700'
            }}>
              {stockData[selectedAsset].change >= 0 ? '↗' : '↘'} {Math.abs(stockData[selectedAsset].change).toFixed(2)}%
            </span>
            <span style={{
              color: '#64748B',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              24h
            </span>
          </div>
        )}
      </div>

      {/* Asset List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: '0 0 16px 0' }}>
          All Assets
        </h4>
        {assets.map((asset) => {
          const price = asset.symbol === 'BTC' ? marketData?.usd : stockData[asset.symbol]?.price
          const change = asset.symbol === 'BTC' ? marketData?.usd_24h_change : stockData[asset.symbol]?.change
          
          return (
            <div key={asset.symbol} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: selectedAsset === asset.symbol 
                ? 'rgba(6, 182, 212, 0.1)' 
                : 'rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              border: selectedAsset === asset.symbol 
                ? '1px solid rgba(6, 182, 212, 0.2)'
                : '1px solid rgba(6, 182, 212, 0.1)',
              transition: 'all 0.2s ease'
            }}>
              <div>
                <h5 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                  {asset.symbol}
                </h5>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                  {asset.name}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                  {formatCurrency(price || 0)}
                </div>
                {change !== undefined && (
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: change >= 0 ? '#10B981' : '#EF4444'
                  }}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Custody Component
function Custody({ portfolio, onMultisigApprove }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="slide-up">
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{
          fontSize
