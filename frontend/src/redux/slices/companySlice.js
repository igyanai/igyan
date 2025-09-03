// src/redux/slices/companiesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Example API endpoints (replace with your backend routes)
const PROJECTS_API = '/api/projects';
const COMPANIES_API = '/api/companies';

// Async thunks
export const fetchProjects = createAsyncThunk(
  'companies/fetchProjects',
  async () => {
    const res = await axios.get(PROJECTS_API);
    return res.data; // backend should return array of projects
  }
);

export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async () => {
    const res = await axios.get(COMPANIES_API);
    return res.data; // backend should return array of companies
  }
);

// Default data (fallback if backend fails)
const defaultProjects = [
    {
      id: 1,
      title: 'E-commerce Recommendation Engine',
      company: 'TechCorp Solutions',
      companyLogo: '🏢',
      description: 'Build an AI-powered recommendation system for our e-commerce platform to improve user engagement and sales.',
      category: 'AI/ML',
      difficulty: 'Advanced',
      duration: '8-12 weeks',
      budget: '₹50,000 - ₹80,000',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'API Integration'],
      applicants: 45,
      deadline: '2024-02-15',
      location: 'Remote',
      featured: true,
      verified: true,
      requirements: 'Previous ML experience required, portfolio must include recommendation systems'
    },
    {
      id: 2,
      title: 'Mobile App for Healthcare',
      company: 'MediTech Innovations',
      companyLogo: '🏥',
      description: 'Develop a React Native app for patient management and telemedicine consultations.',
      category: 'Mobile Apps',
      difficulty: 'Intermediate',
      duration: '6-8 weeks',
      budget: '₹40,000 - ₹60,000',
      skills: ['React Native', 'Node.js', 'MongoDB', 'Video APIs'],
      applicants: 32,
      deadline: '2024-02-20',
      location: 'Hybrid (Bangalore)',
      featured: true,
      verified: true,
      requirements: 'Healthcare domain knowledge preferred, HIPAA compliance understanding'
    },
    {
      id: 3,
      title: 'Real-time Analytics Dashboard',
      company: 'DataFlow Systems',
      companyLogo: '📊',
      description: 'Create a real-time dashboard for monitoring business metrics and KPIs.',
      category: 'Web Development',
      difficulty: 'Intermediate',
      duration: '4-6 weeks',
      budget: '₹30,000 - ₹45,000',
      skills: ['React', 'D3.js', 'WebSockets', 'PostgreSQL'],
      applicants: 28,
      deadline: '2024-02-25',
      location: 'Remote',
      featured: false,
      verified: true,
      requirements: 'Experience with data visualization and real-time systems'
    },
    {
      id: 4,
      title: 'Blockchain Supply Chain Solution',
      company: 'ChainTech Corp',
      companyLogo: '⛓️',
      description: 'Develop a blockchain-based solution for supply chain transparency and traceability.',
      category: 'Web Development',
      difficulty: 'Advanced',
      duration: '10-14 weeks',
      budget: '₹70,000 - ₹1,00,000',
      skills: ['Solidity', 'Web3', 'React', 'Smart Contracts'],
      applicants: 18,
      deadline: '2024-03-01',
      location: 'Remote',
      featured: false,
      verified: true,
      requirements: 'Blockchain development experience, understanding of supply chain processes'
    }
  ];

const defaultCompanies = [
    {
      name: 'TechCorp Solutions',
      logo: '🏢',
      industry: 'Technology',
      size: '500-1000 employees',
      location: 'Bangalore, India',
      description: 'Leading software development company specializing in enterprise solutions.',
      projects: 12,
      rating: 4.8,
      verified: true
    },
    {
      name: 'MediTech Innovations',
      logo: '🏥',
      industry: 'Healthcare',
      size: '200-500 employees',
      location: 'Mumbai, India',
      description: 'Healthcare technology company focused on digital health solutions.',
      projects: 8,
      rating: 4.9,
      verified: true
    },
    {
      name: 'DataFlow Systems',
      logo: '📊',
      industry: 'Analytics',
      size: '100-200 employees',
      location: 'Hyderabad, India',
      description: 'Data analytics and business intelligence solutions provider.',
      projects: 15,
      rating: 4.7,
      verified: true
    }
  ];

const companiesSlice = createSlice({
  name: 'companies',
  initialState: {
    projects: defaultProjects,
    companies: defaultCompanies,
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Projects
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projects = action.payload.length ? action.payload : defaultProjects;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Companies
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companies = action.payload.length ? action.payload : defaultCompanies;
      });
  }
});

export default companiesSlice.reducer;
