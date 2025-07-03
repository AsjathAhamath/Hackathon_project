// require("dotenv").config();
// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const rateLimit = require("express-rate-limit");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests
// });
// app.use(limiter);

// // Time-based access middleware
// const checkAccessTime = (req, res, next) => {
//   const hour = new Date().getHours();
//   if (hour >= 9 && hour < 17) return next();
//   res.status(403).json({ error: "Service available 9AM-5PM only" });
// };

// app.post("/api/chat", checkAccessTime, async (req, res) => {
//   try {
//     const { prompt } = req.body;
//     const response = await axios.post(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       { contents: [{ parts: [{ text: prompt }] }] }
//     );

//     res.json({
//       response:
//         response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
//         "I couldn't process that request",
//     });
//   } catch (error) {
//     console.error("Gemini API error:", error.response?.data || error.message);
//     res.status(500).json({ error: "AI service unavailable" });
//   }
// });

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
