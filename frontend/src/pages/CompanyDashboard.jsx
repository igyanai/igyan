import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  MapPin, 
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  FileText,
  Settings,
  BarChart3,
  X,
  Download,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useCompanyAuth } from '../context/CompanyAuthContext';
import { Navigate } from 'react-router-dom';
import SubmissionManagement from './components/SubmissionManagement';

const CompanyDashboard = () => {
  const { isLoggedIn, company } = useCompanyAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'Intermediate',
    duration: '',
    budget: '',
    skills: '',
    requirements: '',
    location: 'Remote',
    deadline: ''
  });

  // Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchProjects();
    fetchNotifications();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('companyToken');
      const response = await fetch(`/api/projects/company/${company.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('companyToken');
      const response = await fetch('/api/submissions/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const skillsArray = projectForm.skills.split(',').map(s => s.trim()).filter(s => s);
      const projectData = {
        ...projectForm,
        skills: skillsArray,
        companyId: company.id,
        companyName: company.companyName,
        companyLogo: company.logo || '🏢'
      };

      const token = localStorage.getItem('companyToken');
      const url = editingProject 
        ? `/api/projects/${editingProject._id}`
        : '/api/projects';
      
      const method = editingProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchProjects();
        resetProjectForm();
        setShowProjectForm(false);
        alert(editingProject ? 'Project updated successfully!' : 'Project posted successfully!');
      } else {
        alert(data.message || 'Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetProjectForm = () => {
    setProjectForm({
      title: '',
      description: '',
      category: '',
      difficulty: 'Intermediate',
      duration: '',
      budget: '',
      skills: '',
      requirements: '',
      location: 'Remote',
      deadline: ''
    });
    setEditingProject(null);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setProjectForm({
      ...project,
      skills: Array.isArray(project.skills) ? project.skills.join(', ') : project.skills
    });
    setShowProjectForm(true);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('companyToken');
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          await fetchProjects();
          alert('Project deleted successfully!');
        } else {
          alert(data.message || 'Failed to delete project');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleViewSubmissions = (projectId) => {
    setSelectedProjectId(projectId);
    setShowSubmissions(true);
  };

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalApplicants: projects.reduce((sum, p) => sum + (p.applicants || 0), 0),
    avgRating: company?.rating || 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{company?.companyName}</h1>
                <p className="text-gray-600">{company?.industry} • {company?.location}</p>
              </div>
            </div>
            
            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">New Notifications</h3>
                </div>
                <p className="text-blue-700 text-sm">You have {notifications.length} new submission(s) to review.</p>
              </div>
            )}
            <button
              onClick={() => setShowProjectForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Post New Project
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'projects', label: 'Projects', icon: FileText },
              { id: 'submissions', label: 'Submissions', icon: Users },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalProjects}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-3xl font-bold text-green-600">{stats.activeProjects}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalApplicants}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.avgRating}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Recent Projects */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Recent Projects</h2>
              </div>
              <div className="p-6">
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No projects posted yet</p>
                    <button
                      onClick={() => setShowProjectForm(true)}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Post Your First Project
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.slice(0, 3).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-800">{project.title}</h3>
                          <p className="text-sm text-gray-600">{project.category} • {project.applicants || 0} applicants</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status || 'active'}
                          </span>
                          <button
                            onClick={() => handleEdit(project)}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleViewSubmissions(project._id)}
                          className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Your Projects</h2>
              <button
                onClick={() => setShowProjectForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Post New Project
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Projects Yet</h3>
                <p className="text-gray-600 mb-6">Start by posting your first project to connect with talented students</p>
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Post Your First Project
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{project.title}</h3>
                        <p className="text-gray-600 mb-3">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.skills?.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleViewSubmissions(project._id)}
                        className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                        title="View Submissions"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>{project.budget}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{project.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{project.applicants || 0} applicants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{project.deadline}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Project Submissions</h2>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Post projects to start receiving submissions</p>
              </div>
            ) : (
            <div className="text-center py-12">
              <div className="grid gap-4">
                {projects.map((project) => (
                  <div key={project._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-800">{project.title}</h3>
                      <p className="text-sm text-gray-600">{project.applicants || 0} submissions received</p>
                    </div>
                    <button
                      onClick={() => handleViewSubmissions(project._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Submissions
                    </button>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Company Reviews</h2>
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Reviews from students will appear here</p>
              <div className="mt-4">
                <div className="text-3xl font-bold text-gray-800">{company?.rating?.toFixed(1) || '0.0'}</div>
                <div className="text-sm text-gray-600">Average Rating ({company?.totalReviews || 0} reviews)</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Company Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={company?.companyName || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  value={company?.industry || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={company?.location || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProject ? 'Edit Project' : 'Post New Project'}
              </h2>
              <button
                onClick={() => {
                  setShowProjectForm(false);
                  resetProjectForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleProjectSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Title</label>
                <input
                  type="text"
                  name="title"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe your project requirements..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({...projectForm, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Apps">Mobile Apps</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Game Development">Game Development</option>
                    <option value="Design">Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select
                    name="difficulty"
                    value={projectForm.difficulty}
                    onChange={(e) => setProjectForm({...projectForm, difficulty: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={projectForm.duration}
                    onChange={(e) => setProjectForm({...projectForm, duration: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 4-6 weeks"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Budget</label>
                  <input
                    type="text"
                    name="budget"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({...projectForm, budget: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ₹30,000 - ₹50,000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Required Skills</label>
                <input
                  type="text"
                  name="skills"
                  value={projectForm.skills}
                  onChange={(e) => setProjectForm({...projectForm, skills: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="React, Node.js, MongoDB (comma separated)"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <select
                    name="location"
                    value={projectForm.location}
                    onChange={(e) => setProjectForm({...projectForm, location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={projectForm.deadline}
                    onChange={(e) => setProjectForm({...projectForm, deadline: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Requirements</label>
                <textarea
                  name="requirements"
                  value={projectForm.requirements}
                  onChange={(e) => setProjectForm({...projectForm, requirements: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Any specific requirements, experience level, portfolio needs..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProjectForm(false);
                    resetProjectForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Posting...' : (editingProject ? 'Update Project' : 'Post Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submission Management Modal */}
      {showSubmissions && selectedProjectId && (
        <SubmissionManagement
          projectId={selectedProjectId}
          onClose={() => {
            setShowSubmissions(false);
            setSelectedProjectId(null);
            fetchProjects(); // Refresh projects to update counts
          }}
        />
      )}
    </div>
  );
};

export default CompanyDashboard;