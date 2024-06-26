import { userService } from '../services/userService.js';

export const userController = {
  login: async function (req, res) {
    const {email, password} = req.body;
    try {
      const token = await userService.login(email,password)
      if (!token) res.send({ massage: "El correo o la contraseña es incorrecto" })
      else res.send({ message: "Ingreso exitoso", data: { token } })
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  },
  signUp: async (req, res) => {
    try {
      const { firstName, lastName, email, password, phone, country, birthdate, role } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'First name, last name, email, and password are required.' });
      }

      const newUser = await userService.create({
        firstName,
        lastName,
        email,
        password,
        phone,
        country,
        birthdate,
        role
      });


      res.status(201).json(newUser);
    } catch (error) {
 
      if (error.message === "User already exists" || error.message.includes("Password must be")) {
        res.status(400).json({ error: error.message });
      } else {
        console.error(error); 
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
};
