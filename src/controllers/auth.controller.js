import AuthService from "../services/auth.service.js";

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
      const { user, accessToken, refreshToken } = await AuthService.login(
        email,
        password
      );

      res.status(200).json({
        user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" });
      }

      const decoded = await AuthService.validateRefreshToken(refreshToken);
      const user = { id: decoded.id, email: decoded.email }; // Fetch user details if needed

      const tokens = await AuthService.generateTokens(user);
      res.status(200).json(tokens);
    } catch (error) {
      if (error.message.includes("expired")) {
        return res.status(401).json({ message: error.message });
      }
      res.status(400).json({ message: error.message });
    }
  }

  static async logout(req, res) {
    try {
      const userId = req.userId; // Assume `userId` is set by the authentication middleware
      await AuthService.revokeRefreshToken(userId);
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to log out" });
    }
  }
}
