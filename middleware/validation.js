const { body } = require('express-validator');

const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('birthdate')
    .isDate()
    .withMessage('Please provide a valid birthdate')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const minAge = new Date();
      minAge.setFullYear(today.getFullYear() - 13);
      
      if (birthDate > minAge) {
        throw new Error('You must be at least 13 years old to register');
      }
      
      const maxAge = new Date();
      maxAge.setFullYear(today.getFullYear() - 120);
      
      if (birthDate < maxAge) {
        throw new Error('Please provide a valid birthdate');
      }
      
      return true;
    })
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

module.exports = {
  validateSignup,
  validateLogin
};
