import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../redux/slices/projectSlice.js';
import {
  FaCode,
  FaDesktop,
  FaMobile,
  FaRobot,
  FaChartLine,
  FaGamepad,
  FaHeart,
  FaEye,
  FaThumbsUp,
  FaComment,
  FaShare,
  FaFilter,
  FaSearch,
  FaArrowLeft,
  FaAward,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const StudentProjects = () => {
  const dispatch = useDispatch();
  const { projects, status, error } = useSelector((state) => state.projects);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { name: 'All', emoji: '🎯' },
    { name: 'Web Development', emoji: '🌐' },
    { name: 'Mobile Apps', emoji: '📱' },
    { name: 'AI/ML', emoji: '🤖' },
    { name: 'Data Science', emoji: '📊' },
    { name: 'Game Development', emoji: '🎮' },
    { name: 'Design', emoji: '🎨' }
  ];

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Hero Section */}
      <section className="py-16 bg-gradient-cool relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-800"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-slide-up">
              Student Showcase 🌟
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover amazing projects built by our talented students
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects, technologies, or creators... 🔍"
                  className="w-full pl-12 pr-6 py-4 text-lg rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-glass">
                Submit Your Project
              </button>
              <button className="btn-glass">
                Browse by Technology
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gradient">Browse Projects</h2>
            <div className="flex items-center space-x-2">
              <FaFilter className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter by category</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 bg-gray-700 text-gray-200 rounded-full transition-all duration-300 ${
                  selectedCategory === category.name
                    ? 'bg-blue-700 text-whiteshadow-soft'
                    : 'bg-card border border-border hover:border-primary/50'
                }`}
              >
                <span className="mr-2">{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Featured Banner */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center text-gradient">
              Featured Projects ⭐
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.filter(p => p.featured).map((project) => (
                <div key={project.id} className="card-glow group cursor-pointer relative">
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                    <FaAward className="mr-1" />
                    Featured
                  </div>
                  
                  <div className="p-6">
                    {/* Project Image/Icon */}
                    <div className="text-6xl text-center mb-4 group-hover:scale-110 transition-transform">
                      {project.companyLogo || project.image}
                    </div>

                    {/* Project Info */}
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm line-clamp-3">
                      {project.description}
                    </p>

                    {/* Author / Company */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="text-2xl">{project.companyLogo || project.authorAvatar}</div>
                      <div>
                        <div className="font-semibold text-sm">{project.company || project.author}</div>
                        <div className="text-xs text-muted-foreground">{project.category}</div>
                      </div>
                    </div>

                    {/* Tags / Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(project.skills || project.tags || []).slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-700/10 text-primary rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <FaHeart className="text-red-500" />
                          <span>{project.likes || project.applicants}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaEye />
                          <span>{project.views || ''}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaComment />
                          <span>{project.comments || ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold">{project.rating || ''}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-700 text-white text-whitepy-2 rounded-lg text-sm font-semibold hover:bg-blue-700-glow transition-colors">
                        <FaEye className="inline mr-1" />
                        View Project
                      </button>
                      <button className="p-2 border border-border rounded-lg hover:border-primary transition-colors">
                        <FaExternalLinkAlt className="text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Projects */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-center text-gradient">
              All Projects ({filteredProjects.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.filter(p => !p.featured).map((project) => (
                <div key={project.id} className="card-glow group cursor-pointer">
                  <div className="p-6">
                    {/* Project Image/Icon */}
                    <div className="text-5xl text-center mb-4 group-hover:scale-110 transition-transform">
                      {project.companyLogo || project.image}
                    </div>

                    {/* Project Info */}
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                      {project.description}
                    </p>

                    {/* Author / Company */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="text-xl">{project.companyLogo || project.authorAvatar}</div>
                      <div className="text-sm">
                        <div className="font-semibold">{project.company || project.author}</div>
                      </div>
                    </div>

                    {/* Tags / Skills */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(project.skills || project.tags || []).slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-muted text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <FaThumbsUp />
                          <span>{project.likes || ''}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaEye />
                          <span>{project.views || ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>⭐</span>
                        <span>{project.rating || ''}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-blue-900">
            <h2 className="text-4xl font-bold mb-8">
              Ready to Build Something Amazing? 🚀
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join our community of creators and showcase your skills
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-glass">
                Submit Your Project
              </button>
              <Link to="/learn" className="btn-glass">
                Start Learning to Build
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentProjects;
