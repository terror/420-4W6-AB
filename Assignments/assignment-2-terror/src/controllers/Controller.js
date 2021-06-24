class Controller {
    constructor(request, response) {
        this.request = request;
        this.response = response;
    }

    getAction() {
        return this.action;
    }

    setAction(a) {
        this.action = a;
    }

    async doAction() {
        return this.action();
    }

    async error() {
        return this.response;
    }
}

module.exports = Controller;
