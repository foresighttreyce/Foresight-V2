import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function ForesightEnterprise() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(true)

  return (
    <>
      <Head>
        <title>Foresight Enterprise™ - Bitcoin Treasury Management</title>
        <meta name="description" content="Professional Bitcoin Treasury Management Portal" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: darkMode 
          ? 'linear-gradient(135deg, #0F1420 0%, #1a1d29 50%, #0F1420 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: darkMode ? '#ffffff' : '#1e293b',
        transition: 'all 0.3s ease'
      }}>
        {/* Header */}
        <header style={{
          background: darkMode ? 'rgba(15, 20, 32, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '0 2rem'
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                boxShadow: '0 10px 25px rgba(255, 107, 53, 0.3)'
              }}>
                ₿
              </div>
              <div>
                <h1 style={{
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  background: darkMode 
                    ? 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)'
                    : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0
                }}>
                  Foresight Enterprise™
                </h1>
                <p style={{
                  fontSize: '0.75rem',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  by Foresight Capital
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                color: darkMode ? '#10b981' : '#059669',
                borderRadius: '2rem',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                <div style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  background: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                Sandbox Mode
              </div>
              
              <button 
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '1rem',
                  background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  transition: 'all 0.2s ease',
                  transform: 'scale(1)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                }}>
                  A
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '0.875rem' }}>Admin User</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: darkMode ? '#94a3b8' : '#64748b' }}>Full Access</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav style={{
          background: darkMode ? 'rgba(15, 20, 32, 0.7)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          position: 'sticky',
          top: '4rem',
          zIndex: 40,
          padding: '0 2rem'
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto'
          }}>
            {[
              { id: 'dashboard', name: 'Dashboard', icon: '📊' },
              { id: 'onboarding', name: 'Onboarding', icon: '🚀' },
              { id: 'policy', name: 'Policy', icon: '📋' },
              { id: 'trade', name: 'Trade', icon: '💱' },
              { id: 'custody', name: 'Custody', icon: '🔒' },
              { id: 'reporting', name: 'Reporting', icon: '📈' },
              { id: 'compliance', name: 'Compliance', icon: '✅' },
              { id: 'admin', name: 'Admin', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: activeTab === tab.id 
                    ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
                    : 'transparent',
                  color: activeTab === tab.id ? 'white' : (darkMode ? '#94a3b8' : '#64748b'),
                  transform: activeTab === tab.id ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: activeTab === tab.id ? '0 10px 25px rgba(255, 107, 53, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                    e.target.style.color = darkMode ? '#ffffff' : '#1e293b'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = 'transparent'
                    e.target.style.color = darkMode ? '#94a3b8' : '#64748b'
                  }
                }}
              >
                <span style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{tab.icon}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap' }}>{tab.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '2rem'
        }}>
          {activeTab === 'dashboard' && <Dashboard darkMode={darkMode} />}
          {activeTab === 'onboarding' && <Onboarding darkMode={darkMode} />}
          {activeTab === 'policy' && <Policy darkMode={darkMode} />}
          {activeTab === 'trade' && <Trade darkMode={darkMode} />}
          {activeTab === 'custody' && <Custody darkMode={darkMode} />}
          {activeTab === 'reporting' && <Reporting darkMode={darkMode} />}
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
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}

