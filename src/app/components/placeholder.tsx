'use client'
import { Trophy, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useState } from 'react';

export default function StakesPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const filterButtons = ['All', 'Live', 'Won', 'Lost'];
  
  // Mock stakes data with different statuses
  const stakes = [
    {
      id: 1,
      date: '05 Nov, 14:30',
      league: 'Premier League',
      home: 'Man United',
      away: 'Arsenal',
      stake: 500,
      potentialWin: 1000,
      status: 'live',
      placement: 'Home Win',
      score: '1 - 1'
    },
    {
      id: 2,
      date: '04 Nov, 18:00',
      league: 'La Liga',
      home: 'Barcelona',
      away: 'Real Madrid',
      stake: 300,
      potentialWin: 600,
      status: 'won',
      placement: 'Draw',
      score: '2 - 2'
    },
    {
      id: 3,
      date: '04 Nov, 15:45',
      league: 'Serie A',
      home: 'AC Milan',
      away: 'Inter Milan',
      stake: 200,
      potentialWin: 400,
      status: 'lost',
      placement: 'Away Win',
      score: '3 - 1'
    },
    {
      id: 4,
      date: '03 Nov, 20:00',
      league: 'Bundesliga',
      home: 'Bayern Munich',
      away: 'Dortmund',
      stake: 150,
      potentialWin: 300,
      status: 'won',
      placement: 'Home Win',
      score: '4 - 2'
    },
    {
      id: 5,
      date: '06 Nov, 16:00',
      league: 'Premier League',
      home: 'Chelsea',
      away: 'Liverpool',
      stake: 400,
      potentialWin: 800,
      status: 'pending',
      placement: 'Home Win',
      score: 'vs'
    }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'live':
        return (
          <div className="flex items-center gap-1 bg-red-500 px-2 py-1 rounded text-xs font-bold">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE
          </div>
        );
      case 'won':
        return (
          <div className="flex items-center gap-1 bg-[#60991A] px-2 py-1 rounded text-xs font-bold">
            <CheckCircle size={12} />
            WON
          </div>
        );
      case 'lost':
        return (
          <div className="flex items-center gap-1 bg-red-600 px-2 py-1 rounded text-xs font-bold">
            <XCircle size={12} />
            LOST
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1 bg-gray-600 px-2 py-1 rounded text-xs font-bold">
            <Clock size={12} />
            PENDING
          </div>
        );
      default:
        return null;
    }
  };

  const filteredStakes = activeFilter === 'all' 
    ? stakes 
    : stakes.filter(stake => stake.status === activeFilter.toLowerCase());

  return (
    <div className="min-h-screen bg-[#0F1419] pb-20">
      
      <div className="bg-gradient-to-b from-[#1a2633] to-[#16202C] px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">My Bets</h1>
          <div className="flex items-center gap-2 bg-[#23313D] px-3 py-2 rounded-lg">
            <Trophy className="text-[#FED800]" size={20} />
            <span className="text-sm font-semibold text-white">24 Total</span>
          </div>
        </div>

        
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {filterButtons.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter.toLowerCase())}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeFilter === filter.toLowerCase()
                  ? 'bg-[#FED800] text-black'
                  : 'bg-[#23313D] text-gray-300 hover:bg-[#2a3643]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>


      <div className="px-4 pt-4 space-y-3">
        {filteredStakes.length > 0 ? (
          filteredStakes.map((stake) => (
            <div 
              key={stake.id}
              className="bg-[#1a2633] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">{stake.date}</span>
                {getStatusBadge(stake.status)}
              </div>


              <div className="text-xs text-gray-400 mb-2">{stake.league}</div>

              
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-[10px]">
                      H
                    </div>
                    <span className="text-sm font-medium text-white">{stake.home}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-[10px]">
                      A
                    </div>
                    <span className="text-sm font-medium text-white">{stake.away}</span>
                  </div>
                </div>
                

                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    stake.status === 'live' ? 'text-[#FED800]' : 'text-white'
                  }`}>
                    {stake.score}
                  </div>
                </div>
              </div>

              
              <div className="bg-[#23313D] rounded p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Your Pick</span>
                  <span className="text-sm font-semibold text-[#FED800]">{stake.placement}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Stake Amount</span>
                  <span className="text-sm font-semibold text-white">KES {stake.stake}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <span className="text-xs text-gray-400">Potential Win</span>
                  <span className="text-base font-bold text-[#60991A]">KES {stake.potentialWin}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-[#1a2633] rounded-full flex items-center justify-center mb-4">
              <Trophy className="text-gray-600" size={40} />
            </div>
            <p className="text-gray-400 text-center">No {activeFilter} bets found</p>
          </div>
        )}
      </div>

      
      <div className="fixed bottom-16 left-0 right-0 bg-[#1a2633] border-t border-gray-700 px-4 py-3">
        <div className="flex justify-around text-center">
          <div>
            <div className="text-xs text-gray-400 mb-1">Total Staked</div>
            <div className="text-lg font-bold text-white">KES 1,550</div>
          </div>
          <div className="w-px bg-gray-700"></div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Total Won</div>
            <div className="text-lg font-bold text-[#60991A]">KES 900</div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
