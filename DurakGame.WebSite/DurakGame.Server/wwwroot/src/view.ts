export class View {
    greeting: string
    constructor(message: string) {
        this.greeting = message;
    }

    greet() {
        return "Hello " + this.greeting;
    }
}