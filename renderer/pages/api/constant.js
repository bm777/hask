export const pplxModelList = [
    "pplx-7b-online", "pplx-70b-online", "pplx-8x7b-online", 
    "sonar-small-online", "sonar-medium-online", "sonar-medium-chat", "sonar-small-chat"
];
export const groqModelList = [
    "llama2-70b-4096", "mixtral-8x7b-32768"
];
export const discordUrl = "https://discord.gg/3tH8UKx5mY"
export const githubUrl = "https://github.com/bm777/hask"

export const colors = {
    light: {
        background: "#e0e5f6",
        primary: "#e0e5f6",
        secondary: "#c5ccdb",
        secondaryTransparent: "#c5ccdb9a",
        accent: "#FFB2BE",
        red: "#561D2A",
        text: "#2f2f2fb9",
        textRoot: "#2f2f2f",
        textgray: "#4d4e50",
        footer: "#d8dcea",
        black: "#000000",
        stroke: "#561D2A",
        textCode: "#B4B4B4",
        bgCode: "#1F1F1D",
        textBtn: "#00000090",
        black: "#000000",
    },

} 
export const get_lang = (lang) => {
    switch (lang) {
        case "javascript":
            return "js";
        default:
            return "js";
    }
}