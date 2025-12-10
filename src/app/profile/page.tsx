'use client';
import { User, Plus, Trophy, Target, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, LogOut, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useRouter } from "next/navigation";
import { doTransaction } from '../api/users';

// Redux imports
import { AppDispatch, RootState } from '../app_state/store';
import { useSelector, useDispatch } from "react-redux";
import { updateUserDataAsync } from '../app_state/slices/userData';
import { updateCurrentPage } from '../app_state/slices/pageTracking';
// Component imports (assuming these exist in your codebase)
import HeaderComponent from '../components/newHeader';
import FooterComponent from '../components/footer';
import { depositMoneyApiCall } from '../api/transactions';

export default function ProfilePageRedesign() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { logout } = useAuth();
  
  // Redux state
  const userData = useSelector((state: RootState) => state.userData);
  const currentPage = useSelector((state: RootState) => state.currentPageData.page);
  const stakesData = useSelector((state: RootState) => state.stakesData.stakesList);
  
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  const thisPage = "profile";
  
  // Calculate stats from stakes data
  const stats = {
    totalStakes: stakesData?.length || 0,
    wonStakes: stakesData?.filter(s => s.stakeResult.toLowerCase() === 'won').length || 0,
    lostStakes: stakesData?.filter(s => s.stakeResult.toLowerCase() === 'lost').length || 0,
    pendingStakes: stakesData?.filter(s => s.stakeStatus.toLowerCase() === 'pending').length || 0,
    totalStaked: stakesData?.reduce((sum, s) => sum + s.stakeAmount, 0) || 0,
    totalWon: stakesData?.filter(s => s.stakeResult.toLowerCase() === 'won')
      .reduce((sum, s) => sum + (typeof s.possibleWin === 'number' ? s.possibleWin : parseFloat(s.possibleWin || '0')), 0) || 0,
    winRate: stakesData?.length > 0 
      ? Math.round((stakesData.filter(s => s.stakeResult.toLowerCase() === 'won').length / stakesData.length) * 100) 
      : 0
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(updateUserDataAsync());
        dispatch(updateCurrentPage(thisPage));
      } catch (err) {
        console.error('Failed to load user data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [dispatch]);

  const handleDeposit = async () => {
    if (depositAmount && parseFloat(depositAmount) >= 10) {
      // Handle deposit logic here
      // the api call needs to happne here
      setLoading(true)
      console.log('Depositing:', depositAmount);
      
      const response= await depositMoneyApiCall(Number(depositAmount), 2) // this will make the api call for us 

      setDepositAmount(''); // this is the reseting of the despoit amount
      setShowDepositModal(false);
      setLoading(false)
    }
  };

  const handleWithdraw = () => {
    if (withdrawAmount && parseFloat(withdrawAmount) > 0) {
      // Handle withdraw logic here
      console.log('Withdrawing:', withdrawAmount);
      setWithdrawAmount('');
      setShowWithdrawModal(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const quickDepositAmounts = [50, 100, 200, 500];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F1419]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FED800]"></div>
          <p className="text-gray-400 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0F1419]">
      {/* Fixed Header */}
      <div className="flex-none">
        <HeaderComponent />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-4 pt-4 space-y-4">
          {/* Profile Header Card */}
          <div className="bg-gradient-to-br from-[#1a2633] to-[#16202C] rounded-lg p-6 border border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FED800] to-[#ffd700] rounded-full flex items-center justify-center">
                  <User size={32} className="text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{userData.username}</h2>
                  <p className="text-gray-400 text-sm">{userData.phone}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Edit size={20} className="text-gray-400" />
              </button>
            </div>
            
            {/* Balance Display */}
            <div className="bg-[#23313D] rounded-lg p-4 mt-4">
              <p className="text-gray-400 text-xs uppercase mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-[#FED800]">
                KES {userData.account_balance?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowDepositModal(true)}
              className="bg-[#60991A] hover:bg-[#4d7a15] text-black font-semibold py-4 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <ArrowDownRight size={20} />
              Deposit
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="bg-[#FED800] hover:bg-[#ffd700] text-black font-semibold py-4 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <ArrowUpRight size={20} />
              Withdraw
            </button>
          </div>

          {/* Stats Grid */}
          <div className="bg-[#1a2633] rounded-lg p-4 border border-gray-700">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Trophy className="text-[#FED800]" size={20} />
              Betting Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#23313D] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="text-[#FED800]" size={16} />
                  <p className="text-gray-400 text-xs">Total Bets</p>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalStakes}</p>
              </div>
              
              <div className="bg-[#23313D] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="text-[#60991A]" size={16} />
                  <p className="text-gray-400 text-xs">Win Rate</p>
                </div>
                <p className="text-2xl font-bold text-[#60991A]">{stats.winRate}%</p>
              </div>
              
              <div className="bg-[#23313D] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="text-[#FED800]" size={16} />
                  <p className="text-gray-400 text-xs">Total Staked</p>
                </div>
                <p className="text-lg font-bold text-white">KES {stats.totalStaked.toLocaleString()}</p>
              </div>
              
              <div className="bg-[#23313D] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="text-[#60991A]" size={16} />
                  <p className="text-gray-400 text-xs">Total Won</p>
                </div>
                <p className="text-lg font-bold text-[#60991A]">KES {stats.totalWon.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Win/Loss Breakdown */}
          <div className="bg-[#1a2633] rounded-lg p-4 border border-gray-700">
            <h3 className="text-white font-bold text-lg mb-4">Bet Breakdown</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Won Bets</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-[#23313D] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#60991A] h-full transition-all duration-300"
                      style={{ width: `${stats.totalStakes > 0 ? (stats.wonStakes / stats.totalStakes) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-[#60991A] font-semibold text-sm w-8">{stats.wonStakes}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Lost Bets</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-[#23313D] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-red-500 h-full transition-all duration-300"
                      style={{ width: `${stats.totalStakes > 0 ? (stats.lostStakes / stats.totalStakes) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-red-500 font-semibold text-sm w-8">{stats.lostStakes}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Pending Bets</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-[#23313D] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gray-500 h-full transition-all duration-300"
                      style={{ width: `${stats.totalStakes > 0 ? (stats.pendingStakes / stats.totalStakes) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-400 font-semibold text-sm w-8">{stats.pendingStakes}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 border border-red-500/30"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 animate-in fade-in">
          <div className="bg-[#1a2633] w-full max-w-md rounded-t-2xl p-6 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Deposit Funds</h3>
              <button 
                onClick={() => setShowDepositModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {quickDepositAmounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setDepositAmount(amount.toString())}
                    className="bg-[#23313D] hover:bg-[#2a3643] text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
              
              <input
                type="number"
                placeholder="Enter amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-[#23313D] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FED800]"
              />
              
              <p className="text-xs text-gray-400">Minimum deposit: KES 10</p>
              
              <button
                onClick={handleDeposit}
                disabled={!depositAmount || parseFloat(depositAmount) < 10}
                className="w-full bg-[#60991A] hover:bg-[#4d7a15] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition-colors"
              >
                Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 animate-in fade-in">
          <div className="bg-[#1a2633] w-full max-w-md rounded-t-2xl p-6 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Withdraw Funds</h3>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#23313D] rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-[#FED800]">
                  KES {userData.account_balance?.toLocaleString() || '0'}
                </p>
              </div>
              
              <input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-[#23313D] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FED800]"
              />
              
              <p className="text-xs text-gray-400">Withdrawals are processed within 24 hours</p>
              
              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > (userData.account_balance || 0)}
                className="w-full bg-[#FED800] hover:bg-[#ffd700] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Footer */}
      <div className="flex-none fixed bottom-0 left-0 right-0 z-10">
        <FooterComponent currentPage={currentPage} />
      </div>
    </div>
  );
}