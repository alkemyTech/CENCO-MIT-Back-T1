export const validatePassword = (password) => (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
  
  export const validateEmail = (email) => (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
  
  export const validateName = (name) => (
    name.length >= 2 && name.length <= 50
  );
  
  export const validateDateFormat = (date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && date.match(/^\d{4}-\d{2}-\d{2}$/);
  };

  export const validateAge = (birthdate, minAge = 18) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
  
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age >= minAge;
  };