export default (maxAge = 10000, promise = true) => {
    return {
        maxAge,
        promise,
        normalizer: (a: any[]) => {
            return JSON.stringify(a);
        },
    };
};
