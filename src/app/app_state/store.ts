// this file will hold our redux store 

import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import type { WebStorage } from 'redux-persist';

// Import your reducers
import userDataReducer from "./slices/userData";
import allFixturesDataReducer from "./slices/matchData";
import currentStakeDataReducer from "./slices/stakingData";
import stakeConnectionDataReducer from "./slices/stakeConnectionData"
import currentPageDataReducer from "./slices/pageTracking"
import leagueDataReducer from "./slices/leagueData"

// Define persist config type
type PersistConfig = {
  key: string;
  version: number;
  storage: WebStorage;
  whitelist?: string[];
};

// Root reducer
export const rootReducer = combineReducers({
  userData: userDataReducer,
  allFixturesData: allFixturesDataReducer,
  currentStakeData: currentStakeDataReducer,
  stakeConnectionData: stakeConnectionDataReducer,
  currentPageData: currentPageDataReducer,
  leagueData: leagueDataReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export let persistor: ReturnType<typeof persistStore>;

// Persist config
const persistConfig: PersistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['userData', 'currentStakeData', 'allFixtureData', 'stakeConnectionData', 'currentPageData', 'leagueData'],
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer as any);

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
persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;

// and just like that we will have created our redux store