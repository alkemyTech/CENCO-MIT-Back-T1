import { userService } from '../services/userService.js';


export const userController = {
  getAll: async (req, res) => {
    console.log("getAll")
    try {
      const users = await userService.getAll();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  getUser: async (req, res) => {
    try {
      const { user } = req;
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userService.getById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  ,

  login: async function (req, res) {
    const {email, password} = req.body;
    try {
      const token = await userService.login(email,password)
      if (!token) res.status(401).send({ massage: "Incorrect username or password" })
      else res.status(200).send({ message: "Login successful", data: { token } })
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
 
      if (error.message === "User already exists" ||
        error.message.includes("Invalid email format") ||
        error.message.includes("Password must be") ||
        error.message.includes("First name must be") ||
        error.message.includes("Last name must be") || error.message.includes("Invalid date format") ||
        error.message.includes("Must be 18 years of age or older")) {
        res.status(400).json({ error: error.message });
      } else {
        console.error(error); 
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
};
