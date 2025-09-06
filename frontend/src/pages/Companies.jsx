import React, { useState, useEffect } from 'react';
import {
  Building,
  Users,
  Star,
  MapPin,
  Globe,
  Search,
  Filter,
  Eye,
  Heart,
  ExternalLink,
  CheckCircle,
  Award,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCompanyAuth } from '../context/CompanyAuthContext';

const Companies = () => {
  const [selectedTab, setSelectedTab] = useState('companies');
  const [companies, setCompanies] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [partnershipLoading, setPartnershipLoading] = useState(false);
  const [partnershipForm, setPartnershipForm] = useState({
    companyName: '',
    contactEmail: '',
    contactPerson: '',
    phone: '',
    website: '',
    location: '',
    companySize: '',
    industry: '',
    partnershipType: '',
    projectRequirements: ''
  });
  const { setShowLogin } = useCompanyAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [companiesRes, projectsRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/projects?featured=true')
      ]);

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setFeaturedProjects(projectsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();
 useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setSelectedTab(tab); 
      setTimeout(() => {
        const element = document.getElementById(`${tab}-section`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    }
  }, [location]);

  const handlePartnershipInputChange = (e) => {
    setPartnershipForm({
      ...partnershipForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePartnershipSubmit = async (e) => {
    e.preventDefault();
    setPartnershipLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/partnership/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partnershipForm),
      });

      const data = await response.json();

      if (data.success) {
        alert('Partnership request submitted successfully! You will receive a confirmation email shortly.');
        setPartnershipForm({
          companyName: '',
          contactEmail: '',
          contactPerson: '',
          phone: '',
          website: '',
          location: '',
          companySize: '',
          industry: '',
          partnershipType: '',
          projectRequirements: ''
        });
      } else {
        alert(data.message || 'Failed to submit partnership request');
      }
    } catch (error) {
      console.error('Partnership submission error:', error);
      alert('Failed to submit partnership request. Please try again.');
    } finally {
      setPartnershipLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const partnershipBenefits = [
    {
      title: 'Access to Top Talent',
      description: 'Connect with skilled students and fresh graduates',
      icon: '🎓',
      details: ['Pre-screened candidates', 'AI-verified skills', 'Portfolio reviews', 'Real project experience']
    },
    {
      title: 'Cost-Effective Solutions',
      description: 'Get quality work done at competitive rates',
      icon: '💰',
      details: ['Flexible pricing models', 'No recruitment costs', 'Performance-based payments', 'Escrow protection']
    },
    {
      title: 'Innovation & Fresh Ideas',
      description: 'Bring new perspectives to your projects',
      icon: '💡',
      details: ['Latest technology trends', 'Creative problem solving', 'Agile methodologies', 'Continuous learning']
    },
    {
      title: 'Mentorship Opportunities',
      description: 'Build your employer brand and give back',
      icon: '🤝',
      details: ['Brand visibility', 'Talent pipeline', 'CSR initiatives', 'Industry leadership']
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-purple-600 to-blue-700 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Corporate Hub 🏢
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Connect with talent, post projects, and build the future together
            </p>

            {/* Toggle Buttons */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 flex">
                <button
                  onClick={() => setSelectedTab('companies')}
                  className={`px-6 py-3 rounded-xl transition-all ${selectedTab === 'companies' ? 'bg-white text-purple-800 font-semibold' : 'text-white hover:bg-white/10'
                    }`}
                >
                  Browse Companies
                </button>
                <button
                  onClick={() => setSelectedTab('partnership')}
                  className={`px-6 py-3 rounded-xl transition-all ${selectedTab === 'partnership' ? 'bg-white text-purple-800 font-semibold' : 'text-white hover:bg-white/10'
                    }`}
                >
                  Partner with Us
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowLogin(true)}
                className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Post a Project
              </button>
              <Link
                to="/projects"
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                View Talent Pool
              </Link>
            </div>
          </div>
        </div>
      </section>

      {selectedTab === 'companies' ? (
        <>
          {/* Search Section */}
          <section className="py-8 bg-white border-b">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search companies, industries, locations..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Projects from Companies */}
          {featuredProjects.length > 0 && (
            <section className="py-12 bg-gray-50">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
                  Featured Opportunities ⭐
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProjects.slice(0, 6).map((project) => (
                    <div key={project.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Link
                            to={`/companies/${project.companyId}`}
                            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                          >
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm">
                              {project.companyLogo}
                            </div>
                            <span className="font-semibold text-gray-800">{project.companyName}</span>
                          </Link>
                          <Award className="w-4 h-4 text-yellow-500" />
                        </div>

                        <h3 className="font-bold text-gray-800 mb-2">{project.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span className="font-semibold text-green-600">{project.budget}</span>
                          <span>{project.duration}</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.skills?.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>

                        <Link
                          to="/projects"
                          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors block text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Companies Grid */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
                Our Partner Companies ({filteredCompanies.length})
              </h2>

              {filteredCompanies.length === 0 ? (
                <div className="text-center py-16">
                  <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Companies Found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCompanies.map((company) => (
                    <Link
                      key={company.id}
                      to={`/companies/${company.id}`}
                      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-xl">
                              {company.logo}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                {company.companyName}
                              </h3>
                              <p className="text-sm text-gray-500">{company.industry}</p>
                            </div>
                          </div>
                          {company.verified && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>

                        <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                          {company.description}
                        </p>

                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{company.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{company.companySize} employees</span>
                          </div>
                          {company.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-gray-400" />
                              <span className="text-blue-600 hover:underline">{company.website}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Building className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{company.projectsCount || 0} projects</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-semibold">{company.rating || 'New'}</span>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Platform Statistics</h2>
                <p className="text-xl text-gray-600">Trusted by leading companies across industries</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{companies.length}+</div>
                  <div className="text-gray-600">Partner Companies</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
                  <div className="text-gray-600">Projects Completed</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
                  <div className="text-gray-600">Client Satisfaction</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-orange-600 mb-2">₹2Cr+</div>
                  <div className="text-gray-600">Total Earnings</div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Partnership Section */
        <section id="partnership-section" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-8 text-gray-800">
                  Partner with I-GYAN 🤝
                </h2>
                <p className="text-xl text-gray-600">
                  Unlock the potential of India's brightest minds for your business
                </p>
              </div>

              {/* Benefits */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {partnershipBenefits.map((benefit, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-4">{benefit.icon}</div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{benefit.title}</h3>
                    <p className="text-gray-600 mb-4">{benefit.description}</p>
                    <ul className="space-y-1 text-sm text-left">
                      {benefit.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Partnership Process & Form */}
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-800">How It Works</h3>
                  <div className="space-y-4">
                    {[
                      { step: 1, title: 'Submit Partnership Request', desc: 'Fill out our partnership form with your requirements' },
                      { step: 2, title: 'Consultation Call', desc: 'Discuss your needs with our partnership team' },
                      { step: 3, title: 'Get Matched', desc: 'Receive curated talent recommendations' },
                      { step: 4, title: 'Start Collaborating', desc: 'Begin working with selected candidates' }
                    ].map((item) => (
                      <div key={item.step} className="flex items-start space-x-3">
                        <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{item.title}</h4>
                          <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">Partnership Request Form</h3>
                  <form onSubmit={handlePartnershipSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        value={partnershipForm.companyName}
                        onChange={handlePartnershipInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your company name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={partnershipForm.contactEmail}
                        onChange={handlePartnershipInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="contact@company.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person</label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={partnershipForm.contactPerson}
                        onChange={handlePartnershipInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Full name of contact person"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={partnershipForm.phone}
                        onChange={handlePartnershipInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+91 9876543210"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Website (Optional)</label>
                      <input
                        type="url"
                        name="website"
                        value={partnershipForm.website}
                        onChange={handlePartnershipInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={partnershipForm.location}
                        onChange={handlePartnershipInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="City, State, Country"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Company Size</label>
                      <select
                        name="companySize"
                        value={partnershipForm.companySize}
                        onChange={handlePartnershipInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option>Select Company Size</option>
                        <option value="Startup (1-50 employees)">Startup (1-50 employees)</option>
                        <option value="SME (51-500 employees)">SME (51-500 employees)</option>
                        <option value="Large (500+ employees)">Large (500+ employees)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
                      <input
                        type="text"
                        name="industry"
                        value={partnershipForm.industry}
                        onChange={handlePartnershipInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Technology, Healthcare, Finance..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Partnership Type</label>
                      <select
                        name="partnershipType"
                        value={partnershipForm.partnershipType}
                        onChange={handlePartnershipInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option>Select Partnership Type</option>
                        <option value="Project-based Hiring">Project-based Hiring</option>
                        <option value="Internship Program">Internship Program</option>
                        <option value="Talent Pipeline">Talent Pipeline</option>
                        <option value="Mentorship Program">Mentorship Program</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Project Requirements</label>
                      <textarea
                        name="projectRequirements"
                        value={partnershipForm.projectRequirements}
                        onChange={handlePartnershipInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="4"
                        placeholder="Describe your project needs, skills required, timeline, etc."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={partnershipLoading}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {partnershipLoading ? 'Submitting...' : 'Submit Partnership Request'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-8">
              Ready to Transform Your Business? 🚀
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of companies already working with our talented community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowLogin(true)}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started Today
              </button>
              <Link
                to="/projects"
                className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                View Success Stories
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Companies;