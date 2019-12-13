import createHash from 'create-hash';

export const sha256 = (
    buffer:
        | string
        | Buffer
        | Uint8Array
        | Uint8ClampedArray
        | Uint16Array
        | Uint32Array
        | Int8Array
        | Int16Array
        | Int32Array
        | Float32Array
        | Float64Array
        | DataView
) => {
    return createHash('sha256')
        .update(buffer)
        .digest();
};
