import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set JWT as HTTP-Only cookie (optional, but good for security, though for APIs, Bearer token is common)
  // We'll just return it in the payload for now to easily use it in frontend React app without credentials: 'include' complexities if CORS is wide open.
  return token;
};

export default generateToken;
