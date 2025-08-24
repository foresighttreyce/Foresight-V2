import { useState } from 'react'
import Head from 'next/head'

export default function ForesightEnterprise() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(true)

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Head>
        <title>Foresight Enterprise™ - Bitcoin Treasury Management</title>
        <meta name="description" content="Bitcoin Treasury Onboarding & Management Portal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1420]">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-[#2B3240] bg-white dark:bg-[#0F1420]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#FF5E1A] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Foresight Enterprise™</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">by Foresight Capital</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Sandbox</span>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">A</span>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Admin User</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white dark:bg-[#0F1420] border-b border-gray-200 dark:border-[#2B3240]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
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
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-[#FF5E1A] text-[#FF5E1A]'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
        .dark {
          color-scheme: dark;
        }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
      `}</style>
    </div>
  )
}

// Dashboard Component
function Dashboard() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Treasury Dashboard</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Executive overview of your Bitcoin treasury position</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total BTC" value="1,234.5678" unit="BTC" change={5.2} />
        <KPICard title="USD Value" value="$54,321,000" change={-2.1} />
        <KPICard title="Cost Basis" value="$48,500,000" />
        <KPICard title="Unrealized P/L" value="$5,821,000" change={12.0} />
      </div>

      {/* Charts and Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1A1D23] rounded-2xl p-6 border border-gray-200 dark:border-[#2B3240]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance vs Benchmarks</h3>
          <div className="h-64 bg-gray-50 dark:bg-[#0F1420] rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <p className="text-gray-600 dark:text-gray-400">BTC: +127% YTD</p>
              <p className="text-gray-600 dark:text-gray-400">S&P 500: +18% YTD</p>
              <p className="text-gray-600 dark:text-gray-400">Gold: +8% YTD</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1D23] rounded-2xl p-6 border border-gray-200 dark:border-[#2B3240]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Metrics</h3>
          <div className="space-y-4">
            <RiskMetric label="30d Volatility" value="68.5%" />
            <RiskMetric label="Max Drawdown" value="22.1%" />
            <RiskMetric label="VaR (90%)" value="$2.1M" />
            <RiskMetric label="Hedging Coverage" value="0%" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white dark:bg-[#1A1D23] rounded-2xl p-6 border border-gray-200 dark:border-[#2B3240]">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Trade Activity</h3>
        <div className="space-y-3">
          <TradeRow type="BUY" amount="$1,000,000" btc="23.45 BTC" status="Executed" time="2 hours ago" />
          <TradeRow type="SELL" amount="$500,000" btc="11.73 BTC" status="Pending" time="1 day ago" />
          <TradeRow type="BUY" amount="$2,000,000" btc="48.92 BTC" status="Executed" time="3 days ago" />
        </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, unit, change }) {
  return (
    <div className="bg-white dark:bg-[#1A1D23] rounded-2xl p-6 border border-gray-200 dark:border-[#2B3240]">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        {unit && <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">{unit}</p>}
      </div>
      {change && (
        <p className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? '+' : ''}{change}% 24h
        </p>
      )}
    </div>
  )
}

function RiskMetric({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}

function TradeRow({ type, amount, btc, status, time }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-[#2B3240] last:border-0">
      <div className="flex items-center space-x-3">
        <span className={`px-2 py-1 text-xs font-medium rounded ${
          type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {type}
        </span>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{amount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{btc}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${
          status === 'Executed' ? 'text-green-600' : 'text-yellow-600'
        }`}>{status}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
      </div>
    </div>
  )
}

// Other Components (simplified for demo)
function Onboarding() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Corporate Bitcoin Onboarding</h2>
      <div className="bg-white dark:bg-[#1A1D23] rounded-2xl p-8 border border-gray-200 dark:border-[#2B3240]">
        <div className="space-y-6">
          <OnboardingStep number="1" title="Company KYC/KYB" status="completed" />
          <OnboardingStep number="2" title="Banking Rails Setup" status="completed" />
          <OnboardingStep number="3" title="Custody Configuration" status="current" />
          <OnboardingStep number="4" title="Accounting Integration" status="pending" />
          <OnboardingStep number="5" title="Policy Review & Sign" status="pending" />
        </div>
      </div>
    </div>
  )
}

function OnboardingStep({ number, title, status }) {
  const getStatusColor = () => {
    switch(status) {
      case 'completed': return 'bg-green-500'
      case 'current': return 'bg-[#FF5E1A]'
      default: return 'bg-gray-300'
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getStatusColor()}`}>
        {status === 'completed' ? '✓' : number}
      </div>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{status}</p>
      </div>
    </div>
  )
}

function Policy() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Treasury Policy</h2>
      <div className="bg-white dark:bg-[#1A1D23] rounded-2xl p-8 border border-gray-200 dark:border-[#2B3240]">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Current Policy (v2.1)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PolicyItem label="Target Allocation" value="25% of corporate cash" />
          <PolicyItem label="Sweep Cadence" value="Monthly" />
          <PolicyItem label="Rebalance Bands" value="15% - 35%" />
          <PolicyItem label="Approval Quorum" value="2 of 3 signers" />
          <PolicyItem label="Max Single Trade" value="$5,000,000" />
          <PolicyItem label="Emergency Override" value="CFO + CEO" />
        </div>
      </div>
    </div>
  )
}

function PolicyItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

function Trade() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Trade Execution</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1A1D23] rounded-2xl p-8 border border-gray-200 dark:border-[#2B3240]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">New Trade</h3>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button className="flex-1 py-3 px-4 bg-green-100 text-green-800 rounded-lg font-medium">Buy Bitcoin</button>
              <button className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-lg font-medium">Sell Bitcoin</button>
            </div>
            <input 
              type="text" 
              placeholder="Amount ($)"
              className="w-full p-3 border border-gray-300 dark:border-[#2B3240] rounded-lg bg-white dark:bg-[#0F1420] text-gray-900 dark:text-white"
            />
            <button className="w-full py-3 px-4 bg-[#FF5E1A] text-white rounded-lg font-medium">
              Get Real-Time Quote
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#1A1D23] rounded-2xl p-8 border border-gray-200 dark:border-[#2B3240]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Market Data</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Bitcoin Price</span>
              <span className="font-medium text-gray-900 dark:text-white">$43,250</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">24h Change</span>
              <span className="font-medium text-green-600">+2.1%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">24h Volume</span>
              <span className="font-medium text-gray-900 dark:text-white">$28.5B</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Custody() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Custody Management</h2>
      <div className="bg-white dark:bg-[#1A1D23] rounded-2xl p-8 border border-gray-200 dark:border-[#2B3240]">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Cold Storage Wallets</h3>
        <div className="space-y-4">
          <WalletRow name="Primary Cold Storage" balance="1,150.25 BTC" tier="Cold" insured="$45M" />
          <WalletRow name="Operating Wallet" balance="84.33 BTC" tier="Warm" insured="$3.2M" />
          <WalletRow name="Emergency Reserve" balance="0.00 BTC" tier="Cold" insured="$10M" />
        </div>
      </div>
    </div>
  )
}

function WalletRow({ name, balance, tier, insured }) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-[#2B3240] rounded-lg">
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white">{name}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{balance}</p>
      </div>
      <div className="text-right">
        <span className={`px-2 py-1 text-xs rounded ${
          tier === 'Cold' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {tier}
        </span>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Insured: {insured}</p>
      </div>
    </div>
  )
}

function Reporting() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Financial Reporting</h2>
      <div className="bg-white dark:bg-[#1A1D23] rounded-2xl p-8 border border-gray-200 dark:border-[#2B3240]">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Generate CFO Pack</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" defaultChecked />
            <span className="text-gray-700 dark:text-gray-300">Treasury Allocation Summary</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" defaultChecked />
            <span className="text-gray-700 dark:text-gray-300">Performance vs Benchmarks</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" defaultChecked />
            <span className="text-gray-700 dark:text-gray-300">Risk Analytics</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-gray-700 dark:text-gray-300">Board-Ready Charts</span>
          </label>
          <button className="w-full py-3 px-4 bg-[#FF5E1A] text-white rounded-lg font-medium mt-4">
            Generate PDF Report
          </button>
        </div>
      </div>
    </div>
  )
}

function Compliance() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Compliance Overview</h2>
      <div className="bg-white dark:bg-[#1A1D23] rounded-2xl p-8 border border-gray-200 dark:border-[#2B3240]">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Current Status</h3>
        <div className="space-y-4">
          <ComplianceItem item="GAAP Fair Value Measurement" status="Current" />
          <ComplianceItem item="IFRS Digital Asset Reporting" status="Current" />
          <ComplianceItem item="SOX Internal Controls" status="Review Required" />
          <ComplianceItem item="Audit Trail Documentation" status="Current" />
        </div>
      </div>
    </div>
  )
}

function ComplianceItem({ item, status }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700 dark:text-gray-300">{item}</span>
      <span className={`px-2 py-1 text-xs rounded ${
        status === 'Current' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {status}
      </span>
    </div>
  )
}

function Admin() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">System Administration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1A1D23] rounded-2xl p-8 border border-gray-200 dark:border-[#2B3240]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Management</h3>
          <div className="space-y-3">
            <UserRow name="John Smith" role="CFO" status="Active" />
            <UserRow name="Sarah Johnson" role="Treasurer" status="Active" />
            <UserRow name="Mike Chen" role="Analyst" status="Inactive" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#1A1D23] rounded-2xl p-8 border border-gray-200 dark:border-[#2B3240]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">System Settings</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">API Rate Limiting</span>
              <span className="text-green-600">Enabled</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Audit Logging</span>
              <span className="text-green-600">Enabled</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">SSO Integration</span>
              <span className="text-yellow-600">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserRow({ name, role, status }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
      </div>
      <span className={`px-2 py-1 text-xs rounded ${
        status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}>
        {status}
      </span>
    </div>
  )
}
