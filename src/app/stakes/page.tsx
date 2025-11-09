'use client'
import { useEffect, useMemo, useState } from "react"
import { Trophy, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Share2, Copy, Check } from 'lucide-react'
import HeaderComponent from "../components/newHeader"
import FooterComponent from "../components/footer"
import ProtectedRoute from "../components/protectedRoute"
import GeneratedQrCode from "../components/qrCode"

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
    // For now, all stakes are not live as per your instruction
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
    const inviteCode = `STAKE-${stake.stakeId}`;
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
  const potentialWin = stake.stakeAmount * 2; // Calculate 2x for now

  return (
    <div className="[#1a2633] bg-background-blue rounded-lg border border-gray-700 overflow-hidden mb-1">
      {/* Compact View */}
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2"> {/* date and status badge */}
          <span className="text-xs text-gray-400">{formatDate(stake.date)}</span> 
          {getStatusBadge()}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate mb-1">{stake.home}</div>
            <div className="text-sm font-medium text-white truncate">{stake.away}</div>
          </div>
          
          {/* Score - only show if not pending */}
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
          <div className="bg-[#23313D] rounded-lg p-3 space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Your Placement</span>
              <span className="text-sm font-semibold text-[#FED800] capitalize">
                {stake.home} {/* This should be the actual placement from your data */}
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

              {/* QR Code and Invite Code */}
              {showQR && (
                <div className="bg-[#23313D] rounded-lg p-4 space-y-3">
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <GeneratedQrCode code={`STAKE-${stake.stakeId}`} />
                  </div>

                  {/* Invite Code */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 text-center">Or share this code:</p>
                    <div className="flex items-center gap-2 bg-[#1a2633] rounded-lg p-3">
                      <code className="flex-1 text-[#FED800] font-mono text-sm break-all">
                        STAKE-{stake.stakeId}
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
      <div className="flex items-center justify-center bg-[#0F1419] min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FED800]"></div>
          <p className="text-gray-400 text-sm">Loading stakes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0F1419]">
      {/* Fixed Header */}
      <div className="flex-none bg-gradient-to-b from-[#1a2633] to-[#16202C] shadow-lg sticky top-0 z-10">
        <HeaderComponent />
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-white">My Bets</h2>
            <div className="flex items-center gap-2 bg-[#23313D] px-3 py-2 rounded-lg">
              <Trophy className="text-[#FED800]" size={20} />
              <span className="text-sm font-semibold text-white">{stakeListData?.length || 0}</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-6 border-b border-gray-700">
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

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto px-1 pt-1 pb-24">
        {filteredStakes.length > 0 ? (
          filteredStakes.map((stake) => (
            <StakeCard key={stake.stakeId} stake={stake} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-[#1a2633] rounded-full flex items-center justify-center mb-4">
              <Trophy className="text-gray-600" size={40} />
            </div>
            <p className="text-gray-400 text-center text-lg mb-2">No {filterState.type} bets found</p>
            <p className="text-gray-500 text-sm">Your stakes will appear here</p>
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="flex-none fixed bottom-0 left-0 right-0 z-10">
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