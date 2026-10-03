const axios = require('axios');

// بيانات مؤقتة
let memoryPosts = [
    {
        id: '1',
        author: 'أحمد',
        party: 'حزب التكنولوجيا',
        userAvatar: '',
        image: 'https://i.ibb.co/L8v8m2y/sample.jpg',
        timestamp: Date.now()
    }
];

module.exports = async (req, res) => {
    // إعدادات CORS لتفادي حظر المتصفح
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // جلب المنشورات
    if (req.method === 'GET') {
        return res.status(200).json({ success: true, posts: memoryPosts });
    }

    // رفع صورة ونشر
    if (req.method === 'POST') {
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const { author, party, userAvatar, imageBase64 } = body || {};

            if (!imageBase64) {
                return res.status(400).json({ success: false, message: 'لم يتم إرسال أي صورة' });
            }

            const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            const apiKey = process.env.IMGBB_API_KEY || 'c3a4f63d0a218f2d5f0b4d210515152a';

            const formData = new URLSearchParams();
            formData.append('image', cleanBase64);

            const imgbbRes = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const imageUrl = imgbbRes.data.data.url;

            const newPost = {
                id: Date.now().toString(),
                author: author || 'عضو موثق',
                party: party || 'حزب عام',
                userAvatar: userAvatar || '',
                image: imageUrl,
                timestamp: Date.now()
            };

            memoryPosts.unshift(newPost);
            return res.status(200).json({ success: true, post: newPost });

        } catch (error) {
            console.error('API Error:', error.response?.data || error.message);
            return res.status(500).json({ 
                success: false, 
                message: 'مشكلة في رفع الصورة على ImgBB: ' + (error.response?.data?.error?.message || error.message) 
            });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
};
