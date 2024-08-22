require("dotenv").config();
const express = require('express')
const cors = require('cors')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const app = express()


app.use(cors())
app.use(express.json())

app.use(
  cors({
    origin: "*",
  })
);

const queryModel = async (diff) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const prompt = `Generate a commit message based on the following:\n\n${diff}. Give the response in bullet point respective to each file changes. the message should have a on-point description about the changes made.Use terms like fix for any fixes or feat for any new feature added etc. Give the title and rform the response for direct use.`;
  const result = await model.generateContent(prompt);
  return result.response;
}

app.post('/api/generate', async (req, res) => {
  try {
    const { diff } = req.body;
    if (!diff) {
      return res.status(400).json({ error: 'Make a change in any file to generate commit message' });
    }
    const response = await queryModel(diff);
    const text = response.text();
    console.log(text);
    res.send(text);
  } catch (error) {
      console.error("Unhandled error:", error);
      return res.status(500).send({ error: "Internal Server Error: Could not generate message." });
  }
})

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
