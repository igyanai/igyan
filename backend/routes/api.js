
const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');
const companiesController = require('../controllers/companiesController');
const mentorController = require('../controllers/mentorController');

// Projects routes
router.get('/projects', projectsController.getAllProjects);
router.get('/projects/:id', projectsController.getProjectById);
router.post('/projects', projectsController.createProject);
router.put('/projects/:id', projectsController.updateProject);
router.delete('/projects/:id', projectsController.deleteProject);

// Companies routes
router.get('/companies', companiesController.getAllCompanies);
router.get('/companies/:id', companiesController.getCompanyById);
router.post('/companies', companiesController.createCompany);
router.put('/companies/:id', companiesController.updateCompany);
router.delete('/companies/:id', companiesController.deleteCompany);



// mentors routes 

router.get('/mentors', mentorController.getAllMentors)
router.post('/mentors', mentorController.createMentor);
router.get('/mentors/:id', mentorController.getMentor);

module.exports = router;

