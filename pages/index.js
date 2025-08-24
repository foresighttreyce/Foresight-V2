import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function ForesightEnterprise() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Head>
        <title>Foresight Enterprise™ - Bitcoin Treasury Management</title>
        <meta name="description" content="Professional Bitcoin Treasury Onboarding & Management Portal" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-[#0F1420] dark:via-[#0F1420] dark:to-[#1a1d29] transition-all duration-500">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/80 dark:bg-[#0F1420]/90 border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">₿</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-[#0F1420]"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Foresight Enterprise™
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">by Foresight Capital</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>Sandbox Mode</span>
                </div>
                
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105"
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
                
                <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">A</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-[#0F1420] text-xs flex items-center justify-center">
                      <span className="text-green-800 font-bold">✓</span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Admin User</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Full Access</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="backdrop-blur-xl bg-white/60 dark:bg-[#0F1420]/60 border-b border-slate-200/50 dark:border-slate-700/50 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: '📊', description: 'Overview' },
                { id: 'onboarding', name: 'Onboarding', icon: '🚀', description: 'Setup' },
                { id: 'policy', name: 'Policy', icon: '📋', description: 'Rules' },
                { id: 'trade', name: 'Trade', icon: '💱', description: 'Execute' },
                { id: 'custody', name: 'Custody', icon: '🔒', description: 'Secure' },
                { id: 'reporting', name: 'Reporting', icon: '📈', description: 'Analytics' },
                { id: 'compliance', name: 'Compliance', icon: '✅', description: 'Audit' },
                { id: 'admin', name: 'Admin', icon: '⚙️', description: 'Settings' }
              ].map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex flex-col items-center justify-center py-4 px-4 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200">{tab.icon}</span>
                  <span className="text-xs font-medium whitespace-nowrap">{tab.name}</span>
                  <span className="text-xs opacity-70 hidden lg:block">{tab.description}</span>
                  {activeTab === tab.id && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className={`max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'onboarding' && <Onboarding />}
          {activeTab === 'policy' && <Policy />}
          {activeTab === 'trade' && <Trade />}
          {activeTab === 'custody' && <Custody />}
          {activeTab === 'reporting' && <Reporting />}
          {activeTab === 'compliance' && <Compliance />}
          {activeTab === 'admin' && <Admin />}
        </main>
      </div>

      <style jsx global>{`
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  )
}

// Professional Dashboard Component
function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent mb-4">
          Treasury Command Center
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Professional Bitcoin treasury management with institutional-grade security and compliance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProfessionalKPICard 
          title="Total Bitcoin Holdings" 
          value="1,234.5678" 
          unit="BTC" 
          change={5.2} 
          trend="up"
          icon="₿"
          color="orange"
        />
        <ProfessionalKPICard 
          title="USD Market Value" 
          value="$54,321,000" 
          change={-2.1} 
          trend="down"
          icon="💰"
          color="green"
        />
        <ProfessionalKPICard 
          title="Cost Basis Total" 
          value="$48,500,000" 
          icon="📊"
          color="blue"
        />
        <ProfessionalKPICard 
          title="Unrealized P/L" 
          value="$5,821,000" 
          change={12.0} 
          trend="up"
          icon="📈"
          color="purple"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Analytics</h3>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-medium">YTD</button>
              <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-medium">1Y</button>
            </div>
          </div>
          <div className="h-80 bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-800/30 dark:to-slate-900/30 rounded-2xl flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4 animate-float">📈</div>
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-orange-500">+127%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Bitcoin YTD</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-500">+18%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">S&P 500 YTD</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-500">+8%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Gold YTD</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Risk Dashboard</h3>
          <div className="space-y-6">
            <ProfessionalRiskMetric label="30-Day Volatility" value="68.5%" level="high" />
            <ProfessionalRiskMetric label="Maximum Drawdown" value="22.1%" level="medium" />
            <ProfessionalRiskMetric label="Value at Risk (90%)" value="$2.1M" level="medium" />
            <ProfessionalRiskMetric label="Hedging Coverage" value="0%" level="low" />
          </div>
        </div>
      </div>

      {/* Transaction Activity */}
      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recent Transaction Activity</h3>
        <div className="space-y-4">
          <ProfessionalTradeRow type="BUY" amount="$1,000,000" btc="23.45 BTC" status="Executed" time="2 hours ago" />
          <ProfessionalTradeRow type="SELL" amount="$500,000" btc="11.73 BTC" status="Pending" time="1 day ago" />
          <ProfessionalTradeRow type="BUY" amount="$2,000,000" btc="48.92 BTC" status="Executed" time="3 days ago" />
          <ProfessionalTradeRow type="BUY" amount="$750,000" btc="17.28 BTC" status="Executed" time="1 week ago" />
        </div>
      </div>
    </div>
  )
}

function ProfessionalKPICard({ title, value, unit, change, trend, icon, color }) {
  const colorClasses = {
    orange: 'from-orange-500 to-red-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-indigo-500',
    purple: 'from-purple-500 to-pink-500'
  }

  return (
    <div className="group relative bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        {change && (
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
            trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            <span>{trend === 'up' ? '↗' : '↘'}</span>
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{title}</h3>
        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          {unit && <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">{unit}</p>}
        </div>
        {change && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">24h change</p>
        )}
      </div>
    </div>
  )
}

