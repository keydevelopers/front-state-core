export function* counter(start: number): Generator<number, void, unknown> {
    while (true) {
        if (start === Number.MAX_SAFE_INTEGER) 
            throw new TypeError('counter overflow')
        yield start++
    };
}
