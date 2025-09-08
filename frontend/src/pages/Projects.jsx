import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Heart, 
  Eye, 
  MessageCircle, 
  Star, 
  Award, 
  ExternalLink,
  Building,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  Send
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProjectSubmissionModal from '../components/ProjectSubmissionModal';

const Projects = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [categories, setCategories] = useState([]);
  const { isLoggedIn, setShowLogin } = useAuth();

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, [selectedCategory, searchTerm]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/projects?${params}`);
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

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/projects/meta/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories([
          { name: 'All', count: projects.length, emoji: '🎯' },
          ...data.categories.map(cat => ({ ...cat, emoji: getCategoryEmoji(cat.name) }))
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'Web Development': '🌐',
      'Mobile Apps': '📱',
      'AI/ML': '🤖',
      'Data Science': '📊',
      'Game Development': '🎮',
      'Design': '🎨'
    };
    return emojiMap[category] || '💼';
  };

  const handleApply = (project) => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    setSelectedProject(project);
    setShowSubmissionModal(true);
  };

  const handleSubmissionSuccess = () => {
    fetchProjects(); // Refresh to update applicant count
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Discover Amazing Projects 🌟
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Work on real-world projects and gain valuable experience
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects, technologies, companies..."
                  className="w-full pl-12 pr-6 py-4 text-lg rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => !isLoggedIn && setShowLogin(true)}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {isLoggedIn ? 'Submit Your Project' : 'Join to Apply'}
              </button>
              <Link 
                to="/companies"
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Browse Companies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Browse Projects</h2>
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-500 w-4 h-4" />
              <span className="text-sm text-gray-500">Filter by category</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 bg-gray-700 text-gray-200 rounded-full transition-all duration-300 ${
                  selectedCategory === category.name
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 border border-gray-200 hover:border-blue-300 text-gray-700'
                }`}
              >
                <span className="mr-2">{category.emoji}</span>
                {category.name}
                <span className="ml-2 text-xs opacity-70">({category.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Projects Found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or browse different categories.</p>
            </div>
          ) : (
            <>
              {/* Featured Projects */}
              {projects.some(p => p.featured) && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
                    Featured Projects ⭐
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.filter(p => p.featured).map((project) => (
                      <div key={project.id} className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow group relative">
                        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                          <Award className="mr-1 w-3 h-3" />
                          Featured
                        </div>
                        
                        <div className="p-6">
                          {/* Company Header */}
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-lg">
                              {project.companyLogo}
                            </div>
                            <div>
                              <Link 
                                to={`/companies/${project.companyId}`}
                                className="font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                              >
                                {project.companyName}
                              </Link>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                {project.verified && <CheckCircle className="w-3 h-3 text-green-500" />}
                                Verified Company
                              </div>
                            </div>
                          </div>

                          {/* Project Info */}
                          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                            {project.description}
                          </p>

                          {/* Project Details */}
                          <div className="space-y-2 mb-4 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                Budget:
                              </span>
                              <span className="font-semibold text-green-600">{project.budget}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Duration:
                              </span>
                              <span className="font-semibold">{project.duration}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                Location:
                              </span>
                              <span className="font-semibold">{project.location}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Difficulty:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                project.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                project.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {project.difficulty}
                              </span>
                            </div>
                          </div>

                          {/* Skills */}
                          <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-500 mb-2">REQUIRED SKILLS</h4>
                            <div className="flex flex-wrap gap-2">
                              {project.skills?.slice(0, 4).map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {skill}
                                </span>
                              ))}
                              {project.skills?.length > 4 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                  +{project.skills.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{project.applicants || 0} applied</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleApply(project)}
                              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                            >
                              <Send className="w-4 h-4" />
                              Apply Now
                            </button>
                            <button className="p-2 border border-gray-200 rounded-lg hover:border-red-300 hover:text-red-500 transition-colors">
                              <Heart className="w-4 h-4" />
                            </button>
                            <Link 
                              to={`/companies/${project.companyId || project.companyId?._id}`}
                              className="p-2 border border-gray-200 rounded-lg hover:border-blue-300 hover:text-blue-500 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Projects */}
              <div>
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
                  {projects.filter(p => p.featured).length > 0 ? 'More Projects' : 'All Projects'} ({projects.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow group">
                      <div className="p-6">
                        {/* Company Header */}
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm">
                            {project.companyLogo}
                          </div>
                          <div>
                            <Link 
                              to={`/companies/${project.companyId || project.companyId?._id}`}
                              className="font-semibold text-gray-800 hover:text-blue-600 transition-colors text-sm"
                            >
                              {project.companyName}
                            </Link>
                            <div className="text-xs text-gray-500">{project.category}</div>
                          </div>
                        </div>

                        {/* Project Info */}
                        <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                          {project.description}
                        </p>

                        {/* Quick Details */}
                        <div className="space-y-1 mb-4 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Budget:</span>
                            <span className="font-semibold text-green-600">{project.budget}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Duration:</span>
                            <span className="font-semibold">{project.duration}</span>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {project.skills?.slice(0, 3).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {skill}
                              </span>
                            ))}
                            {project.skills?.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{project.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{project.applicants || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(project.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            project.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {project.difficulty}
                          </span>
                        </div>

                        {/* CTA */}
                        <button 
                          onClick={() => handleApply(project)}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-8">
              Ready to Build Something Amazing? 🚀
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join our community of creators and showcase your skills
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => !isLoggedIn && setShowLogin(true)}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {isLoggedIn ? 'Submit Your Project' : 'Join Now'}
              </button>
              <Link 
                to="/companies" 
                className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                For Companies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Project Submission Modal */}
      {showSubmissionModal && selectedProject && (
        <ProjectSubmissionModal
          project={selectedProject}
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
          onSubmit={handleSubmissionSuccess}
        />
      )}
    </div>
  );
};

export default Projects;