export async function hostImage(imageUrl) {
    const imgBbApiKey = import.meta.env.VITE_HOST_KEY;

    try {
        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `key=${imgBbApiKey}&image=${encodeURIComponent(imageUrl)}` // Encode the imageUrl
        });

        if (!response.ok) {
            throw new Error('Image upload to ImgBB failed');
        }

        const data = await response.json();
        return data.data.url; // Return the hosted ImgBB URL
    } catch (error) {
        console.error('Error hosting image on ImgBB:', error);
        return null; // Return null if hosting fails
    }
}
