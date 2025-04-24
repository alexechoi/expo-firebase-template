import JWT, { SupportedAlgorithms } from "expo-jwt";

const JWT_SECRET = process.env.EXPO_PUBLIC_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("EXPO_PUBLIC_JWT_SECRET environment variable is not set");
}

export const generateToken = async () => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const token = JWT.encode(
      {
        aud: "api",
        iss: "mobile",
        exp: now + 2 * 60 * 60,
        iat: now,
        nbf: now,
        typ: "JWT",
      },
      JWT_SECRET,
      {
        algorithm: "HS256" as SupportedAlgorithms,
      }
    );

    return token;
  } catch (error) {
    console.error("Error generating JWT:", error);
    throw error;
  }
};
