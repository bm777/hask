class ResponseError extends Error {
    constructor(error, status_code) {
        super(error);
        this.error = error;
        this.status_code = status_code;
        this.name = 'ResponseError';

        if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ResponseError);
        }
    }
}
const checkOk = async (response) => {
    if (!response.ok) {
        let message = `Error ${response.status}: ${response.statusText}`;
        let errorData = null;

        if (response.headers.get('content-type')?.includes('application/json')) {
        try {
            errorData = (await response.json());
            message = errorData.error || message;
        } catch (error) {
            console.log('Failed to parse error response as JSON');
        }
        } else {
        try {
            console.log('Getting text from response');
            const textResponse = await response.text();
            message = textResponse || message;
        } catch (error) {
            console.log('Failed to get text from error response');
        }
        }

        throw new ResponseError(message, response.status);
    }
};
const utils_post = async (_fetch, host, data) => {
    const isRecord = (input) => {
        return input !== null && typeof input === 'object' && !Array.isArray(input);
    };

    const formattedData = isRecord(data) ? JSON.stringify(data) : data;

    const response = await fetch(host, {
        method: 'POST',
        body: formattedData,
    });

    await checkOk(response);

    return response;
};
const utils_parseJSON = async function* (itr) {
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    const reader = itr.getReader()

    while (true) {
        const { done, value: chunk } = await reader.read()

        if (done) {
        break
        }
        buffer += decoder.decode(chunk);

        const parts = buffer.split('\n');

        buffer = parts.pop() || '';

        for (const part of parts) {
        try {
            yield JSON.parse(part);
        } catch (error) {
            console.warn('invalid json: ', part);
        }
        }
    }

    for (const part of buffer.split('\n').filter((p) => p !== '')) {
        try {
        yield JSON.parse(part);
        } catch (error) {
        console.warn('invalid json: ', part);
        }
    }
};
export async function processStreamableRequest(endpoint, request) {
    request.stream = true; // request.stream ?? true
    // _fetch = null;
    const host = 'http://127.0.0.1:11434'
    const response = await utils_post(null, `${host}/api/${endpoint}`, { ...request }); // endpoint hadnle only generate method

    if (!response.body) { throw new Error('Missing body');}

    const itr = utils_parseJSON(response.body);

    if (request.stream) {
        return (async function* () {
        for await (const message of itr) {
            if ('error' in message) {
            throw new Error(message.error);
            }
            yield message;

            // message will be done in the case of chat and generate
            // message will be success in the case of a progress response (pull, push, create)
            if ((message).done || (message).status === 'success') {
            return;
            }
        }
        throw new Error('Did not receive done or success response in stream.');
        })();
    } else {
        const message = await itr.next();
        if (!message.value.done && (message.value).status !== 'success') {
        throw new Error('Expected a completed response.');
        }
        return message.value;
    }
}
