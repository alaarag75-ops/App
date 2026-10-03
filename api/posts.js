const axios = require('axios');

// ذاكرة مؤقتة للمنشورات
let memoryPosts = [];

module.exports = async (req, res) => {
    // إعدادات CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 1. جلب المنشورات
    if (req.method === 'GET') {
        return res.status(200).json({ success: true, posts: memoryPosts });
    }

    // 2. نشر صورة جديدة
    if (req.method === 'POST') {
        try {
            const { author, party, userAvatar, imageBase64 } = req.body || {};

            if (!imageBase64) {
                return res.status(400).json({ success: false, message: 'الصورة مطلوبة' });
            }

            // تنظيف بيانات Base64
            const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

            // مفتاح ImgBB المجاني للرفع
            const apiKey = process.env.IMGBB_API_KEY || 'c3a4f63d0a218f2d5f0b4d210515152a';
            const formData = new URLSearchParams();
            formData.append('image', cleanBase64);

            const imgbbRes = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 10000
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
            console.error('Error uploading:', error?.response?.data || error.message);
            return res.status(500).json({ 
                success: false, 
                message: error?.response?.data?.error?.message || 'حدث خطأ في السيرفر أثناء رفع الصورة' 
            });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
};
