export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    res.status(400).json({ error: "userId не указан" });
    return;
  }

  try {
    const response = await fetch(`https://users.roproxy.com/v1/users/${userId}/username-history`);

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).json({ error: 'Ошибка при запросе к RoProxy', details: text });
      return;
    }

    const data = await response.json();
    const previousUsernamesCount = data.data ? data.data.length : 0;

    res.status(200).json({ count: previousUsernamesCount });
  } catch (error) {
    res.status(500).json({ error: 'fetch failed', details: error.message });
  }
}
