import React, { useState, useEffect, useRef } from 'react';
import { PopupWidget } from 'react-calendly';
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaArrowLeft,
  FaRocket,
  FaHeart,
  FaLightbulb,
  FaUsers,
  FaQuestionCircle,
  FaHandshake,
  FaBug,
  FaStar,
  FaCheckCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [calendlyOpen, setCalendlyOpen] = useState(false);
  const formRef = useRef(null);

  const contactReasons = [
    {
      id: 'general',
      title: 'General Inquiry',
      description: 'Questions about I-GYAN platform',
      icon: FaQuestionCircle,
      emoji: '❓'
    },
    {
      id: 'partnership',
      title: 'Partnership',
      description: 'Collaborate with us',
      icon: FaHandshake,
      emoji: '🤝'
    },
    {
      id: 'support',
      title: 'Technical Support',
      description: 'Need help with the platform',
      icon: FaBug,
      emoji: '🛠️'
    },
    {
      id: 'feedback',
      title: 'Feedback',
      description: 'Share your thoughts and suggestions',
      icon: FaStar,
      emoji: '💭'
    }
  ];

  const team = [
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Founder & CEO',
      avatar: '👨‍💼',
      bio: 'Visionary leader with 15+ years in EdTech',
      email: 'rajesh@igyan.com'
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Engineering',
      avatar: '👩‍💻',
      bio: 'Tech enthusiast building the future of education',
      email: 'priya@igyan.com'
    },
    {
      name: 'Arjun Patel',
      role: 'Head of Partnerships',
      avatar: '👨‍🤝‍👨',
      bio: 'Connecting companies with talented students',
      email: 'arjun@igyan.com'
    },
    {
      name: 'Kavya Nair',
      role: 'Community Manager',
      avatar: '👩‍🎓',
      bio: 'Building vibrant learning communities',
      email: 'kavya@igyan.com'
    }
  ];

  const faqs = [
    {
      question: 'What is I-GYAN?',
      answer: 'I-GYAN is an AI-powered education platform that connects students, teachers, and companies through personalized learning experiences and real-world projects.'
    },
    {
      question: 'How does the AI guidance work?',
      answer: 'Our AI analyzes your skills, interests, and career goals to provide personalized learning paths, project recommendations, and career guidance.'
    },
    {
      question: 'Is I-GYAN free to use?',
      answer: 'Basic features are free. We offer premium plans for advanced features like one-on-one mentoring and specialized courses.'
    },
    {
      question: 'How can companies partner with I-GYAN?',
      answer: 'Companies can post real projects, hire talented students, and contribute to our mentorship programs. Contact our partnerships team for details.'
    },
    {
      question: 'What support do you provide to students?',
      answer: 'We provide AI-powered guidance, mentorship programs, project-based learning, career counseling, and job placement assistance.'
    }
  ];

  // Sync form category with selected category
  useEffect(() => {
    setFormData(prev => ({ ...prev, category: selectedCategory }));
  }, [selectedCategory]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: selectedCategory
      });
    }, 3000);
  };

  const handleStartConversation = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-200">

      {/* Hero Section */}
      <section className="py-16 bg-gradient-cool relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-800"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-slide-up">
              Get in Touch 📞
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleStartConversation} className="btn-glass">
                Start a Conversation
              </button>
              <button onClick={() => setCalendlyOpen(true)} className="btn-glass ">
                Schedule a Call
              </button>
          
                <PopupWidget
                  url="https://calendly.com/igyan-demo/30min"
                  onModalClose={() => setCalendlyOpen(false)}
                  open={calendlyOpen}
                  rootElement={document.getElementById("root")}
                  className="hidden "
                  
                  />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Reasons */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-gradient">
            How can we help you? 🤝
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {contactReasons.map((reason) => (
              <button
                key={reason.id}
                onClick={() => setSelectedCategory(reason.id)}
                className={`p-6 rounded-2xl bg-gray-700 text-gray-300 transition-all duration-300 text-center ${selectedCategory === reason.id
                    ? 'bg-blue-700 text-white shadow-glow scale-105'
                    : 'bg-card border border-border hover:border-primary/50 hover:shadow-soft'
                  }`}
              >
                <div className="text-4xl mb-3">
                  {reason.emoji}
                </div>
                <h3 className="font-bold mb-2">{reason.title}</h3>
                <p className="text-sm opacity-80">{reason.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section ref={formRef} className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card-glow">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-gradient">
                  Send us a Message ✉️
                </h2>

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold mb-2 text-success">Message Sent!</h3>
                    <p className="text-muted-foreground">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Subject *</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="What's this about?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Message *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows="6"
                        className="w-full px-4 py-3 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="Tell us more about how we can help you..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-700 text-white py-4 rounded font-semibold hover:bg-blue-700-glow transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <FaRocket />
                      <span>Send Message</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="card-glow">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-6 text-gradient">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <FaEnvelope className="text-primary mt-1" />
                      <div>
                        <div className="font-semibold">Email</div>
                        <div className="text-muted-foreground">hello@igyan.com</div>
                        <div className="text-muted-foreground">support@igyan.com</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaPhone className="text-primary mt-1" />
                      <div>
                        <div className="font-semibold">Phone</div>
                        <div className="text-muted-foreground">+91 98765 43210</div>
                        <div className="text-muted-foreground">+91 87654 32109</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaMapMarkerAlt className="text-primary mt-1" />
                      <div>
                        <div className="font-semibold">Office</div>
                        <div className="text-muted-foreground">
                          I-GYAN Technologies Pvt Ltd<br />
                          Bangalore, Karnataka, India
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="card-glow">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-6 text-gradient">Follow Us</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <a href="#" className="flex items-center space-x-3 p-3 bg-muted/50 rounded hover:bg-blue-700/10 transition-colors">
                      <FaLinkedin className="text-blue-600 text-xl" />
                      <span className="font-semibold">LinkedIn</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 p-3 bg-muted/50 rounded hover:bg-blue-700/10 transition-colors">
                      <FaTwitter className="text-blue-400 text-xl" />
                      <span className="font-semibold">Twitter</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 p-3 bg-muted/50 rounded hover:bg-blue-700/10 transition-colors">
                      <FaInstagram className="text-pink-500 text-xl" />
                      <span className="font-semibold">Instagram</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 p-3 bg-muted/50 rounded hover:bg-blue-700/10 transition-colors">
                      <FaYoutube className="text-red-500 text-xl" />
                      <span className="font-semibold">YouTube</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="card-gradient text-center p-6">
                <div className="text-4xl mb-2">⚡</div>
                <h3 className="font-bold mb-2">Quick Response Time</h3>
                <p className="text-muted-foreground text-sm">
                  We typically respond within 24 hours during business days
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gradient">
              Meet Our Team 👥
            </h2>
            <p className="text-xl text-muted-foreground">
              The passionate minds behind I-GYAN
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="card-glow text-center group">
                <div className="p-6">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {member.avatar}
                  </div>
                  <h3 className="font-bold mb-1">{member.name}</h3>
                  <p className="text-primary text-sm mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-xs mb-4">{member.bio}</p>
                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center space-x-2 text-xs text-primary hover:text-primary-glow transition-colors"
                  >
                    <FaEnvelope />
                    <span>Contact</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gradient">
                Frequently Asked Questions ❓
              </h2>
              <p className="text-xl text-muted-foreground">
                Quick answers to common questions
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="card-glow">
                  <div className="p-6">
                    <h3 className="font-bold mb-3 flex items-center">
                      <span className="text-primary mr-2">Q:</span>
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground ml-6">
                      <span className="text-success mr-2">A:</span>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">
                Still have questions? We're here to help!
              </p>
              <Link to="/ai-guide" className="btn-gradient">
                Ask Our AI Assistant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-8">
              Ready to Start Your Journey? 🚀
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of students and professionals building their future with I-GYAN
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/learn" className="btn-glass">
                Start Learning Today
              </Link>
              <Link to="/mentor" className="btn-glass">
                Find a Mentor
              </Link>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Contact;