
async function  fetchData() {
const res = await fetch("https://api.blackbox.ai/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer sk-MR7vZNICsqRXJZS6w_BhMw`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ prompt: "hello" }),
});

}
fetchData();
