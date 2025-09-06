import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Building, 
  MapPin, 
  Globe, 
  Users, 
  Star, 
  Calendar, 
  DollarSign, 
  Clock,
  Filter,
  Search,
  Eye,
  Heart,
  ExternalLink,
  Mail,
  Phone,
  CheckCircle,
  Award,
  Send
} from 'lucide-react';

const CompanyProfile = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const [companyRes, projectsRes, jobsRes] = await Promise.all([
        fetch(`/api/companies/${companyId}`),
        fetch(`/api/companies/${companyId}/projects`),
        fetch(`/api/companies/${companyId}/jobs`)
      ]);

      if (companyRes.ok) {
        const companyData = await companyRes.json();
        setCompany(companyData);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'All', count: projects.length },
    { name: 'Web Development', count: projects.filter(p => p.category === 'Web Development').length },
    { name: 'Mobile Apps', count: projects.filter(p => p.category === 'Mobile Apps').length },
    { name: 'AI/ML', count: projects.filter(p => p.category === 'AI/ML').length },
    { name: 'Data Science', count: projects.filter(p => p.category === 'Data Science').length }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Company Not Found</h2>
          <p className="text-gray-600">The company you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Company Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl">
              {company.logo || '🏢'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">{company.companyName}</h1>
                {company.verified && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-4">{company.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {company.location}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {company.companySize} employees
                </div>
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {company.industry}
                </div>
                {company.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Follow
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'about', label: 'About', count: null },
              { id: 'projects', label: 'Projects', count: projects.length },
              { id: 'jobs', label: 'Job Openings', count: jobs.length }
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
                {tab.label}
                {tab.count !== null && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'about' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">About {company.companyName}</h2>
                <p className="text-gray-600 leading-relaxed">{company.description}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Company Culture</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">🚀</div>
                    <h3 className="font-semibold text-gray-800">Innovation</h3>
                    <p className="text-sm text-gray-600">Cutting-edge technology</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl mb-2">🤝</div>
                    <h3 className="font-semibold text-gray-800">Collaboration</h3>
                    <p className="text-sm text-gray-600">Team-first approach</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl mb-2">📈</div>
                    <h3 className="font-semibold text-gray-800">Growth</h3>
                    <p className="text-sm text-gray-600">Continuous learning</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl mb-2">⚡</div>
                    <h3 className="font-semibold text-gray-800">Impact</h3>
                    <p className="text-sm text-gray-600">Meaningful work</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Company Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projects Posted</span>
                    <span className="font-semibold">{projects.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Jobs</span>
                    <span className="font-semibold">{jobs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{company.rating || '4.8'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Founded</span>
                    <span className="font-semibold">2018</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{company.email}</span>
                  </div>
                  {company.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{company.phone}</span>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {company.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-4 py-2 rounded-full transition-all duration-300 ${
                      selectedCategory === category.name
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                    <span className="ml-2 text-xs opacity-70">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Projects Found</h3>
                <p className="text-gray-600">This company hasn't posted any projects matching your criteria.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors">
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {project.featured && (
                            <Award className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            project.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {project.difficulty}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 text-sm line-clamp-3">{project.description}</p>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Budget:</span>
                          <span className="font-semibold text-green-600">{project.budget}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-semibold">{project.duration}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Location:</span>
                          <span className="font-semibold">{project.location}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {project.skills?.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                          {project.skills?.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              +{project.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{project.applicants || 0} applicants</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1">
                          <Send className="w-4 h-4" />
                          Apply Now
                        </button>
                        <button className="p-2 border border-gray-300 rounded-lg hover:border-red-300 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-lg hover:border-blue-300 hover:text-blue-500 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Job Openings</h2>
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No job openings available at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">{job.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{job.department}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {job.type}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {job.salary}
                            </div>
                          </div>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfile;