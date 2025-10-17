// Простейший in-memory кэш
const cache = {};

export default async function handler(req, res) {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: 'username обязателен' });
  }

  // Если уже есть в кэше — возвращаем мгновенно
  if (cache[username]) {
    return res.status(200).json({ ...cache[username], cached: true });
  }

  try {
    // 1️⃣ Получаем userId по username
    const userRes = await fetch(`https://api.roblox.com/users/get-by-username?username=${username}`);
    const userData = await userRes.json();

    if (!userData.Id) {
      return res.status(404).json({
        previous_usernames: 0,
        list: [],
        message: 'Пользователь не найден'
      });
    }

    const userId = userData.Id;

    // 2️⃣ Получаем историю никнеймов
    const historyRes = await fetch(`https://users.roblox.com/v1/users/${userId}/username-history`);
    const historyData = await historyRes.json();

    const list = historyData.data?.map(entry => entry.name) || [];

    const result = {
      previous_usernames: list.length,
      list,
      message: list.length === 0 ? 'История никнеймов отсутствует или недоступна' : 'OK'
    };

    // 3️⃣ Сохраняем в кэш (in-memory)
    cache[username] = result;

    return res.status(200).json(result);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      previous_usernames: 0,
      list: [],
      message: 'Ошибка при получении данных Roblox'
    });
  }
}
