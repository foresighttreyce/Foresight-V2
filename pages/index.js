import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function ForesightEnterprise() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const [marketData, setMarketData] = useState(null)
  const [loading, setLoading] = useState(true)

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
        // Fallback data
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
    const interval = setInterval(fetchMarketData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Head>
        <title>Foresight Enterprise™ - Bitcoin Treasury Management</title>
        <meta name="description" content="Enterprise Bitcoin Treasury Management Platform" />
        <link href="https://fonts.googleapis.com/css2?family=Circular:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: darkMode 
          ? '#0A0A0A'
          : '#FAFBFC',
        fontFamily: "'Circular', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: darkMode ? '#FFFFFF' : '#222222',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Header - Airbnb Style */}
        <header style={{
          background: darkMode ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '0'
        }}>
          <div style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '80px',
            padding: '0 40px'
          }}>
            {/* Logo Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #FF385C 0%, #E61E4D 50%, #D70266 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: '700',
                boxShadow: '0 8px 32px rgba(255, 56, 92, 0.3)',
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
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: 0,
                  background: darkMode 
                    ? 'linear-gradient(135deg, #FFFFFF 0%, #E5E7EB 100%)'
                    : 'linear-gradient(135deg, #222222 0%, #374151 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}>
                  Foresight Enterprise™
                </h1>
                <p style={{
                  fontSize: '13px',
                  color: darkMode ? '#9CA3AF' : '#6B7280',
                  margin: 0,
                  fontWeight: '500',
                  letterSpacing: '0.01em'
                }}>
                  Treasury Management Platform
                </p>
              </div>
            </div>
            
            {/* Navigation Pills - Airbnb Style */}
            <div style={{
              display: 'flex',
              background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              borderRadius: '32px',
              padding: '4px',
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'}`
            }}>
              {[
                { id: 'dashboard', name: 'Overview', icon: '📊' },
                { id: 'trade', name: 'Trading', icon: '⚡' },
                { id: 'custody', name: 'Custody', icon: '🔐' },
                { id: 'reporting', name: 'Reports', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '28px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: activeTab === tab.id 
                      ? (darkMode ? '#FFFFFF' : '#222222')
                      : 'transparent',
                    color: activeTab === tab.id 
                      ? (darkMode ? '#000000' : '#FFFFFF')
                      : (darkMode ? '#D1D5DB' : '#6B7280'),
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    fontSize: '14px',
                    letterSpacing: '0.01em',
                    boxShadow: activeTab === tab.id 
                      ? (darkMode 
                          ? '0 4px 20px rgba(255, 255, 255, 0.15)' 
                          : '0 4px 20px rgba(0, 0, 0, 0.15)')
                      : 'none',
                    transform: activeTab === tab.id ? 'translateY(-1px)' : 'translateY(0)'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{tab.icon}</span>
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
                background: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                borderRadius: '20px',
                border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`
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
                  fontWeight: '600',
                  color: '#10B981',
                  letterSpacing: '0.02em'
                }}>
                  LIVE
                </span>
              </div>
              
              {/* Theme Toggle */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '22px',
                  background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)'
                  e.target.style.background = darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.background = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'
                }}
              >
                {darkMode ? '🌙' : '☀️'}
              </button>
              
              {/* User Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                  borderRadius: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '16px',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
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
                    border: `3px solid ${darkMode ? '#0A0A0A' : '#FAFBFC'}`
                  }}></div>
                </div>
                <div style={{ display: 'none' }}>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>Treasury Admin</p>
                  <p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#9CA3AF' : '#6B7280' }}>Executive Access</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '40px',
          minHeight: 'calc(100vh - 80px)'
        }}>
          {activeTab === 'dashboard' && <Dashboard darkMode={darkMode} marketData={marketData} loading={loading} />}
          {activeTab === 'trade' && <Trading darkMode={darkMode} marketData={marketData} />}
          {activeTab === 'custody' && <Custody darkMode={darkMode} />}
          {activeTab === 'reporting' && <Reporting darkMode={darkMode} />}
          {activeTab === 'onboarding' && <Onboarding darkMode={darkMode} />}
          {activeTab === 'policy' && <Policy darkMode={darkMode} />}
          {activeTab === 'compliance' && <Compliance darkMode={darkMode} />}
          {activeTab === 'admin' && <Admin darkMode={darkMode} />}
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
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-up {
          animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  )
}

// Dashboard Component with Real Data
function Dashboard({ darkMode, marketData, loading }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y')
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
    return num.toString()
  }

  // Calculate portfolio metrics based on real BTC price
  const portfolioMetrics = marketData ? {
    btcHoldings: 1234.5678,
    currentValue: marketData.usd * 1234.5678,
    costBasis: 48500000,
    unrealizedPL: (marketData.usd * 1234.5678) - 48500000,
    change24h: marketData.usd_24h_change
  } : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="slide-up">
      {/* Hero Section with Real-time Price */}
      <div style={{
        background: darkMode 
          ? 'linear-gradient(135deg, rgba(255, 56, 92, 0.1) 0%, rgba(230, 30, 77, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(255, 56, 92, 0.05) 0%, rgba(230, 30, 77, 0.02) 100%)',
        borderRadius: '24px',
        padding: '48px',
        border: `1px solid ${darkMode ? 'rgba(255, 56, 92, 0.2)' : 'rgba(255, 56, 92, 0.1)'}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255, 56, 92, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)'
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '800',
              margin: 0,
              background: darkMode 
                ? 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)'
                : 'linear-gradient(135deg, #111827 0%, #374151 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
              lineHeight: '1.1'
            }}>
              Treasury Command Center
            </h1>
            <p style={{
              fontSize: '20px',
              color: darkMode ? '#D1D5DB' : '#6B7280',
              margin: '12px 0 0 0',
              fontWeight: '500',
              lineHeight: '1.4'
            }}>
              Real-time Bitcoin treasury management with institutional-grade security
            </p>
          </div>

          {/* Live BTC Price Display */}
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '24px',
              background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
              borderRadius: '16px',
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'}`
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: `3px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderTop: `3px solid ${darkMode ? '#FFFFFF' : '#000000'}`,
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{ fontSize: '16px', fontWeight: '500' }}>Loading live market data...</span>
            </div>
          ) : marketData && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              padding: '24px',
              background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
              borderRadius: '16px',
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
              backdropFilter: 'blur(12px)'
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: '800',
                color: darkMode ? '#FFFFFF' : '#111827'
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
                  ? (darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)')
                  : (darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'),
                color: marketData.usd_24h_change >= 0 ? '#10B981' : '#EF4444'
              }}>
                <span style={{ fontSize: '16px' }}>
                  {marketData.usd_24h_change >= 0 ? '↗' : '↘'}
                </span>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>
                  {Math.abs(marketData.usd_24h_change).toFixed(2)}%
                </span>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>24h</span>
              </div>
              <div style={{
                fontSize: '12px',
                color: darkMode ? '#9CA3AF' : '#6B7280',
                fontWeight: '500'
              }}>
                Live Bitcoin Price • Updated every 30s
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio KPIs - Airbnb Card Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        <KPICard 
          title="Bitcoin Holdings" 
          value="1,234.5678" 
          unit="BTC" 
          subtitle="Current portfolio allocation"
          icon="₿"
          darkMode={darkMode}
          primary={true}
        />
        <KPICard 
          title="Portfolio Value" 
          value={portfolioMetrics ? formatCurrency(portfolioMetrics.currentValue) : formatCurrency(54321000)}
          subtitle="Real-time market value"
          change={portfolioMetrics ? portfolioMetrics.change24h : 2.34}
          icon="💰"
          darkMode={darkMode}
        />
        <KPICard 
          title="Cost Basis" 
          value={formatCurrency(48500000)}
          subtitle="Total invested capital"
          icon="📊"
          darkMode={darkMode}
        />
        <KPICard 
          title="Unrealized P/L" 
          value={portfolioMetrics ? formatCurrency(portfolioMetrics.unrealizedPL) : formatCurrency(5821000)}
          subtitle="Mark-to-market gains"
          change={12.0}
          icon="📈"
          darkMode={darkMode}
        />
      </div>

      {/* Charts and Analytics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px'
      }}>
        {/* Performance Chart */}
        <div style={{
          background: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: '24px',
          padding: '32px',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
          backdropFilter: 'blur(12px)'
        }} className="hover-lift">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              Performance Analytics
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['1M', '3M', '1Y', 'ALL'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedTimeframe(period)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    background: selectedTimeframe === period 
                      ? '#FF385C'
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
                    color: selectedTimeframe === period 
                      ? '#FFFFFF'
                      : (darkMode ? '#D1D5DB' : '#6B7280')
                  }}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{
            height: '320px',
            background: darkMode 
              ? 'linear-gradient(135deg, rgba(255, 56, 92, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(255, 56, 92, 0.02) 0%, rgba(102, 126, 234, 0.02) 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Simulated Chart */}
            <div style={{ textAlign: 'center', zIndex: 2 }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📈</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '32px',
                textAlign: 'center',
                marginTop: '24px'
              }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#FF385C', marginBottom: '8px' }}>+127%</div>
                  <div style={{ fontSize: '14px', color: darkMode ? '#9CA3AF' : '#6B7280', fontWeight: '500' }}>Bitcoin YTD</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#667EEA', marginBottom: '8px' }}>+18%</div>
                  <div style={{ fontSize: '14px', color: darkMode ? '#9CA3AF' : '#6B7280', fontWeight: '500' }}>S&P 500 YTD</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#F59E0B', marginBottom: '8px' }}>+8%</div>
                  <div style={{ fontSize: '14px', color: darkMode ? '#9CA3AF' : '#6B7280', fontWeight: '500' }}>Gold YTD</div>
                </div>
              </div>
            </div>
            
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.3,
              background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${darkMode ? 'ffffff' : '000000'}' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
        </div>

        {/* Risk & Market Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Risk Metrics */}
          <div style={{
            background: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: '24px',
            padding: '32px',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
            backdropFilter: 'blur(12px)'
          }} className="hover-lift">
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '24px',
              letterSpacing: '-0.01em'
            }}>
              Risk Dashboard
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <RiskMetric label="30d Volatility" value="68.5%" level="high" darkMode={darkMode} />
              <RiskMetric label="Max Drawdown" value="22.1%" level="medium" darkMode={darkMode} />
              <RiskMetric label="VaR (90%)" value="$2.1M" level="medium" darkMode={darkMode} />
              <RiskMetric label="Sharpe Ratio" value="1.24" level="low" darkMode={darkMode} />
            </div>
          </div>

          {/* Market Info */}
          {marketData && (
            <div style={{
              background: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.9)',
              borderRadius: '24px',
              padding: '32px',
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
              backdropFilter: 'blur(12px)'
            }} className="hover-lift">
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '24px',
                letterSpacing: '-0.01em'
              }}>
                Market Overview
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: darkMode ? '#9CA3AF' : '#6B7280', fontWeight: '500' }}>Market Cap</span>
                  <span style={{ fontSize: '16px', fontWeight: '700' }}>{formatNumber(marketData.usd_market_cap)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: darkMode ? '#9CA3AF' : '#6B7280', fontWeight: '500' }}>24h Volume</span>
                  <span style={{ fontSize: '16px', fontWeight: '700' }}>{formatNumber(marketData.usd_24h_vol)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: darkMode ? '#9CA3AF' : '#6B7280', fontWeight: '500' }}>Fear & Greed</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#F59E0B' }}>72 (Greed)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{
        background: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.9)',
        borderRadius: '24px',
        padding: '32px',
        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
        backdropFilter: 'blur(12px)'
      }} className="hover-lift">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            Recent Activity
          </h3>
          <button style={{
            padding: '8px 16px',
            background: 'transparent',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '12px',
            color: darkMode ? '#D1D5DB' : '#6B7280',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            View All
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TransactionRow type="BUY" amount="$1,000,000" btc="23.45 BTC" status="Executed" time="2 hours ago" darkMode={darkMode} />
          <TransactionRow type="SELL" amount="$500,000" btc="11.73 BTC" status="Pending" time="1 day ago" darkMode={darkMode} />
          <TransactionRow type="BUY" amount="$2,000,000" btc="48.92 BTC" status="Executed" time="3 days ago" darkMode={darkMode} />
        </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, unit, subtitle, change, icon, darkMode, primary = false }) {
  return (
    <div style={{
      background: primary 
        ? (darkMode 
            ? 'linear-gradient(135deg, rgba(255, 56, 92, 0.1) 0%, rgba(230, 30, 77, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(255, 56, 92, 0.05) 0%, rgba(230, 30, 77, 0.02) 100%)')
        : (darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.9)'),
      borderRadius: '20px',
      padding: '28px',
      border: primary 
        ? `1px solid ${darkMode ? 'rgba(255, 56, 92, 0.2)' : 'rgba(255, 56, 92, 0.1)'}`
        : `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
      backdropFilter: 'blur(12px)',
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
          background: 'radial-gradient(circle, rgba(255, 56, 92, 0.1) 0%, transparent 70%)',
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
            background: primary ? '#FF385C' : (darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'),
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: primary ? 'white' : 'inherit'
          }}>
            {icon}
          </div>
          {change && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              background: change >= 0 
                ? (darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)')
                : (darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'),
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
            fontWeight: '500',
            color: darkMode ? '#9CA3AF' : '#6B7280',
            marginBottom: '8px',
            letterSpacing: '0.01em'
          }}>
            {title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <p style={{
              fontSize: '32px',
              fontWeight: '800',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: '1'
            }}>
              {value}
            </p>
            {unit && (
              <p style={{
                fontSize: '18px',
                color: darkMode ? '#9CA3AF' : '#6B7280',
                fontWeight: '600',
                margin: 0
              }}>
                {unit}
              </p>
            )}
          </div>
          <p style={{
            fontSize: '13px',
            color: darkMode ? '#9CA3AF' : '#6B7280',
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

function RiskMetric({ label, value, level, darkMode }) {
  const levelConfig = {
    low: { color: '#10B981', bg: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' },
    medium: { color: '#F59E0B', bg: darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' },
    high: { color: '#EF4444', bg: darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)' }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      borderRadius: '12px',
      border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
    }}>
      <div>
        <p style={{
          fontSize: '14px',
          fontWeight: '500',
          color: darkMode ? '#D1D5DB' : '#374151',
          margin: 0,
          marginBottom: '4px'
        }}>
          {label}
        </p>
        <p style={{
          fontSize: '18px',
          fontWeight: '700',
          margin: 0
        }}>
          {value}
        </p>
      </div>
      <div style={{
        padding: '4px 8px',
        borderRadius: '8px',
        fontSize: '10px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        background: levelConfig[level].bg,
        color: levelConfig[level].color
      }}>
        {level}
      </div>
    </div>
  )
}

function TransactionRow({ type, amount, btc, status, time, darkMode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px',
      background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      borderRadius: '16px',
      border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.target.style.background = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'
      e.target.style.transform = 'translateY(-2px)'
    }}
    onMouseLeave={(e) => {
      e.target.style.background = darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'
      e.target.style.transform = 'translateY(0)'
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
          background: type === 'BUY' 
            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
        }}>
          {type === 'BUY' ? '↗' : '↘'}
        </div>
        <div>
          <p style={{
            fontSize: '16px',
            fontWeight: '700',
            margin: 0,
            marginBottom: '4px'
          }}>
            {amount}
          </p>
          <p style={{
            fontSize: '14px',
            color: darkMode ? '#9CA3AF' : '#6B7280',
            margin: 0,
            fontWeight: '500'
          }}>
            {btc}
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
          fontWeight: '600',
          background: status === 'Executed' 
            ? (darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)')
            : (darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)'),
          color: status === 'Executed' ? '#10B981' : '#F59E0B',
          marginBottom: '4px'
        }}>
          {status === 'Executed' ? '✓' : '⏳'} {status}
        </div>
        <p style={{
          fontSize: '12px',
          color: darkMode ? '#9CA3AF' : '#6B7280',
          margin: 0,
          fontWeight: '500'
        }}>
          {time}
        </p>
      </div>
    </div>
  )
}

