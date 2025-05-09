import AuthService from '../services/auth.service.js';

export default class AuthController {
  static async register(req, res) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.register(email, password);
      res.status(201).json({ user });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);
      res.json({ token, user });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}