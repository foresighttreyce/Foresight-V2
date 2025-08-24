import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function ForesightEnterprise() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [marketData, setMarketData] = useState(null)
  const [stockData, setStockData] = useState({})
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showPortfolioDetail, setShowPortfolioDetail] = useState(false)
  
  const [portfolio, setPortfolio] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('foresight-portfolio')
      if (saved) return JSON.parse(saved)
    }
    return {
      cashUSD: 10000000,
      btcHoldings: 0,
      stockHoldings: { MSTR: 0, STRC: 0, STRK: 0, STRF: 0, STRD: 0 },
      totalValue: 10000000,
      trades: []
    }
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('foresight-portfolio', JSON.stringify(portfolio))
    }
  }, [portfolio])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true')
        const data = await response.json()
        setMarketData(data.bitcoin)
      } catch (error) {
        setMarketData({ usd: 43250, usd_24h_change: 2.34 })
      }
    }
    
    const mockStocks = {
      MSTR: { price: 485.50, change: 8.2 },
      STRC: { price: 52.30, change: -2.1 },
      STRK: { price: 28.90, change: 5.7 },
      STRF: { price: 31.45, change: 3.2 },
      STRD: { price: 19.80, change: -1.8 }
    }
    setStockData(mockStocks)
    fetchData()
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const executeTrade = (asset, side, amount) => {
    const price = asset === 'BTC' ? marketData?.usd : stockData[asset]?.price
    if (!price || !amount) return
    
    const fees = amount * 0.005
    const totalCost = amount + fees
    
    if (side === 'BUY' && portfolio.cashUSD >= totalCost) {
      const quantity = amount / price
      const newTrade = {
        id: Date.now(),
        asset,
        side: 'BUY',
        amount,
        quantity,
        price,
        timestamp: new Date().toISOString()
      }
      
      setPortfolio(prev => ({
        ...prev,
        cashUSD: prev.cashUSD - totalCost,
        btcHoldings: asset === 'BTC' ? prev.btcHoldings + quantity : prev.btcHoldings,
        stockHoldings: asset === 'BTC' ? prev.stockHoldings : {
          ...prev.stockHoldings,
          [asset]: (prev.stockHoldings[asset] || 0) + quantity
        },
        trades: [newTrade, ...prev.trades]
      }))
    }
  }

  return (
    <>
      <Head>
        <title>Foresight Enterprise™</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F0FDFA 0%, #ECFDF5 50%, #A7F3D0 100%)',
        fontFamily: 'Inter, sans-serif'
      }}>
        {/* Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #06B6D4, #10B981)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: '900'
            }}>
              ₿
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>
                Foresight Enterprise™
              </h1>
              <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                Professional Trading Platform
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {['dashboard', 'trade', 'custody', 'reporting'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === tab ? '#06B6D4' : 'transparent',
                  color: activeTab === tab ? 'white' : '#64748B',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              TC
            </div>
            
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '60px',
                right: 0,
                width: '200px',
                background: 'white',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                zIndex: 100
              }}>
                <button
                  onClick={() => {
                    const initial = {
                      cashUSD: 10000000,
                      btcHoldings: 0,
                      stockHoldings: { MSTR: 0, STRC: 0, STRK: 0, STRF: 0, STRD: 0 },
                      totalValue: 10000000,
                      trades: []
                    }
                    setPortfolio(initial)
                    setShowUserMenu(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Reset Demo
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
          {activeTab === 'dashboard' && (
            <Dashboard 
              portfolio={portfolio} 
              marketData={marketData} 
              stockData={stockData}
              formatCurrency={formatCurrency}
              setShowPortfolioDetail={setShowPortfolioDetail}
            />
          )}
          
          {activeTab === 'trade' && (
            <Trading 
              portfolio={portfolio}
              marketData={marketData}
              stockData={stockData}
              executeTrade={executeTrade}
              formatCurrency={formatCurrency}
            />
          )}
          
          {activeTab === 'custody' && <Custody portfolio={portfolio} />}
          {activeTab === 'reporting' && <Reporting portfolio={portfolio} />}
        </main>

        {/* Portfolio Modal */}
        {showPortfolioDetail && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200
          }}>
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ margin: 0 }}>Portfolio Breakdown</h3>
                <button
                  onClick={() => setShowPortfolioDetail(false)}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <strong>Cash: </strong>{formatCurrency(portfolio.cashUSD)}
              </div>
              
              {portfolio.btcHoldings > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Bitcoin: </strong>{portfolio.btcHoldings.toFixed(6)} BTC
                  ({formatCurrency(portfolio.btcHoldings * (marketData?.usd || 0))})
                </div>
              )}
              
              {Object.entries(portfolio.stockHoldings).map(([symbol, shares]) => {
                if (shares <= 0) return null
                return (
                  <div key={symbol} style={{ marginBottom: '16px' }}>
                    <strong>{symbol}: </strong>{shares.toFixed(2)} shares
                    ({formatCurrency(shares * (stockData[symbol]?.price || 0))})
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function Dashboard({ portfolio, marketData, stockData, formatCurrency, setShowPortfolioDetail }) {
  const totalValue = portfolio.cashUSD + 
    (portfolio.btcHoldings * (marketData?.usd || 0)) +
    Object.entries(portfolio.stockHoldings).reduce((sum, [symbol, shares]) => 
      sum + (shares * (stockData[symbol]?.price || 0)), 0)

  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '56px', fontWeight: '900', marginBottom: '32px' }}>
        Portfolio Command Center
      </h1>
      
      <div
        onClick={() => setShowPortfolioDetail(true)}
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '24px',
          padding: '48px',
          marginBottom: '32px',
          cursor: 'pointer',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h2 style={{ fontSize: '18px', color: '#64748B', margin: '0 0 16px 0' }}>
          Total Portfolio Value
        </h2>
        <div style={{ fontSize: '64px', fontWeight: '900', color: '#0F172A' }}>
          {formatCurrency(totalValue)}
        </div>
        <p style={{ color: '#64748B', margin: '16px 0 0 0' }}>
          Click for detailed breakdown
        </p>
      </div>

      {marketData && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          padding: '32px'
        }}>
          <h3>Live Bitcoin Price</h3>
          <div style={{ fontSize: '48px', fontWeight: '900' }}>
            {formatCurrency(marketData.usd)}
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: marketData.usd_24h_change >= 0 ? '#10B981' : '#EF4444'
          }}>
            {marketData.usd_24h_change >= 0 ? '+' : ''}{marketData.usd_24h_change?.toFixed(2)}% (24h)
          </div>
        </div>
      )}
    </div>
  )
}

