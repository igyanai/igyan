// src/redux/slices/mentorSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API endpoint
const MENTORS_API = '/api/mentors';

// Async thunk for fetching mentors
export const fetchMentors = createAsyncThunk(
  'mentors/fetchMentors',
  async () => {
    const res = await axios.get(MENTORS_API);
    return res.data.data.mentors; // backend returns {status, results, data: {mentors}}
  }
);

// Default mentors data (fallback if backend fails)
const defaultMentors = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    title: 'Senior Software Engineer at Google',
    avatar: '👩‍💻',
    expertise: ['React', 'Node.js', 'System Design', 'Career Guidance'],
    experience: '8 years',
    students: 245,
    rating: 4.9,
    reviews: 89,
    hourlyRate: '₹1,500',
    bio: 'Passionate about mentoring the next generation of developers. Specialized in full-stack development and system architecture.',
    achievements: ['Google Developer Expert', 'Tech Conference Speaker', 'Open Source Contributor'],
    languages: ['English', 'Hindi'],
    responseTime: '< 2 hours',
    availability: 'Weekdays 6-9 PM',
    featured: true,
    verified: true,
    calendlyUrl: 'https://calendly.com/priya-sharma-example'
  },
  {
    id: 2,
    name: 'Rahul Patel',
    title: 'Product Manager at Microsoft',
    avatar: '👨‍💼',
    expertise: ['Product Strategy', 'User Research', 'Data Analysis', 'Leadership'],
    experience: '10 years',
    students: 156,
    rating: 4.8,
    reviews: 67,
    hourlyRate: '₹2,000',
    bio: 'Helping aspiring product managers navigate their career journey. Former startup founder with enterprise experience.',
    achievements: ['PMI Certified', 'Startup Exit', '50+ Product Launches'],
    languages: ['English', 'Gujarati'],
    responseTime: '< 4 hours',
    availability: 'Weekends',
    featured: true,
    verified: true,
    calendlyUrl: 'https://calendly.com/rahul-patel-example'
  },
  {
    id: 3,
    name: 'Ananya Gupta',
    title: 'Data Science Lead at Flipkart',
    avatar: '👩‍🔬',
    expertise: ['Machine Learning', 'Python', 'Statistics', 'Research'],
    experience: '6 years',
    students: 189,
    rating: 4.9,
    reviews: 78,
    hourlyRate: '₹1,800',
    bio: 'Data science enthusiast with a passion for solving real-world problems using AI and machine learning.',
    achievements: ['PhD in Computer Science', 'Research Publications', 'Kaggle Master'],
    languages: ['English', 'Hindi'],
    responseTime: '< 3 hours',
    availability: 'Flexible',
    featured: false,
    verified: true,
    calendlyUrl: 'https://calendly.com/ananya-gupta-example'
  },
  {
    id: 4,
    name: 'Arjun Singh',
    title: 'UX Design Director at Zomato',
    avatar: '👨‍🎨',
    expertise: ['UI/UX Design', 'Design Thinking', 'Prototyping', 'User Research'],
    experience: '7 years',
    students: 134,
    rating: 4.7,
    reviews: 56,
    hourlyRate: '₹1,600',
    bio: 'Creative problem solver with experience in designing user-centric products at scale.',
    achievements: ['Design Award Winner', 'Design System Creator', 'Workshop Facilitator'],
    languages: ['English', 'Punjabi'],
    responseTime: '< 6 hours',
    availability: 'Evenings',
    featured: false,
    verified: true,
    calendlyUrl: 'https://calendly.com/arjun-singh-example'
  }
];

const mentorSlice = createSlice({
  name: 'mentors',
  initialState: {
    mentors: defaultMentors,
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMentors.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMentors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.mentors = action.payload.length ? action.payload : defaultMentors;
      })
      .addCase(fetchMentors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default mentorSlice.reducer;