// Dashboard Component
function Dashboard({ darkMode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '800',
          background: darkMode 
            ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 50%, #ffffff 100%)'
            : 'linear-gradient(135deg, #1e293b 0%, #3b82f6 50%, #1e293b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 1rem 0'
        }}>
          Treasury Command Center
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: darkMode ? '#94a3b8' : '#64748b',
          maxWidth: '48rem',
          margin: '0 auto'
        }}>
          Professional Bitcoin treasury management with institutional-grade security and compliance
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        <KPICard 
          title="Total Bitcoin Holdings" 
          value="1,234.5678" 
          unit="BTC" 
          change={5.2} 
          trend="up"
          icon="₿"
          darkMode={darkMode}
        />
        <KPICard 
          title="USD Market Value" 
          value="$54,321,000" 
          change={-2.1} 
          trend="down"
          icon="💰"
          darkMode={darkMode}
        />
        <KPICard 
          title="Cost Basis Total" 
          value="$48,500,000" 
          icon="📊"
          darkMode={darkMode}
        />
        <KPICard 
          title="Unrealized P/L" 
          value="$5,821,000" 
          change={12.0} 
          trend="up"
          icon="📈"
          darkMode={darkMode}
        />
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem'
      }}>
        <div style={{
          background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '2rem',
          padding: '2rem',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          boxShadow: darkMode 
            ? '0 25px 50px rgba(0, 0, 0, 0.3)' 
            : '0 25px 50px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0
            }}>
              Performance Analytics
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                YTD
              </button>
              <button style={{
                padding: '0.5rem 1rem',
                background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                color: darkMode ? '#94a3b8' : '#64748b',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                1Y
              </button>
            </div>
          </div>
          
          <div style={{
            height: '20rem',
            background: darkMode 
              ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(247, 147, 30, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(247, 147, 30, 0.05) 100%)',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }} className="float-animation">📈</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2rem',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ff6b35' }}>+127%</div>
                  <div style={{ fontSize: '0.875rem', color: darkMode ? '#94a3b8' : '#64748b' }}>Bitcoin YTD</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>+18%</div>
                  <div style={{ fontSize: '0.875rem', color: darkMode ? '#94a3b8' : '#64748b' }}>S&P 500 YTD</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fbbf24' }}>+8%</div>
                  <div style={{ fontSize: '0.875rem', color: darkMode ? '#94a3b8' : '#64748b' }}>Gold YTD</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '2rem',
          padding: '2rem',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          boxShadow: darkMode 
            ? '0 25px 50px rgba(0, 0, 0, 0.3)' 
            : '0 25px 50px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: '1.5rem'
          }}>
            Risk Dashboard
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <RiskMetric label="30-Day Volatility" value="68.5%" level="high" darkMode={darkMode} />
            <RiskMetric label="Maximum Drawdown" value="22.1%" level="medium" darkMode={darkMode} />
            <RiskMetric label="Value at Risk (90%)" value="$2.1M" level="medium" darkMode={darkMode} />
            <RiskMetric label="Hedging Coverage" value="0%" level="low" darkMode={darkMode} />
          </div>
        </div>
      </div>

      {/* Transaction Activity */}
      <div style={{
        background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '2rem',
        padding: '2rem',
        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        boxShadow: darkMode 
          ? '0 25px 50px rgba(0, 0, 0, 0.3)' 
          : '0 25px 50px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1.5rem'
        }}>
          Recent Transaction Activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TradeRow type="BUY" amount="$1,000,000" btc="23.45 BTC" status="Executed" time="2 hours ago" darkMode={darkMode} />
          <TradeRow type="SELL" amount="$500,000" btc="11.73 BTC" status="Pending" time="1 day ago" darkMode={darkMode} />
          <TradeRow type="BUY" amount="$2,000,000" btc="48.92 BTC" status="Executed" time="3 days ago" darkMode={darkMode} />
          <TradeRow type="BUY" amount="$750,000" btc="17.28 BTC" status="Executed" time="1 week ago" darkMode={darkMode} />
        </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, unit, change, trend, icon, darkMode }) {
  return (
    <div style={{
      background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRadius: '2rem',
      padding: '1.5rem',
      border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      boxShadow: darkMode 
        ? '0 25px 50px rgba(0, 0, 0, 0.3)' 
        : '0 25px 50px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          boxShadow: '0 10px 25px rgba(255, 107, 53, 0.3)'
        }}>
          {icon}
        </div>
        {change && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '2rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            background: trend === 'up' 
              ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)')
              : (darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'),
            color: trend === 'up' ? '#10b981' : '#ef4444'
          }}>
            <span>{trend === 'up' ? '↗' : '↘'}</span>
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          color: darkMode ? '#94a3b8' : '#64748b',
          marginBottom: '0.5rem'
        }}>
          {title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <p style={{
            fontSize: '2rem',
            fontWeight: '700',
            margin: 0
          }}>
            {value}
          </p>
          {unit && (
            <p style={{
              fontSize: '1rem',
              color: darkMode ? '#94a3b8' : '#64748b',
              fontWeight: '500',
              margin: 0
            }}>
              {unit}
            </p>
          )}
        </div>
        {change && (
          <p style={{
            fontSize: '0.875rem',
            color: darkMode ? '#94a3b8' : '#64748b',
            margin: '0.5rem 0 0 0'
          }}>
            24h change
          </p>
        )}
      </div>
    </div>
  )
}

function RiskMetric({ label, value, level, darkMode }) {
  const levelColors = {
    low: { bg: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
    medium: { bg: darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
    high: { bg: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)', text: '#ef4444' }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      borderRadius: '1rem'
    }}>
      <div>
        <p style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          color: darkMode ? '#e2e8f0' : '#334155',
          margin: 0
        }}>
          {label}
        </p>
        <p style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          margin: '0.25rem 0 0 0'
        }}>
          {value}
        </p>
      </div>
      <div style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '2rem',
        fontSize: '0.625rem',
        fontWeight: '600',
        background: levelColors[level].bg,
        color: levelColors[level].text
      }}>
        {level.toUpperCase()}
      </div>
    </div>
  )
}

