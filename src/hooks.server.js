import { dbConnect } from "$lib/mongo-connect";

await dbConnect();

export const handle = async ({ event, resolve }) => {
    const response = await resolve(event);
    return response;
};