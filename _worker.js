const TELEGRAM_API = 'https://api.telegram.org';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/lead') {
      if (request.method !== 'POST') {
        return json({ ok: false, error: 'Method not allowed' }, 405);
      }

      try {
        const body = await request.json();
        const name = String(body.name || '').trim();
        const phone = String(body.phone || '').trim();
        const plot = String(body.plot || '').trim();
        const area = String(body.area || '').trim();
        const comment = String(body.comment || '').trim();

        if (!name || !phone || !plot) {
          return json({ ok: false, error: 'Required fields are missing' }, 400);
        }

        const text = [
          '🔔 Новая заявка с сайта «Домстрой»',
          '',
          `👤 Имя: ${name || '—'}`,
          `📞 Телефон: ${phone || '—'}`,
          `🏡 Участок: ${plot || '—'}`,
          `📐 Площадь: ${area || 'не указана'}`,
          `💬 Комментарий: ${comment || 'не указан'}`,
          '',
          '🌐 Сайт: домстроймск.рф'
        ].join('\n');

        const tg = await fetch(`${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text
          })
        });

        const result = await tg.json();
        if (!tg.ok || !result.ok) {
          return json({ ok: false, error: 'Telegram error' }, 502);
        }

        return json({ ok: true });
      } catch (e) {
        return json({ ok: false, error: 'Bad request' }, 400);
      }
    }

    // Static site: keep the existing Worker/site behavior.
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response('Not found', { status: 404 });
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
