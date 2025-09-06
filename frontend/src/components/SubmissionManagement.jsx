import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Eye, 
  Check, 
  X, 
  Star, 
  User, 
  Calendar, 
  FileText,
  Github,
  Globe,
  Mail,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { useCompanyAuth } from '../context/CompanyAuthContext';

const SubmissionManagement = ({ projectId, onClose }) => {
  const { company } = useCompanyAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: '',
    feedback: '',
    rating: 5
  });

  useEffect(() => {
    fetchSubmissions();
  }, [projectId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('companyToken');
      const response = await fetch(`/api/submissions/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (submissionId, status, feedback = '', rating = null) => {
    try {
      const token = localStorage.getItem('companyToken');
      const response = await fetch(`/api/submissions/${submissionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, feedback, rating })
      });

      if (response.ok) {
        await fetchSubmissions();
        setShowReviewModal(false);
        setSelectedSubmission(null);
        alert(`Submission ${status} successfully!`);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update submission');
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      alert('Failed to update submission. Please try again.');
    }
  };

  const handleDownload = async (submissionId) => {
    try {
      const token = localStorage.getItem('companyToken');
      const response = await fetch(`/api/submissions/${submissionId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `submission-${submissionId}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download submission file');
      }
    } catch (error) {
      console.error('Error downloading submission:', error);
      alert('Failed to download submission file');
    }
  };

  const openReviewModal = (submission, status) => {
    setSelectedSubmission(submission);
    setReviewData({ ...reviewData, status });
    setShowReviewModal(true);
  };

  const submitReview = () => {
    handleStatusUpdate(
      selectedSubmission._id, 
      reviewData.status, 
      reviewData.feedback, 
      reviewData.status === 'accepted' ? reviewData.rating : null
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Project Submissions</h2>
            <p className="text-sm text-gray-600">{submissions.length} applications received</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Submissions Yet</h3>
              <p className="text-gray-600">Applications will appear here once students start submitting.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map((submission) => (
                <div key={submission._id} className="bg-gray-50 rounded-lg p-6 border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-xl">
                        {submission.userId?.avatar || '👤'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{submission.userName}</h3>
                        <p className="text-sm text-gray-600">{submission.userEmail}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{submission.userId?.university}</span>
                          <span>{submission.userId?.course} - {submission.userId?.year}</span>
                          {submission.userId?.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span>{submission.userId?.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        submission.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Cover Letter</h4>
                    <p className="text-gray-600 text-sm bg-white p-3 rounded-lg border">
                      {submission.coverLetter}
                    </p>
                  </div>

                  {/* Links */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    {submission.portfolio && (
                      <a 
                        href={submission.portfolio} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Globe className="w-4 h-4" />
                        Portfolio
                      </a>
                    )}
                    {submission.github && (
                      <a 
                        href={submission.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-800 text-sm"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>
                    )}
                    {submission.userId?.linkedin && (
                      <a 
                        href={submission.userId.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <User className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>

                  {/* Skills */}
                  {submission.userId?.skills && submission.userId.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {submission.userId.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {submission.submissionFile && (
                        <button
                          onClick={() => handleDownload(submission._id)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Files
                        </button>
                      )}
                    </div>

                    {submission.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openReviewModal(submission, 'rejected')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => openReviewModal(submission, 'accepted')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Accept
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Company Feedback */}
                  {submission.companyFeedback && (
                    <div className="mt-4 bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-gray-800 mb-1 text-sm">Company Feedback</h4>
                      <p className="text-gray-600 text-sm">{submission.companyFeedback}</p>
                      {submission.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{submission.rating}/5</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-bold text-gray-800">
                  {reviewData.status === 'accepted' ? 'Accept Submission' : 'Reject Submission'}
                </h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800">{selectedSubmission.userName}</h4>
                  <p className="text-sm text-gray-600">{selectedSubmission.userEmail}</p>
                </div>

                {reviewData.status === 'accepted' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rating (1-5 stars)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewData({ ...reviewData, rating: star })}
                          className={`p-1 ${star <= reviewData.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Feedback {reviewData.status === 'accepted' ? '(Optional)' : '(Required)'}
                  </label>
                  <textarea
                    value={reviewData.feedback}
                    onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder={
                      reviewData.status === 'accepted' 
                        ? "Great work! Looking forward to working with you..."
                        : "Thank you for your submission. Unfortunately..."
                    }
                    required={reviewData.status === 'rejected'}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReview}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      reviewData.status === 'accepted'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {reviewData.status === 'accepted' ? 'Accept & Send' : 'Reject & Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionManagement;