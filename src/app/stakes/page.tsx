'use client'
import { useEffect, useMemo, useState } from "react"
import { Trophy, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Share2, Copy, Check, TrendingUp, Target, Award, Calendar, Home as HomeIcon, LayoutDashboard, User } from 'lucide-react'
import HeaderComponent from "../components/newHeader"
import FooterComponent from "../components/footer"
import ProtectedRoute from "../components/protectedRoute"
import GeneratedQrCode from "../components/qrCode"
import { useRouter } from "next/navigation"

// redux store setup
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { RootState } from "../app_state/store"
import { updateCurrentPage } from "../app_state/slices/pageTracking"
import { AppDispatch } from "../app_state/store"
import { setStakesData, StakeInterface } from "../app_state/slices/stakesData"
import { getUserStakesData } from "../api/stakes"

type FilterType = 'all' | 'live' | 'won' | 'lost' | 'pending';

interface FilterState {
    type: FilterType;
}

// Stake Card Component
interface StakeCardProps {
  stake: StakeInterface;
}

function StakeCard({ stake }: StakeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const getStatusBadge = () => {
    const status = stake.stakeStatus.toLowerCase();
    
    if (status === 'pending') {
      return (
        <div className="flex items-center gap-1 bg-gray-600 px-2 py-1 rounded-md text-xs font-bold">
          <Clock size={12} />
          PENDING
        </div>
      );
    }

    const result = stake.stakeResult.toLowerCase();
    if (result === 'won') {
      return (
        <div className="flex items-center gap-1 bg-[#60991A] px-2 py-1 rounded-md text-xs font-bold">
          <CheckCircle size={12} />
          WON
        </div>
      );
    }

    if (result === 'lost') {
      return (
        <div className="flex items-center gap-1 bg-red-600 px-2 py-1 rounded-md text-xs font-bold">
          <XCircle size={12} />
          LOST
        </div>
      );
    }
  };

  const handleCopyCode = () => {
    const inviteCode = `${stake.inviteCode}`;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const isPending = stake.stakeStatus.toLowerCase() === 'pending';
  const potentialWin = stake.possibleWin

  return (
    <div className="bg-[#16202C] rounded-lg border border-gray-700 overflow-hidden mb-3">
      {/* Compact View */}
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">{formatDate(stake.date)}</span> 
          {getStatusBadge()}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate mb-1">{stake.home}</div>
            <div className="text-sm font-medium text-white truncate">{stake.away}</div>
          </div>
          
          {!isPending && (
            <div className="text-right ml-4">
              <div className="text-lg font-bold text-[#FED800]">
                VS
              </div>
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Stake: <span className="text-white font-semibold">KES {stake.stakeAmount}</span></span>
          <span className="text-gray-400">Win: <span className="text-[#60991A] font-semibold">KES {potentialWin}</span></span>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 flex items-center justify-center gap-2 text-[#FED800] text-sm font-medium hover:bg-[#23313D] py-2 rounded-lg transition-colors"
        >
          <span>{expanded ? 'Less' : 'More'}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded View */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-700 pt-3">
          {/* Detailed Info */}
          <div className="bg-[#1a2633] rounded-lg p-3 space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Your Placement</span>
              <span className="text-sm font-semibold text-[#FED800] capitalize">
                {stake.placement}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Stake Amount</span>
              <span className="text-sm font-semibold text-white">KES {stake.stakeAmount}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <span className="text-xs text-gray-400">Potential Win</span>
              <span className="text-base font-bold text-[#60991A]">KES {potentialWin}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Status</span>
              <span className="text-sm font-semibold text-white capitalize">{stake.stakeStatus}</span>
            </div>
            {stake.stakeResult && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Result</span>
                <span className={`text-sm font-semibold capitalize ${
                  stake.stakeResult.toLowerCase() === 'won' ? 'text-[#60991A]' : 'text-red-500'
                }`}>
                  {stake.stakeResult}
                </span>
              </div>
            )}
          </div>

          {/* Share Section - Only for Pending Stakes */}
          {isPending && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="flex-1 bg-[#60991A] hover:bg-[#4d7a15] text-black font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={16} />
                  {showQR ? 'Hide QR' : 'Share'}
                </button>
              </div>

              {showQR && (
                <div className="bg-[#1a2633] rounded-lg p-4 space-y-3">
                  <div className="flex justify-center">
                    <GeneratedQrCode code={`STAKE-${stake.stakeId}`} />
                  </div>

                  {stake.inviteCode && stake.inviteCode !== null ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 text-center">Or share this code:</p>
                      <div className="flex items-center gap-2 bg-[#16202C] rounded-lg p-3">
                        <code className="flex-1 text-[#FED800] font-mono text-sm break-all">
                          {stake.inviteCode}
                        </code>
                        <button
                          onClick={handleCopyCode}
                          className="bg-[#FED800] hover:bg-[#ffd700] text-black p-2 rounded-lg transition-colors shrink-0"
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                      {copied && (
                        <p className="text-xs text-[#60991A] text-center animate-pulse">
                          Code copied!
                        </p>
                      )}
                    </div>
                  ): (
                    <div>
                      <h2 className="text-sm text-red-800">
                        Invite code not available
                      </h2>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function StakesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter()

  // redux data and utilities setup
  const dispatch = useDispatch<AppDispatch>();
  const currentPage = useSelector((state: RootState) => state.currentPageData.page);
  const stakeListData = useSelector((state: RootState) => state.stakesData.stakesList);
  const thisPage = "bets";

  // stake filtering logic
  const [filterState, setFilterState] = useState<FilterState>({
    type: 'all',
  });

  const filterTabs: { id: FilterType; name: string }[] = [
    { id: 'all', name: "All" },
    { id: 'pending', name: "Pending" },
    { id: 'won', name: "Won" },
    { id: 'lost', name: "Lost" }
  ];

  const handleTabClick = (tabId: FilterType) => {
    setFilterState({
      type: tabId
    });
  };

  const handleUseInviteLinkButtonClick = () => {
      router.push('/stakeLinking')
  }

  // I sincierely have no idea what this function does !
  // I guess:
  // isArray checks if the data is an actuall array 
  // so I geess it returns an empty array if one of the conditions listed thereafter is found to be true.
  const filteredStakes = useMemo(() => {
    if (!stakeListData || !Array.isArray(stakeListData) || stakeListData.length === 0) {
      return [];
    }

    let filtered = [...stakeListData];
    
    switch (filterState.type) {
      case 'all':
        return filtered;

      case 'pending':
        return filtered.filter((stake) => stake.stakeStatus.toLowerCase() === 'pending');
      
      case 'won':
        return filtered.filter((stake) => stake.stakeResult.toLowerCase() === 'won');

      case 'lost':
        return filtered.filter((stake) => stake.stakeResult.toLowerCase() === 'lost');

      default:
        return filtered;
    }
  }, [stakeListData, filterState]);

  // Calculate stats
  const stats = {
    totalStakes: stakeListData?.length || 0,
    wonStakes: stakeListData?.filter(s => s.stakeResult.toLowerCase() === 'won').length || 0,
    lostStakes: stakeListData?.filter(s => s.stakeResult.toLowerCase() === 'lost').length || 0,
    pendingStakes: stakeListData?.filter(s => s.stakeStatus.toLowerCase() === 'pending').length || 0,
    totalStaked: stakeListData?.reduce((sum, s) => sum + s.stakeAmount, 0) || 0,
    totalWon: stakeListData?.filter(s => s.stakeResult.toLowerCase() === 'won')
      .reduce((sum, s) => sum + (typeof s.possibleWin === 'number' ? s.possibleWin : parseFloat(s.possibleWin || '0')), 0) || 0,
  };

  useEffect(() => {
    const loadUserStakeData = async () => {
      try {
        setIsLoading(true);
        const stakeData: StakeInterface[] | null = await getUserStakesData();
        
        if (!stakeData) {
          throw new Error(`data returned from api is not defined`);
        }

        dispatch(setStakesData(stakeData));
      } catch (err) {
        console.log(`an error occurred: stake data received from backend is not defined`);
      } finally {
        setIsLoading(false);
      }
    };

    dispatch(updateCurrentPage(thisPage));
    loadUserStakeData();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-[#1a2633] min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FED800]"></div>
          <p className="text-gray-400 text-sm">Loading stakes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#1a2633]">
      {/* Header */}
      <div className="flex-none bg-[#1a2633] px-4 py-4 lg:px-6 z-20">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold lg:text-3xl">
              <span className="text-[#FED800]">bet</span>
              <span className="text-gray-100">yetu</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-[#FED800] text-black font-semibold px-4 py-2 rounded-full text-sm shadow-lg hover:bg-[#ffd700] transition-all lg:text-base">
              Deposit
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:flex-row lg:gap-4 lg:px-6 lg:pt-6 lg:max-w-[1400px] lg:mx-auto lg:w-full">
        
        {/* Left Sidebar - Desktop Only */}
        <div className="hidden lg:block lg:w-[260px] xl:w-[280px] bg-[#16202C] rounded-lg p-4 self-start sticky top-6 h-fit flex-shrink-0">
          {/* Navigation Section */}
          <h3 className="text-gray-200 text-lg font-semibold mb-4">Navigation</h3>
          <div className="flex flex-col gap-2 mb-6">
            <button onClick={() => router.push('/main')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
              <HomeIcon size={20} />
              <span>Home</span>
            </button>
            <button onClick={() => router.push('/stakes')} className="flex items-center gap-3 p-3 rounded-lg bg-[#FED800] text-black font-semibold transition-colors">
              <Trophy size={20} />
              <span>My Bets</span>
            </button>
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            <button onClick={() => router.push('/profile')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-gray-300 font-medium transition-colors">
              <User size={20} />
              <span>Profile</span>
            </button>
          </div>

          {/* Quick Tips Section */}
          <h3 className="text-gray-200 text-lg font-semibold mb-4 pt-6 border-t border-gray-700">Quick Tips</h3>
          <div className="space-y-3">
            <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-[#FED800] flex items-center justify-center shrink-0 mt-0.5">
                  <Trophy size={14} className="text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">Track Performance</h4>
                  <p className="text-gray-400 text-xs">Monitor your win rate regularly</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-[#FED800] flex items-center justify-center shrink-0 mt-0.5">
                  <Share2 size={14} className="text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">Share Pending Bets</h4>
                  <p className="text-gray-400 text-xs">Expand and share QR codes</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-[#FED800] flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp size={14} className="text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">Learn & Improve</h4>
                  <p className="text-gray-400 text-xs">Review past bets to improve</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Content - Stakes List */}
        <div className="flex-1 flex flex-col overflow-hidden lg:min-w-0">
          {/* Filter Bar - Sticky */}
          <div className="sticky top-0 bg-[#1a2633] z-20 lg:bg-[#1a2633] flex-none">
            <div className="px-4 pb-4 lg:px-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-white">My Bets</h2>
                <div className="flex items-center gap-2 bg-[#16202C] px-3 py-2 rounded-lg border border-gray-700">
                  <Trophy className="text-[#FED800]" size={20} />
                  <span className="text-sm font-semibold text-white">{stats.totalStakes}</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-6 border-b border-gray-700 pb-3">
                {filterTabs.map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                      filterState.type === tab.id
                        ? 'text-[#FED800]'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {tab.name}
                    {filterState.type === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FED800]"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>


            {/*TODO: so I need a way to make this only to list the stakes whos pulbic == false*/}
          {/* Stakes List - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 lg:pb-4 lg:px-4 pr-6">
            {filteredStakes.length > 0 && filteredStakes.public ? (
              filteredStakes.map((stake) => (
                <StakeCard key={stake.stakeId} stake={stake} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-[#16202C] rounded-full flex items-center justify-center mb-4 border border-gray-700">
                  <Trophy className="text-gray-600" size={40} />
                </div>
                <p className="text-gray-400 text-center text-lg mb-2">No {filterState.type} bets found</p>
                <p className="text-gray-500 text-sm">Your stakes will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="hidden lg:block lg:w-[260px] xl:w-[280px] bg-[#16202C] rounded-lg p-4 self-start sticky top-6 h-fit flex-shrink-0">
          <h3 className="text-gray-200 text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="text-[#FED800]" size={20} />
            Your Stats
          </h3>
          
          {/* Stats Cards */}
          <div className="space-y-3">
            <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">Total Bets</span>
                <Target size={16} className="text-[#FED800]" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalStakes}</div>
            </div>

            <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">Won Bets</span>
                <CheckCircle size={16} className="text-[#60991A]" />
              </div>
              <div className="text-2xl font-bold text-[#60991A]">{stats.wonStakes}</div>
            </div>

            <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">Lost Bets</span>
                <XCircle size={16} className="text-red-500" />
              </div>
              <div className="text-2xl font-bold text-red-500">{stats.lostStakes}</div>
            </div>

            <div className="bg-[#1a2633] rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">Pending</span>
                <Clock size={16} className="text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-300">{stats.pendingStakes}</div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="text-gray-300 text-sm font-semibold mb-3">Financial Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Total Staked</span>
                <span className="text-white font-bold text-sm">KES {stats.totalStaked.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Total Won</span>
                <span className="text-[#60991A] font-bold text-sm">KES {stats.totalWon.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <button
              onClick={() => window.location.href = '/main'}
              className="w-full bg-[#60991A] hover:bg-[#4d7a15] text-black font-bold px-4 py-3 rounded-lg text-sm transition-all"
            >
              Place New Bet
            </button>
          </div>
        </div>
      </div>

      {/* Footer - Mobile Only */}
      <div className="flex-none lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <FooterComponent currentPage={currentPage} />
      </div>
    </div>
  );
}

export default function ActualStakePage() {
  return (
    <ProtectedRoute>
      <StakesPage />
    </ProtectedRoute>
  );
}