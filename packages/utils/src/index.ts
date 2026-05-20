export type Success<T> = { 
    data: T, 
    err: null 
};

export type Failure<E> = { 
    data: null, 
    err: E
}; 

export type Result<T, E = Error> = Success<T> | Failure<E>; 

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> { 
    try {
        const res = await promise; 
        return { data: res, err: null };
    } catch(err) { 
        return { data: null, err: err as E };
    }
}
