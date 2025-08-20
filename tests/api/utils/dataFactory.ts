// utils/dataFactory.ts
export function uniqueUser() {
    const ts = Date.now();

    return {
        userName: `qa_${ts}`,
        password: `Str0ng!Pass_${ts}`,
    };
}