function TradeRow({ type, amount, btc, status, time, darkMode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem',
      background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      borderRadius: '1rem',
      transition: 'background 0.2s ease'
    }}
    onMouseEnter={(e) => e.target.style.background = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}
    onMouseLeave={(e) => e.target.style.background = darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '700',
          fontSize: '1.25rem',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
          background: type === 'BUY' 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        }}>
          {type === 'BUY' ? '↗' : '↘'}
        </div>
        <div>
          <p style={{
            fontSize: '1.125rem',
            fontWeight: '700',
            margin: 0
          }}>
            {amount}
          </p>
          <p style={{
            fontSize: '0.875rem',
            color: darkMode ? '#94a3b8' : '#64748b',
            margin: 0
          }}>
            {btc}
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '2rem',
          fontSize: '0.75rem',
          fontWeight: '600',
          background: status === 'Executed' 
            ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)')
            : (darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)'),
          color: status === 'Executed' ? '#10b981' : '#f59e0b'
        }}>
          {status === 'Executed' ? '✓' : '⏳'} {status}
        </div>
        <p style={{
          fontSize: '0.75rem',
          color: darkMode ? '#94a3b8' : '#64748b',
          margin: '0.5rem 0 0 0'
        }}>
          {time}
        </p>
      </div>
    </div>
  )
}

// Other simplified components for demo
function Onboarding({ darkMode }) {
  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          background: darkMode 
            ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)'
            : 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          Bitcoin Treasury Onboarding
        </h2>
        <p style={{
          fontSize: '1.25rem',
          color: darkMode ? '#94a3b8' : '#64748b'
        }}>
          Enterprise-grade setup in 5 simple steps
        </p>
      </div>
      
      <div style={{
        background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '2rem',
        padding: '2rem',
        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        boxShadow: darkMode 
          ? '0 25px 50px rgba(0, 0, 0, 0.3)' 
          : '0 25px 50px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <OnboardingStep number="1" title="Company KYC/KYB Verification" status="completed" darkMode={darkMode} />
          <OnboardingStep number="2" title="Banking Rails Integration" status="completed" darkMode={darkMode} />
          <OnboardingStep number="3" title="Custody Provider Setup" status="current" darkMode={darkMode} />
          <OnboardingStep number="4" title="Accounting System Integration" status="pending" darkMode={darkMode} />
          <OnboardingStep number="5" title="Treasury Policy Review" status="pending" darkMode={darkMode} />
        </div>
      </div>
    </div>
  )
}

