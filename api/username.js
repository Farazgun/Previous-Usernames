export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId || !/^\d+$/.test(userId)) {
    return res.status(400).json({ error: 'userId должен быть числом' });
  }

  try {
    const url = `https://users.roblox.com/v1/users/${userId}/username-history`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ошибка API Roblox: ${response.status}`);
    }

    const data = await response.json();
    const list = data.data.map(entry => entry.name);
    const previous_usernames = list.length;

    return res.status(200).json({ previous_usernames, list });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ previous_usernames: 0, list: [] });
  }
}
