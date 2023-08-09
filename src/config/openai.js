import axios from 'axios';
const apiKey = import.meta.env.VITE_API_KEY;
const headers = {
  "Authorization": "Bearer " + apiKey,
  "Content-Type": "application/json"
};

const dalleEndpoint = 'https://api.openai.com/v1/images/generations'




export const dalleApiCall = async (prompt) => {
  try {
    const response = await fetch(dalleEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        prompt,
        "n": 1,
        size: "512x512"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API call failed: ${errorData.error.message}`);
    }

    const data = await response.json();
    const imageContent = data?.data[0]?.url;
    return Promise.resolve({ success: true, imageContent });
  } catch (err) {
    console.log(err);
    return Promise.resolve({ success: false, msg: err.message });
  }
}