function OnboardingStep({ number, title, status, darkMode }) {
  const getStatusConfig = () => {
    switch(status) {
      case 'completed': 
        return {
          bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          icon: '✓'
        }
      case 'current': 
        return {
          bg: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
          icon: number
        }
      default: 
        return {
          bg: darkMode ? '#374151' : '#9ca3af',
          icon: number
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      padding: '1.5rem',
      borderRadius: '1rem',
      border: status === 'current' ? '2px solid rgba(255, 107, 53, 0.5)' : `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      background: status === 'current' 
        ? (darkMode ? 'rgba(255, 107, 53, 0.1)' : 'rgba(255, 107, 53, 0.05)')
        : (darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)')
    }}>
      <div style={{
        width: '4rem',
        height: '4rem',
        borderRadius: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.25rem',
        fontWeight: '700',
        background: config.bg,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        {config.icon}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          margin: '0 0 0.5rem 0'
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: darkMode ? '#94a3b8' : '#64748b',
          margin: 0,
          textTransform: 'capitalize'
        }}>
          Status: {status === 'current' ? 'In Progress' : status}
        </p>
      </div>
      {status === 'current' && (
        <button style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '0.75rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          Continue Setup
        </button>
      )}
    </div>
  )
}

// Simplified versions of other components
function Policy({ darkMode }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{
        background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '2rem',
        padding: '3rem',
        maxWidth: '48rem',
        margin: '0 auto',
        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        boxShadow: darkMode 
          ? '0 25px 50px rgba(0, 0, 0, 0.3)' 
          : '0 25px 50px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '1rem'
        }}>
          Treasury Investment Policy
        </h2>
        <p style={{
          fontSize: '1.125rem',
          color: darkMode ? '#94a3b8' : '#64748b',
          marginBottom: '2rem'
        }}>
          Current Policy Version 2.1 - Target allocation: 25% of corporate cash in Bitcoin
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          textAlign: 'left'
        }}>
          <div style={{ padding: '1rem', background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: '1rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎯</div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>Target Allocation</h4>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>25%</p>
          </div>
          <div style={{ padding: '1rem', background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: '1rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📅</div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>Rebalance</h4>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Monthly</p>
          </div>
          <div style={{ padding: '1rem', background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: '1rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✋</div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>Approval</h4>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>2 of 3</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Trade({ darkMode }) {
  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          background: darkMode 
            ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)'
            : 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          Professional Trading Desk
        </h2>
        <p style={{
          fontSize: '1.25rem',
          color: darkMode ? '#94a3b8' : '#64748b'
        }}>
          Institutional-grade Bitcoin execution platform
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem'
      }}>
        <div style={{
          background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '2rem',
          padding: '2rem',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          boxShadow: darkMode 
            ? '0 25px 50px rgba(0, 0, 0, 0.3)' 
            : '0 25px 50px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '2rem'
          }}>
            Execute New Trade
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '1rem',
                fontWeight: '700',
                fontSize: '1.125rem',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
              }}>
                🔥 Buy Bitcoin
              </button>
              <button style={{
                padding: '1rem',
                background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                color: darkMode ? '#94a3b8' : '#64748b',
                border: 'none',
                borderRadius: '1rem',
                fontWeight: '700',
                fontSize: '1.125rem',
                cursor: 'pointer'
              }}>
                📉 Sell Bitcoin
              </button>
            </div>
            
            <input 
              type="text" 
              placeholder="Trade Amount (USD)"
              style={{
                width: '100%',
                padding: '1rem',
                border: `2px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '1rem',
                background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                color: darkMode ? 'white' : '#1e293b',
                fontSize: '1.125rem',
                fontWeight: '500',
                fontFamily: 'inherit'
              }}
            />
            
            <button style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '1rem',
              fontWeight: '700',
              fontSize: '1.125rem',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(255, 107, 53, 0.3)'
            }}>
              ⚡ Get Real-Time Quote
            </button>
          </div>
        </div>
        
        <div style={{
          background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '2rem',
          padding: '2rem',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          boxShadow: darkMode 
            ? '0 25px 50px rgba(0, 0, 0, 0.3)' 
            : '0 25px 50px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '2rem'
          }}>
            Live Market Data
          </h3>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              marginBottom: '0.5rem'
            }}>
              $43,250
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ color: '#10b981', fontSize: '1.125rem', fontWeight: '600' }}>↗ +2.1%</span>
              <span style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>24h</span>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '1rem',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>$28.5B</div>
              <div style={{ fontSize: '0.875rem', color: darkMode ? '#94a3b8' : '#64748b' }}>24h Volume</div>
            </div>
            <div style={{
              background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '1rem',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>$845B</div>
              <div style={{ fontSize: '0.875rem', color: darkMode ? '#94a3b8' : '#64748b' }}>Market Cap</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Other simplified components
function Custody({ darkMode }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Digital Asset Custody</h2>
      <div style={{
        background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
        borderRadius: '2rem',
        padding: '2rem',
        maxWidth: '48rem',
        margin: '0 auto'
      }}>
        <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
          Bank-grade security with institutional insurance coverage
        </p>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
        <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>
          Multi-signature wallets with hardware security modules
        </p>
      </div>
    </div>
  )
}

function Reporting({ darkMode }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Executive Reporting Suite</h2>
      <div style={{
        background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
        borderRadius: '2rem',
        padding: '2rem',
        maxWidth: '48rem',
        margin: '0 auto'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
        <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
          Board-ready analytics and compliance documentation
        </p>
        <button style={{
          padding: '1rem 2rem',
          background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '1rem',
          fontWeight: '700',
          fontSize: '1.125rem',
          cursor: 'pointer'
        }}>
          Generate CFO Report
        </button>
      </div>
    </div>
  )
}

function Compliance({ darkMode }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Regulatory Compliance</h2>
      <div style={{
        background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
        borderRadius: '2rem',
        padding: '2rem',
        maxWidth: '48rem',
        margin: '0 auto'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
          Automated compliance monitoring and audit trail management
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ padding: '1rem', background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem' }}>
            <div style={{ color: '#10b981', fontWeight: '600' }}>GAAP Compliant</div>
          </div>
          <div style={{ padding: '1rem', background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem' }}>
            <div style={{ color: '#10b981', fontWeight: '600' }}>SOX Controls</div>
          </div>
          <div style={{ padding: '1rem', background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem' }}>
            <div style={{ color: '#10b981', fontWeight: '600' }}>Audit Ready</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Admin({ darkMode }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>System Administration</h2>
      <div style={{
        background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
        borderRadius: '2rem',
        padding: '2rem',
        maxWidth: '48rem',
        margin: '0 auto'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚙️</div>
        <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
          Enterprise user management and system configuration
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ padding: '1rem', background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: '1rem' }}>
            <div style={{ fontWeight: '600' }}>5 Active Users</div>
          </div>
          <div style={{ padding: '1rem', background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: '1rem' }}>
            <div style={{ fontWeight: '600' }}>SSO Enabled</div>
          </div>
          <div style={{ padding: '1rem', background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: '1rem' }}>
            <div style={{ fontWeight: '600' }}>Audit Logs</div>
          </div>
        </div>
      </div>
    </div>
  )
}
