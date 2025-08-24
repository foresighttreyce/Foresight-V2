import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function ForesightEnterprise() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [marketData, setMarketData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Trading State
  const [portfolio, setPortfolio] = useState({
    cashUSD: 10000000, // $10M starting cash
    btcHoldings: 0,
    totalValue: 10000000,
    unrealizedPL: 0,
    costBasis: 0,
    trades: []
  })

  // Fetch real Bitcoin price data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true')
        const data = await response.json()
        setMarketData(data.bitcoin)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch market data:', error)
        setMarketData({
          usd: 43250,
          usd_24h_change: 2.34,
          usd_market_cap: 845000000000,
          usd_24h_vol: 28500000000
        })
        setLoading(false)
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Update portfolio value when BTC price changes
  useEffect(() => {
    if (marketData && portfolio.btcHoldings > 0) {
      const currentBtcValue = portfolio.btcHoldings * marketData.usd
      const newTotalValue = portfolio.cashUSD + currentBtcValue
      const newUnrealizedPL = currentBtcValue - portfolio.costBasis
      
      setPortfolio(prev => ({
        ...prev,
        totalValue: newTotalValue,
        unrealizedPL: newUnrealizedPL
      }))
    }
  }, [marketData, portfolio.btcHoldings, portfolio.cashUSD, portfolio.costBasis])

  const executeTrade = (side, amountUSD) => {
    if (!marketData) return false

    const currentPrice = marketData.usd
    const btcAmount = amountUSD / currentPrice
    const fees = amountUSD * 0.005 // 0.5% fee
    const totalCost = amountUSD + fees

    if (side === 'BUY') {
      if (portfolio.cashUSD < totalCost) return false // Insufficient funds
      
      const newTrade = {
        id: Date.now(),
        side: 'BUY',
        amountUSD,
        btcAmount,
        price: currentPrice,
        fees,
        timestamp: new Date().toISOString(),
        status: 'Executed'
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
      if (portfolio.btcHoldings < btcAmount) return false // Insufficient BTC
      
      const newTrade = {
        id: Date.now(),
        side: 'SELL',
        amountUSD,
        btcAmount,
        price: currentPrice,
        fees,
        timestamp: new Date().toISOString(),
        status: 'Executed'
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
    
    return false
  }

  return (
    <>
      <Head>
        <title>Foresight Enterprise™ - Bitcoin Treasury Management</title>
        <meta name="description" content="Professional Bitcoin Trading & Treasury Platform" />
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
          {/* Floating Particles */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306B6D4' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            animation: 'float 20s linear infinite'
          }}></div>
          
          {/* Gradient Orbs */}
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
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '5%',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite'
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
                { id: 'dashboard', name: 'Portfolio', icon: 'chart-line' },
                { id: 'trade', name: 'Trading', icon: 'exchange' },
                { id: 'custody', name: 'Custody', icon: 'shield' },
                { id: 'reporting', name: 'Reports', icon: 'document' }
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
              <div style={{
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
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '40px',
          minHeight: 'calc(100vh - 80px)',
          position: 'relative',
          zIndex: 10
        }}>
          {activeTab === 'dashboard' && <Dashboard marketData={marketData} loading={loading} portfolio={portfolio} />}
          {activeTab === 'trade' && <Trading marketData={marketData} portfolio={portfolio} executeTrade={executeTrade} />}
          {activeTab === 'custody' && <Custody portfolio={portfolio} />}
          {activeTab === 'reporting' && <Reporting portfolio={portfolio} />}
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

// Dashboard Component
function Dashboard({ marketData, loading, portfolio }) {
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
            Real-time Bitcoin trading with professional-grade execution
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
          subtitle="Cash + Bitcoin holdings"
          icon="wallet"
          primary={true}
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

      {/* Performance Chart */}
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
          Portfolio Performance
        </h3>
        
        <div style={{
          height: '300px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.02) 0%, rgba(16, 185, 129, 0.02) 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ textAlign: 'center', zIndex: 2 }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>📊</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '32px',
              textAlign: 'center',
              marginTop: '24px'
            }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#06B6D4', marginBottom: '8px' }}>+127%</div>
                <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>Bitcoin YTD</div>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#10B981', marginBottom: '8px' }}>+18%</div>
                <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>S&P 500 YTD</div>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#22C55E', marginBottom: '8px' }}>+8%</div>
                <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>Gold YTD</div>
              </div>
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
              <TradeRow key={trade.id} trade={trade} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KPICard({ title, value, subtitle, change, icon, primary = false }) {
  return (
    <div style={{
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
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }}
    className="hover-lift"
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

function TradeRow({ trade }) {
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
            {formatCurrency(trade.amountUSD)}
          </p>
          <p style={{
            fontSize: '14px',
            color: '#64748B',
            margin: 0,
            fontWeight: '500'
          }}>
            {trade.btcAmount.toFixed(6)} BTC at {formatCurrency(trade.price)}
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: '700',
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#10B981',
          marginBottom: '4px'
        }}>
          ✓ {trade.status}
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

// Trading Component with Full Functionality
function Trading({ marketData, portfolio, executeTrade }) {
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
    if (amount && marketData) {
      setHasQuote(true)
      setTradeResult(null)
    }
  }

  const handleTrade = () => {
    const amountNum = parseFloat(amount)
    const success = executeTrade(selectedSide, amountNum)
    
    if (success) {
      setTradeResult({ success: true, message: `${selectedSide} order executed successfully!` })
      setAmount('')
      setHasQuote(false)
    } else {
      setTradeResult({ 
        success: false, 
        message: selectedSide === 'BUY' ? 'Insufficient cash balance' : 'Insufficient Bitcoin holdings'
      })
    }
    
    setTimeout(() => setTradeResult(null), 3000)
  }

  const estimatedBTC = amount && marketData ? (parseFloat(amount) / marketData.usd) : 0
  const fees = amount ? (parseFloat(amount) * 0.005) : 0
  const maxBuyAmount = portfolio.cashUSD * 0.995 // Account for fees
  const maxSellValueUSD = portfolio.btcHoldings * (marketData?.usd || 0) * 0.995

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
          Execute Bitcoin trades with real-time market data
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
              🔥 Buy Bitcoin
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
              📉 Sell Bitcoin
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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#64748B' }}>Bitcoin Holdings:</span>
              <span style={{ fontWeight: '700', color: '#0F172A' }}>{portfolio.btcHoldings.toFixed(6)} BTC</span>
            </div>
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
                  const maxAmount = selectedSide === 'BUY' ? maxBuyAmount : maxSellValueUSD
                  setAmount(Math.floor(maxAmount).toString())
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
          {hasQuote && amount && marketData && (
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
                {selectedSide} Quote
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: '14px' }}>Est. Bitcoin:</span>
                  <span style={{ fontWeight: '700', fontSize: '16px' }}>{estimatedBTC.toFixed(6)} BTC</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: '14px' }}>Current Price:</span>
                  <span style={{ fontWeight: '700', fontSize: '16px' }}>{formatCurrency(marketData.usd)}</span>
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
              disabled={!amount || !marketData}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                cursor: (amount && marketData) ? 'pointer' : 'not-allowed',
                fontWeight: '700',
                fontSize: '16px',
                background: (amount && marketData) 
                  ? 'rgba(6, 182, 212, 0.1)'
                  : 'rgba(148, 163, 184, 0.1)',
                color: (amount && marketData) ? '#06B6D4' : '#94A3B8',
                transition: 'all 0.2s ease',
                opacity: (amount && marketData) ? 1 : 0.5
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

          {marketData ? (
            <>
              {/* Current Price */}
              <div style={{
                textAlign: 'center',
                marginBottom: '32px',
                padding: '24px',
                background: 'rgba(6, 182, 212, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(6, 182, 212, 0.1)'
              }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: '900',
                  marginBottom: '8px',
                  letterSpacing: '-0.02em',
                  color: '#0F172A'
                }}>
                  {formatCurrency(marketData.usd)}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    color: marketData.usd_24h_change >= 0 ? '#10B981' : '#EF4444',
                    fontSize: '18px',
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
              </div>

              {/* Market Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  padding: '20px',
                  background: 'rgba(6, 182, 212, 0.05)',
                  borderRadius: '16px',
                  textAlign: 'center',
                  border: '1px solid rgba(6, 182, 212, 0.1)'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px', color: '#0F172A' }}>
                    ${(marketData.usd_24h_vol / 1e9).toFixed(1)}B
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                    24h Volume
                  </div>
                </div>
                <div style={{
                  padding: '20px',
                  background: 'rgba(6, 182, 212, 0.05)',
                  borderRadius: '16px',
                  textAlign: 'center',
                  border: '1px solid rgba(6, 182, 212, 0.1)'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px', color: '#0F172A' }}>
                    ${(marketData.usd_market_cap / 1e12).toFixed(1)}T
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                    Market Cap
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>Fear & Greed Index</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#F59E0B' }}>72 (Greed)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>Market Dominance</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>52.4%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>Next Halving</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>~2028</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '3px solid rgba(6, 182, 212, 0.2)',
                borderTop: '3px solid #06B6D4',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#64748B', fontSize: '16px', fontWeight: '600' }}>
                Loading market data...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Simplified components for other tabs
function Custody({ portfolio }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 40px' }} className="slide-up">
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '24px',
        padding: '60px',
        maxWidth: '600px',
        margin: '0 auto',
        border: '1px solid rgba(6, 182, 212, 0.1)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '80px', marginBottom: '24px' }}>🔐</div>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '800',
          marginBottom: '16px',
          color: '#0F172A'
        }}>
          Institutional Custody
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#64748B',
          marginBottom: '32px',
          lineHeight: '1.6',
          fontWeight: '500'
        }}>
          Bank-grade security with institutional insurance coverage and multi-signature protection.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          marginTop: '40px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>{portfolio.btcHoldings.toFixed(2)}</div>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>BTC Secured</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛡️</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>$50M</div>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>Insured</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>3/5</div>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>Multi-Sig</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Reporting({ portfolio }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 40px' }} className="slide-up">
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '24px',
        padding: '60px',
        maxWidth: '600px',
        margin: '0 auto',
        border: '1px solid rgba(6, 182, 212, 0.1)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '80px', marginBottom: '24px' }}>📊</div>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '800',
          marginBottom: '16px',
          color: '#0F172A'
        }}>
          Executive Reporting
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#64748B',
          marginBottom: '32px',
          lineHeight: '1.6',
          fontWeight: '500'
        }}>
          Generate comprehensive reports for compliance, board presentations, and financial analysis.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            padding: '20px',
            background: 'rgba(6, 182, 212, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(6, 182, 212, 0.1)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>{portfolio.trades.length}</div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Total Trades</div>
          </div>
          <div style={{
            padding: '20px',
            background: 'rgba(6, 182, 212, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(6, 182, 212, 0.1)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>100%</div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Compliance</div>
          </div>
        </div>
        <button style={{
          padding: '16px 32px',
          background: 'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '16px',
          fontWeight: '700',
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 8px 32px rgba(6, 182, 212, 0.3)'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          Generate Portfolio Report
        </button>
      </div>
    </div>
  )
}
