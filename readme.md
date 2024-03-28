# Hask AI

Hask AI is a customizable, open-source application that allows users to quickly search the internet and receive instant results. It offers a seamless experience, accessible through a keyboard shortcut, and empowers users to leverage the power of PPLX API and other LLM providers.

![Hask AI](assets/record.gif)



This is only 10% of what we want to achieve.

Wanna join our little discord community? [Join HASK discord server](https://discord.gg/cSf3RpQdws)


| Provider           | Model              | Integration       |
| ------------------ | ------------------ | ----------------- |
| Perplexity         | pplx-7b-online, pplx-70b-online, pplx-8x7b-online, sonar-small-online, sonar-small-chat, sonar-medium-chat |  ✅               |
| Cohere             | command, command-light, command-r, command-nightly, command-light-nightly |  ✅               |
| OpenAI             | gpt-3.5-turbo, gpt-4, gpt-4-turbo-preview |  ✅               |
| Groq               | llama2-70b-4096chat, llama2-8x7b-32768 | ✅               | 
| Anthropic          | claude-2.1, claude-3-opus-20240229, claude-2.0, claude-instant-1.2, claude-3-sonnet-20240229, claude-3-haiku-20240307 |  ✅               |
| Ollama             | library models |  ✅               |
| Gemini             | soon |  ❌               |
| Mistral            | soon |  ❌               |



## Features
- **Lightweight**: A lightweight application that runs in the background and is accessible at any time via Option+X.
- **Instant Search**: Quickly search the internet and receive instant results.
- **Other model**: To be requested, feel free to request any model you want to use.
- **Dark Mode**: Switch between light and dark mode for a comfortable viewing experience.

## Executable
It is available for:

Mac Silicon (M1, M2, M3): [PKG](https://github.com/bm777/hask/releases/download/v1.5/hask-ai-arm64.pkg) | [DMG](https://github.com/bm777/hask/releases/download/v1.5/hask-ai-arm64.dmg)

Mac Intel: [PKG](https://github.com/bm777/hask/releases/download/v1.5/hask-ai-intel.pkg) [DMG](https://github.com/bm777/hask/releases/download/v1.5/hask-ai-intel.dmg)

[Windows on demand](https://github.com/bm777/hask/issues/new)

[Linux on demand](https://github.com/bm777/hask/issues/new)


## 1. Development
Clone the repository:

```bash
git clone https://github.com/bm777/hask.git
cd hask
npm i
npm run dev

# or build for your platform
npm run build
```

## 2. Usage
It is the same scenario in dev or build mode.
- Open the app via Option+X
![Hask AI](assets/empty.png)

- Perform a search by typing in your query and pressing Enter.
- Enjoy instant results from the internet!

## Contributing
Contributions are welcome! If you have any ideas for new features or improvements, feel free to open an issue or submit a pull request.
