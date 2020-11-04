export default (maxAge = 4000, promise = true) => {
    return {
        maxAge,
        promise,
        normalizer: (a: any[]) => {
            return JSON.stringify(a);
        },
    };
};