function ProfessionalRiskMetric({ label, value, level }) {
  const levelColors = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${levelColors[level]}`}>
        {level.toUpperCase()}
      </div>
    </div>
  )
}

function ProfessionalTradeRow({ type, amount, btc, status, time }) {
  return (
    <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-all duration-200">
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ${
          type === 'BUY' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
        }`}>
          {type === 'BUY' ? '↗' : '↘'}
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{amount}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{btc}</p>
        </div>
      </div>
      <div className="text-right">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          status === 'Executed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        }`}>
          {status === 'Executed' ? '✓' : '⏳'} {status}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  )
}

// Enhanced versions of other components would go here...
// For brevity, I'll include simplified versions that maintain the professional styling

function Onboarding() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-4">
          Bitcoin Treasury Onboarding
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Enterprise-grade setup in 5 simple steps
        </p>
      </div>
      
      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
        <div className="space-y-8">
          <OnboardingStep number="1" title="Company KYC/KYB Verification" description="Identity and business verification" status="completed" />
          <OnboardingStep number="2" title="Banking Rails Integration" description="Connect your corporate banking" status="completed" />
          <OnboardingStep number="3" title="Custody Provider Setup" description="Multi-signature wallet configuration" status="current" />
          <OnboardingStep number="4" title="Accounting System Integration" description="NetSuite, QuickBooks, or SAP connection" status="pending" />
          <OnboardingStep number="5" title="Treasury Policy Review" description="Define allocation rules and approvals" status="pending" />
        </div>
      </div>
    </div>
  )
}

function OnboardingStep({ number, title, description, status }) {
  const getStatusElements = () => {
    switch(status) {
      case 'completed': 
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          icon: '✓',
          border: 'border-green-200 dark:border-green-800'
        }
      case 'current': 
        return {
          bg: 'bg-gradient-to-r from-orange-500 to-red-500 animate-pulse',
          icon: number,
          border: 'border-orange-200 dark:border-orange-800'
        }
      default: 
        return {
          bg: 'bg-slate-300 dark:bg-slate-700',
          icon: number,
          border: 'border-slate-200 dark:border-slate-700'
        }
    }
  }

  const statusElements = getStatusElements()

  return (
    <div className={`flex items-center space-x-6 p-6 rounded-2xl border-2 ${statusElements.border} ${
      status === 'current' ? 'bg-orange-50/50 dark:bg-orange-900/10' : 'bg-slate-50/30 dark:bg-slate-800/30'
    }`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg ${statusElements.bg}`}>
        {statusElements.icon}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 mt-1">{description}</p>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-500 mt-2 capitalize">
          Status: {status === 'current' ? 'In Progress' : status}
        </p>
      </div>
      {status === 'current' && (
        <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:scale-105 transition-transform duration-200">
          Continue Setup
        </button>
      )}
    </div>
  )
}

// Simplified versions of other components maintaining professional styling...

function Policy() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-4">
          Treasury Investment Policy
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Institutional governance and risk management framework
        </p>
      </div>
      
      <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Current Policy (Version 2.1)</h3>
          <div className="flex space-x-3">
            <button className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium">
              View History
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium">
              Modify Policy
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PolicyItem label="Target Allocation" value="25%" description="of corporate cash reserves" icon="🎯" />
          <PolicyItem label="Sweep Cadence" value="Monthly" description="automated rebalancing" icon="📅" />
          <PolicyItem label="Allocation Bands" value="15% - 35%" description="min/max boundaries" icon="📊" />
          <PolicyItem label="Approval Quorum" value="2 of 3" description="required signers" icon="✋" />
          <PolicyItem label="Max Single Trade" value="$5M" description="per transaction limit" icon="💰" />
          <PolicyItem label="Emergency Override" value="CFO + CEO" description="bypass mechanism" icon="🚨" />
        </div>
      </div>
    </div>
  )
}

function PolicyItem({ label, value, description, icon }) {
  return (
    <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-6 hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-all duration-200">
      <div className="flex items-center space-x-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <h4 className="font-bold text-slate-900 dark:text-white">{label}</h4>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  )
}

function Trade() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-4">
          Professional Trading Desk
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Institutional-grade Bitcoin execution platform
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Execute New Trade</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform duration-200 shadow-lg">
                🔥 Buy Bitcoin
              </button>
              <button className="py-4 px-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200">
                📉 Sell Bitcoin
              </button>
            </div>
            
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Trade Amount (USD)"
                className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-lg font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-200"
              />
              
              <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Current BTC Price</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">$43,250.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Est. Bitcoin Amount</span>
                  <span className="text-lg font-medium text-slate-700 dark:text-slate-300">-- BTC</span>
                </div>
              </div>
              
              <button className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform duration-200 shadow-lg">
                ⚡ Get Real-Time Quote
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Live Market Data</h3>
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="text-5xl font-bold text-slate-900 dark:text-white mb-2">$43,250</div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-green-500 text-lg font-medium">↗ +2.1%</span>
                <span className="text-slate-500 dark:text-slate-400">24h</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">$28.5B</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">24h Volume</div>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">$845B</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Market Cap</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">24h High</span>
                <span className="font-bold text-slate-900 dark:text-white">$43,890</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">24h Low</span>
                <span className="font-bold text-slate-900 dark:text-white">$42,150</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Fear & Greed Index</span>
                <span className="font-bold text-orange-500">72 (Greed)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Custody() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text