function Trading({ portfolio, marketData, stockData, executeTrade, formatCurrency }) {
  const [selectedAsset, setSelectedAsset] = useState('BTC')
  const [amount, setAmount] = useState('')

  const assets = ['BTC', 'MSTR', 'STRC', 'STRK', 'STRF', 'STRD']

  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '32px' }}>
        Trading Desk
      </h1>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>
            Select Asset
          </label>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {assets.map(asset => (
              <button
                key={asset}
                onClick={() => setSelectedAsset(asset)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedAsset === asset ? '#06B6D4' : '#f3f4f6',
                  color: selectedAsset === asset ? 'white' : '#374151',
                  fontWeight: '600'
                }}
              >
                {asset}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>
            Amount (USD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => executeTrade(selectedAsset, 'BUY', parseFloat(amount))}
            style={{
              padding: '12px 24px',
              background: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Buy {selectedAsset}
          </button>
          
          <button
            onClick={() => executeTrade(selectedAsset, 'SELL', parseFloat(amount))}
            style={{
              padding: '12px 24px',
              background: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Sell {selectedAsset}
          </button>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'left' }}>
          <strong>Current Price: </strong>
          {selectedAsset === 'BTC' 
            ? formatCurrency(marketData?.usd || 0)
            : formatCurrency(stockData[selectedAsset]?.price || 0)
          }
        </div>
      </div>
    </div>
  )
}

function Custody({ portfolio }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '32px' }}>
        Custody & Storage
      </h1>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '24px',
        padding: '48px'
      }}>
        <h2>Multi-Signature Cold Storage</h2>
        <p>Your assets are secured with institutional-grade protection</p>
      </div>
    </div>
  )
}

function Reporting({ portfolio }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '32px' }}>
        Reports & Analytics
      </h1>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '24px',
        padding: '48px'
      }}>
        <h2>Trade History</h2>
        <p>Total Trades: {portfolio.trades.length}</p>
        
        {portfolio.trades.slice(0, 5).map(trade => (
          <div key={trade.id} style={{
            padding: '12px',
            margin: '8px 0',
            background: '#f9fafb',
            borderRadius: '8px',
            textAlign: 'left'
          }}>
            <strong>{trade.side} {trade.asset}</strong> - ${trade.amount}
            <br />
            <small>{new Date(trade.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  )
}
