export const sendResponse = (reply: any, statusCode: number, data: any) => {
  reply
    .code(statusCode)
    .header("Content-Type", "application/json")
    .send(JSON.stringify({ status: statusCode === 200 ? "success" : "error", data }));
}