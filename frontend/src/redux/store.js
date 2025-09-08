import { configureStore } from '@reduxjs/toolkit';
import companiesReducer from './slices/companySlice.js';
import projectsReducer from './slices/projectSlice.js';
import mentorsReducer from './slices/mentorSlice.js';

export const store = configureStore({
  reducer: {
    companies: companiesReducer,
    projects: projectsReducer,
    mentors: mentorsReducer
  }
});
