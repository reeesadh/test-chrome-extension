import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

const res  = await axios.get("https://api.sightengine.com/1.0/check.json", {
    params: {
        "url": "https://scontent-sea1-1.xx.fbcdn.net/v/t39.30808-6/792137854_10234952994352161_5810988319788608012_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=104&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=g4JbvRQJ6igQ7kNvwEtqrka&_nc_oc=Adrq839s5DHfwSQ1g0FGQTJYBTibxuMMvPzrSk9MtbSZ1P8qOx0zPFsXKWcTPgf9ZyE&_nc_zt=23&_nc_ht=scontent-sea1-1.xx&_nc_gid=6GHqQhiPo-hj6osbM0bhNw&_nc_ss=7b2a8&oh=00_AQKrW4NI6q3vTLLi690ogzDCcIi17hJqMEHJM32iH3LMYw&oe=6AA27F77",
        "models": "genai",
        "api_user": `${process.env.SE_USER}`,
        "api_secret": `${process.env.SE_SECRET}`
    }
})
//percent chance of being AI
console.log(res.data.type.ai_generated * 100)