import axios from 'axios';
const apiKey=import.meta.env.VITE_API_KEY;
const client = axios.create({
    headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
    }
});


const dalleEndpoint = 'https://api.openai.com/v1/images/generations'

export const dalleApiCall = async (prompt, messages) => {
    try {
        const res = await client.post(dalleEndpoint,{
            prompt,
            "n": 1,
            size: "512x512"
        })

        let url = res?.data?.data[0]?.url;
        console.log('got image url',url)
        messages.push({ role: 'assistant', content: url })
        return Promise.resolve({ success: true, data: messages })

    } catch (err) {
        console.log(err)
        return Promise.resolve({ success: false, msg: err.message })
    }
}