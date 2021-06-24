class Response {
    constructor(statusCode = 200, message = '', payload = {}) {
        this.statusCode = statusCode;
        this.message = message;
        this.payload = payload;
    }

    getStatusCode() {
        return this.statusCode;
    }

    getMessage() {
        return this.message;
    }

    getPayload() {
        return this.payload;
    }

    setResponse(r) {
        this.statusCode = r.statusCode;
        this.message = r.message;
        this.payload = r.payload;
    }

    toString() {
        return JSON.stringify({
            statusCode: this.statusCode,
            message: this.message,
            payload: this.payload,
        });
    }
}

module.exports = Response;
