// Кэш с TTL (1 час)
const cache = {};
const TTL = 3600 * 1000; // 1 час в миллисекундах

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId || !/^\d+$/.test(userId)) {
    return res.status(400).json({ error: 'userId должен быть числом' });
  }

  // Проверяем кэш
  const now = Date.now();
  const cached = cache[userId];
  if (cached && now - cached.timestamp < TTL) {
    return res.status(200).json({ ...cached.data, cached: true });
  }

  try {
    const url = `https://users.roblox.com/v1/users/${userId}/username-history`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ошибка Roblox API: ${response.status}`);
    }

    const data = await response.json();
    const list = data.data?.map(entry => entry.name) || [];

    const result = {
      previous_usernames: list.length,
      list,
      message: list.length === 0
        ? 'История никнеймов отсутствует или недоступна'
        : 'OK'
    };

    // Кэшируем результат
    cache[userId] = { data: result, timestamp: now };

    return res.status(200).json(result);

  } catch (err) {
    console.error('Ошибка:', err.message);
    return res.status(500).json({
      previous_usernames: 0,
      list: [],
      message: 'Ошибка при получении данных с Roblox API'
    });
  }
}
