// redux store setup imports
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { combineReducers } from 'redux';
import type { WebStorage } from 'redux-persist';

// Import your reducers
import userDataReducer from "./slices/userData";
import allFixturesDataReducer from "./slices/matchData";
import currentStakeDataReducer from "./slices/stakingData";
import stakeConnectionDataReducer from "./slices/stakeConnectionData"
import currentPageDataReducer from "./slices/pageTracking"
import leagueDataReducer from "./slices/leagueData"
import stakesDataReducer from "./slices/stakesData"
import publicStakeDataReducer from "./slices/publicStakesData"
import socketConnectionReducer from "./slices/socketConnection";

// Root reducer
export const rootReducer = combineReducers({
  userData: userDataReducer,
  allFixturesData: allFixturesDataReducer,
  currentStakeData: currentStakeDataReducer,
  stakeConnectionData: stakeConnectionDataReducer,
  currentPageData: currentPageDataReducer,
  leagueData: leagueDataReducer,
  stakesData: stakesDataReducer,
  socketConnectionData: socketConnectionReducer,
  publicStakesData: publicStakeDataReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export let persistor: ReturnType<typeof persistStore>;

// Create storage wrapper that only works on client-side
const createNoopStorage = (): WebStorage => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

const storage = typeof window !== 'undefined' 
  ? require('redux-persist/lib/storage').default 
  : createNoopStorage();

// Persist config
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['userData', 'currentStakeData', 'allFixturesData', 'stakeConnectionData', 'currentPageData', 'leagueData', 'stakesData', 'socketConnectionData', 'publicStakesData'],
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with middleware
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor
if (typeof window !== 'undefined') {
  persistor = persistStore(store);
}

export type AppDispatch = typeof store.dispatch;