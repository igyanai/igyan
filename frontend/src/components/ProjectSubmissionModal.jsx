import React, { useState } from 'react';
import { X, Upload, FileText, Github, Globe, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProjectSubmissionModal = ({ project, isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    coverLetter: '',
    portfolio: '',
    github: '',
    submissionFile: null
  });

  const handleInputChange = (e) => {
    if (e.target.name === 'submissionFile') {
      setFormData({
        ...formData,
        submissionFile: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append('projectId', project.id);
      submitFormData.append('coverLetter', formData.coverLetter);
      submitFormData.append('portfolio', formData.portfolio);
      submitFormData.append('github', formData.github);
      
      if (formData.submissionFile) {
        submitFormData.append('submissionFile', formData.submissionFile);
      }

      const token = localStorage.getItem('userToken');
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitFormData
      });

      const data = await response.json();

      if (data.success) {
        alert('Application submitted successfully!');
        onSubmit();
        onClose();
        setFormData({
          coverLetter: '',
          portfolio: '',
          github: '',
          submissionFile: null
        });
      } else {
        alert(data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Apply to Project</h2>
            <p className="text-sm text-gray-600">{project.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Info Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Your Profile</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{user?.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium">{user?.email}</span>
              </div>
              <div>
                <span className="text-gray-600">University:</span>
                <span className="ml-2 font-medium">{user?.university}</span>
              </div>
              <div>
                <span className="text-gray-600">Course:</span>
                <span className="ml-2 font-medium">{user?.course} - {user?.year}</span>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cover Letter *
            </label>
            <textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              rows="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Explain why you're the perfect fit for this project. Mention your relevant experience, skills, and approach..."
              required
            />
          </div>

          {/* Portfolio Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Portfolio Link
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          {/* GitHub Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              GitHub Profile
            </label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Submission (Recommended: ZIP file)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                name="submissionFile"
                onChange={handleInputChange}
                accept=".zip,.rar,.7z,.tar,.gz"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  {formData.submissionFile ? formData.submissionFile.name : 'Click to upload your project files'}
                </p>
                <p className="text-xs text-gray-500">
                  Supported formats: ZIP, RAR, 7Z, TAR, GZ (Max: 50MB)
                </p>
              </label>
            </div>
          </div>

          {/* Project Details Reminder */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Project Requirements</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Budget:</strong> {project.budget}</p>
              <p><strong>Duration:</strong> {project.duration}</p>
              <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
              <p><strong>Skills:</strong> {project.skills?.join(', ')}</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.coverLetter.trim()}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectSubmissionModal;