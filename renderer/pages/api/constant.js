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

export const ollamaModelList =  [
    {name: 'llama2', family:'llama', params:'7B',  q:'4-bit', s:'3.8GB', description: 'Llama 2 is a collection of foundation language models ranging from 7B to 70B parameters.'},
    {name: 'mistral', family:'llama', params:'7B',  q:'4-bit', s:'4.1GB', description: 'The 7B model released by Mistral AI, updated to version 0.2.'},
    {name: 'dolphin-phi', family:'phi2', params:'3B',  q:'4-bit', s:'1.6GB', description: '2.7B uncensored Dolphin model by Eric Hartford, based on the Phi language model by Microsoft Research.'},
    {name: 'phi', family:'phi2', params:'3B',  q:'4-bit', s:'1.6GB', description: 'Phi-2: a 2.7B language model by Microsoft Research that demonstrates outstanding reasoning and language understanding capabilities.'},
    {name: 'neural-chat', family:'llama', params:'7B',  q:'4-bit', s:'4.1GB', description: 'A fine-tuned model based on Mistral with good coverage of domain and language.'},
    {name: 'starling-lm', family:'llama', params:'7B',  q:'4-bit', s:'4.1GB', description: 'Starling is a large language model trained by reinforcement learning from AI feedback focused on improving chatbot helpfulness.'},
    {name: 'codellama', family:'llama', params:'7B',  q:'4-bit', s:'3.8GB', description: 'A large language model that can use text prompts to generate and discuss code.'},
    {name: 'llama2-uncensored', family:'llama', params:'7B',  q:'4-bit', s:'3.8GB', description: 'Uncensored Llama 2 model by George Sung and Jarrad Hope.'},
    {name: 'orca-mini', family:'llama', params:'3B',  q:'4-bit', s:'2.0GB', description: 'A general-purpose model ranging from 3 billion parameters to 70 billion, suitable for entry-level hardware.'},
    {name: 'vicuna', family:'llama', params:'7B',  q:'4-bit', s:'3.8GB', description: 'General use chat model based on Llama and Llama 2 with 2K to 16K context sizes.'},
    {name: 'gemma', family:'gemma', params:'9B',  q:'4-bit', s:'5.2GB', description: 'Gemma is a family of lightweight, state-of-the-art open models built by Google DeepMind.'},
    {name: 'stablelm2', family:'stablelm', params:'2B',  q:'4-bit', s:'983MB', description: 'Stable LM 2 1.6B is a state-of-the-art 1.6 billion parameter small language model trained on multilingual data in English, Spanish, German, Italian, French, Portuguese, and Dutch.'},
]