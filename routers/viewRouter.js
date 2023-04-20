const express = require('express');
const views = require('../controller/viewController');
const auth = require('../controller/authContoller');

const viewRouter = express.Router();

viewRouter.use(auth.isLoggedIn);
viewRouter.get('/', views.getOverView);
viewRouter.get('/tour', views.getTours);
viewRouter.get('/tour/:slug', views.getTour);
viewRouter.get('/login', views.login);
viewRouter.get('/signup', views.signup);

module.exports = viewRouter;
