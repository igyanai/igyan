import { configureStore } from '@reduxjs/toolkit';
import companiesReducer from './slices/companySlice.js';

export const store = configureStore({
  reducer: {
    companies: companiesReducer
  }
});