// Trading Component
function Trading({ darkMode, marketData }) {
  const [selectedSide, setSelectedSide] = useState('BUY')
  const [amount, setAmount] = useState('')
  const [hasQuote, setHasQuote] = useState(false)

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
    }
  }

  const estimatedBTC = amount && marketData ? (parseFloat(amount) / marketData.usd).toFixed(6) : '0.000000'
  const fees = amount ? (parseFloat(amount) * 0.005).toFixed(2) : '0.00' // 0.5% fee

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="slide-up">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '800',
          margin: 0,
          background: darkMode 
            ? 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)'
            : 'linear-gradient(135deg, #111827 0%, #374151 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em',
          marginBottom: '16px'
        }}>
          Professional Trading Desk
        </h1>
        <p style={{
          fontSize: '20px',
          color: darkMode ? '#D1D5DB' : '#6B7280',
          margin: 0,
          fontWeight: '500'
        }}>
          Institutional-grade Bitcoin execution with real-time pricing
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
          background: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: '24px',
          padding: '32px',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
          backdropFilter: 'blur(12px)'
        }} className="hover-lift">
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '32px',
            letterSpacing: '-0.01em'
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
              onClick={() => setSelectedSide('BUY')}
              style={{
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                background: selectedSide === 'BUY' 
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
                color: selectedSide === 'BUY' ? 'white' : (darkMode ? '#D1D5DB' : '#6B7280'),
                boxShadow: selectedSide === 'BUY' ? '0 8px 32px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              🔥 Buy Bitcoin
            </button>
            <button
              onClick={() => setSelectedSide('SELL')}
              style={{
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                background: selectedSide === 'SELL' 
                  ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                  : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
                color: selectedSide === 'SELL' ? 'white' : (darkMode ? '#D1D5DB' : '#6B7280'),
                boxShadow: selectedSide === 'SELL' ? '0 8px 32px rgba(239, 68, 68, 0.3)' : 'none'
              }}
            >
              📉 Sell Bitcoin
            </button>
          </div>

          {/* Amount Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: darkMode ? '#D1D5DB' : '#374151',
              marginBottom: '8px'
            }}>
              Trade Amount (USD)
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '')
                setAmount(value)
                setHasQuote(false)
              }}
              placeholder="1,000,000"
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '16px',
                border: `2px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                color: darkMode ? 'white' : '#1F2937',
                fontSize: '18px',
                fontWeight: '600',
                fontFamily: 'inherit',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#FF385C'
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 56, 92, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Quote Section */}
          {hasQuote && amount && marketData && (
            <div style={{
              padding: '20px',
              background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '16px',
              marginBottom: '24px',
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '700',
                marginBottom: '16px',
                color: selectedSide === 'BUY' ? '#10B981' : '#EF4444'
              }}>
                {selectedSide} Quote
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: darkMode ? '#9CA3AF' : '#6B7280', fontSize: '14px' }}>Est. Bitcoin:</span>
                  <span style={{ fontWeight: '700', fontSize: '16px' }}>{estimatedBTC} BTC</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: darkMode ? '#9CA3AF' : '#6B7280', fontSize: '14px' }}>Fees (0.5%):</span>
                  <span style={{ fontWeight: '700', fontSize: '16px' }}>${fees}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
                  <span style={{ color: darkMode ? '#D1D5DB' : '#374151', fontSize: '14px', fontWeight: '600' }}>Net Total:</span>
                  <span style={{ fontWeight: '700', fontSize: '18px' }}>${(parseFloat(amount) + parseFloat(fees)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={getQuote}
              disabled={!amount}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                cursor: amount ? 'pointer' : 'not-allowed',
                fontWeight: '700',
                fontSize: '16px',
                background: amount 
                  ? (darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)')
                  : (darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'),
                color: amount ? (darkMode ? '#FFFFFF' : '#1F2937') : (darkMode ? '#6B7280' : '#9CA3AF'),
                transition: 'all 0.2s ease',
                opacity: amount ? 1 : 0.5
              }}
            >
              ⚡ Get Real-Time Quote
            </button>
            
            {hasQuote && (
              <button
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '16px',
                  background: selectedSide === 'BUY' 
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
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
          background: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: '24px',
          padding: '32px',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
          backdropFilter: 'blur(12px)'
        }} className="hover-lift">
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '32px',
            letterSpacing: '-0.01em'
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
                background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '16px'
              }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: '800',
                  marginBottom: '8px',
                  letterSpacing: '-0.02em'
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
                    color: darkMode ? '#9CA3AF' : '#6B7280',
                    fontSize: '14px',
                    fontWeight: '500'
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
                  background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
                    ${(marketData.usd_24h_vol / 1e9).toFixed(1)}B
                  </div>
                  <div style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : '#6B7280', fontWeight: '500' }}>
                    24h Volume
                  </div>
                </div>
                <div style={{
                  padding: '20px',
                  background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
                    ${(marketData.usd_market_cap / 1e12).toFixed(1)}T
                  </div>
                  <div style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : '#6B7280', fontWeight: '500' }}>
                    Market Cap
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: darkMode ? '#9CA3AF' : '#6B7280' }}>Fear & Greed Index</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#F59E0B' }}>72 (Greed)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: darkMode ? '#9CA3AF' : '#6B7280' }}>Market Dominance</span>
                  <span style={{ fontSize: '16px', fontWeight: '700' }}>52.4%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: darkMode ? '#9CA3AF' : '#6B7280' }}>Next Halving</span>
                  <span style={{ fontSize: '16px', fontWeight: '700' }}>~2028</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: `3px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderTop: `3px solid ${darkMode ? '#FFFFFF' : '#000000'}`,
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: darkMode ? '#9CA3AF' : '#6B7280', fontSize: '16px' }}>
                Loading market data...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Simplified placeholder components for other tabs
function Custody({ darkMode }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 40px' }} className="slide-up">
      <div style={{
        background: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.9)',
        borderRadius: '24px',
        padding: '60px',
        maxWidth: '600px',
        margin: '0 auto',
        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ fontSize: '80px', marginBottom: '24px' }}>🔐</div>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '800',
          marginBottom: '16px',
          letterSpacing: '-0.02em'
        }}>
          Multi-Signature Custody
        </h2>
        <p style={{
          fontSize: '18px',
          color: darkMode ? '#D1D5DB' : '#6B7280',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          Bank-grade security with institutional insurance coverage.<br/>
          Hardware security modules and 24/7 monitoring.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          marginTop: '40px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>1,150.25</div>
            <div style={{ fontSize: '14px', color: darkMode ? '#9CA3AF' : '#6B7280' }}>BTC Secured</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛡️</div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>$45M</div>
            <div style={{ fontSize: '14px', color: darkMode ? '#9CA3AF' : '#6B7280' }}>Insured</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>3/5</div>
            <div style={{ fontSize: '14px', color: darkMode ? '#9CA3AF' : '#6B7280' }}>Multi-Sig</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Reporting({ darkMode }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 40px' }} className="slide-up">
      <div style={{
        background: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.9)',
        borderRadius: '24px',
        padding: '60px',
        maxWidth: '600px',
        margin: '0 auto',
        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ fontSize: '80px', marginBottom: '24px' }}>📊</div>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '800',
          marginBottom: '16px',
          letterSpacing: '-0.02em'
        }}>
          Executive Reporting
        </h2>
        <p style={{
          fontSize: '18px',
          color: darkMode ? '#D1D5DB' : '#6B7280',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          Board-ready analytics and compliance documentation.<br/>
          Automated CFO packs and audit trail exports.
        </p>
        <button style={{
          padding: '16px 32px',
          background: '#FF385C',
          color: 'white',
          border: 'none',
          borderRadius: '16px',
          fontWeight: '700',
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 8px 32px rgba(255, 56, 92, 0.3)'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          Generate Monthly CFO Pack
        </button>
      </div>
    </div>
  )
}

// Add other placeholder components as needed...
function Onboarding({ darkMode }) {
  return <div style={{ textAlign: 'center', padding: '80px 40px', fontSize: '24px' }}>Onboarding Wizard - Coming Soon</div>
}

function Policy({ darkMode }) {
  return <div style={{ textAlign: 'center', padding: '80px 40px', fontSize: '24px' }}>Treasury Policy Management - Coming Soon</div>
}

function Compliance({ darkMode }) {
  return <div style={{ textAlign: 'center', padding: '80px 40px', fontSize: '24px' }}>Compliance Dashboard - Coming Soon</div>
}

function Admin({ darkMode }) {
  return <div style={{ textAlign: 'center', padding: '80px 40px', fontSize: '24px' }}>Admin Panel - Coming Soon</div>
}

// Add spin animation for loading
const spinKeyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`
